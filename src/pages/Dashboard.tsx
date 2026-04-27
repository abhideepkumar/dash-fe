import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Toaster, toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
// Unified components (Chat mode)
import { ActivityStream, type ActivityTurn } from '../components/Unified/ActivityStream';
import { CommandBar, type CommandBarHandle } from '../components/Unified/CommandBar';
// Dashboard mode components
import { DashboardCanvas } from '../components/DashboardMode/DashboardCanvas';
import { ClarificationDialog } from '../components/DashboardMode/ClarificationDialog';
import { type DashboardPanelData } from '../components/DashboardMode/DashboardPanel';
import wizardLoadingVideo from '../assets/wizardLoading.mp4';
import { Loader2, MessageSquare, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ──────────────────────────────────────────────────────────────────────

type AppMode = 'chat' | 'dashboard';

interface PendingReply {
  label: string;
  history: Array<{ query: string; sql: string }>;
}

interface DashboardState {
  status: 'idle' | 'planning' | 'clarifying' | 'executing' | 'done' | 'error';
  blueprintId: string | null;
  dashboardTitle: string;
  sharedContext: any;
  clarifyingQuestions: string[];
  panels: DashboardPanelData[];
  error: string | null;
}

const INITIAL_DASHBOARD: DashboardState = {
  status: 'idle',
  blueprintId: null,
  dashboardTitle: '',
  sharedContext: {},
  clarifyingQuestions: [],
  panels: [],
  error: null,
};

// ── Component ───────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // Sync State
  const [syncStatus, setSyncStatus] = useState<string>('complete');
  const [syncProgress, setSyncProgress] = useState<any>(null);

  // Mode toggle
  const [mode, setMode] = useState<AppMode>('chat');

  // ── Chat mode state ──────────────────────────────────────────────────────
  const [stream, setStream] = useState<ActivityTurn[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingReply, setPendingReply] = useState<PendingReply | null>(null);

  // ── Dashboard mode state ─────────────────────────────────────────────────
  const [dashboard, setDashboard] = useState<DashboardState>(INITIAL_DASHBOARD);

  const commandBarRef = useRef<CommandBarHandle>(null);
  const sessionId = user?.id ? `user_${user.id}` : null;

  // Auto-run query from URL param "q"
  useEffect(() => {
    const query = searchParams.get('q');
    if (query && sessionId && !isProcessing && stream.length === 0) {
      handleChatCommand(query);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('q');
      setSearchParams(newParams, { replace: true });
    }
  }, [sessionId, searchParams]);

  // ============================================================================
  // CHAT MODE — existing pipeline (unchanged)
  // ============================================================================

  const runQuery = async (
    query: string,
    history: Array<{ query: string; sql: string }>,
    onSuccess: (uiSpec: any, sql: string) => void,
    onError: (msg: string) => void,
    onFinally?: () => void
  ) => {
    try {
      if (!sessionId) throw new Error("Invalid session");

      const genData = await api.query.generate(sessionId, query, history);
      if (!genData.success) throw new Error(genData.message);

      if (genData.cannotAnswer) {
        onSuccess({
          cannotAnswer: true,
          reason: genData.reason,
          suggestions: genData.suggestions,
        }, "");
        return;
      }

      const { requestId, sql } = genData;
      const execData = await api.query.execute(sessionId, sql, requestId);
      if (!execData.success) throw new Error(execData.message);

      const visData = await api.query.visualize({
        originalQuery: query,
        sql,
        rows: execData.rows,
        fields: execData.fields,
        requestId,
        sessionId,
      });
      if (!visData.success) throw new Error(visData.message);

      onSuccess(visData.uiSpec, sql);
    } catch (err: any) {
      if (err.message?.includes('synchronization in progress')) {
        setSyncStatus('syncing');
        setSyncProgress({ stage: 'enriching', current: 1, total: 10 });
      } else {
        console.error("Technical Error during Dashboard Query Operation:", err);
        onError("We encountered an issue processing your request. Please try rephrasing or ask another question.");
      }
    } finally {
      onFinally?.();
    }
  };

  const handleChatCommand = async (query: string) => {
    if (!query.trim() || isProcessing) return;
    if (!sessionId) { toast.error("User session not ready"); return; }

    const replyContext = pendingReply;
    setPendingReply(null);
    setIsProcessing(true);

    const turnId = crypto.randomUUID();
    const contextHistory = replyContext?.history ?? [];

    const newTurn: ActivityTurn = {
      id: turnId, query, uiSpec: null, sql: '',
      history: contextHistory, isProcessing: true, error: null, createdAt: new Date(),
    };
    setStream(prev => [...prev, newTurn]);

    await runQuery(query, contextHistory,
      (uiSpec, sql) => {
        setStream(prev => prev.map(t => {
          if (t.id !== turnId) return t;
          if (uiSpec.cannotAnswer) {
            return { ...t, cannotAnswer: true, fallbackReason: uiSpec.reason, suggestions: uiSpec.suggestions, isProcessing: false, error: null };
          }
          return { ...t, uiSpec, sql, isProcessing: false, error: null };
        }));
      },
      (msg) => {
        setStream(prev => prev.map(t => t.id === turnId ? { ...t, isProcessing: false, error: msg } : t));
        toast.error(msg);
      },
      () => setIsProcessing(false)
    );
  };

  const handleReply = (turn: ActivityTurn) => {
    const replyHistory = [...turn.history, { query: turn.query, sql: turn.sql }];
    setPendingReply({ label: turn.query, history: replyHistory });
    commandBarRef.current?.focus();
  };

  // ============================================================================
  // DASHBOARD MODE — new pipeline
  // ============================================================================

  const handleDashboardCommand = async (query: string) => {
    if (!query.trim() || dashboard.status === 'planning' || dashboard.status === 'executing') return;
    if (!sessionId) { toast.error("User session not ready"); return; }

    // Reset and start planning
    setDashboard({ ...INITIAL_DASHBOARD, status: 'planning', dashboardTitle: query });
    setIsProcessing(true);

    try {
      const planData = await api.dashboard.plan(sessionId, query);

      if (!planData.success) throw new Error(planData.message);

      // Unanswerable query
      if (planData.cannotAnswer) {
        setDashboard(prev => ({
          ...prev,
          status: 'error',
          error: planData.reason || 'This query cannot be answered with the available data.',
        }));
        setIsProcessing(false);
        return;
      }

      // Clarification needed — show dialog, wait for user
      if (planData.clarificationNeeded && planData.clarifyingQuestions?.length > 0) {
        setDashboard(prev => ({
          ...prev,
          status: 'clarifying',
          blueprintId: planData.blueprintId,
          dashboardTitle: planData.dashboardTitle,
          sharedContext: planData.sharedContext,
          clarifyingQuestions: planData.clarifyingQuestions,
        }));
        setIsProcessing(false);
        return;
      }

      // No clarification needed — go straight to execute
      await runDashboardExecute(planData.blueprintId, planData.dashboardTitle, planData.sharedContext, {});

    } catch (err: any) {
      toast.error(err.message || 'Dashboard generation failed.');
      setDashboard(prev => ({ ...prev, status: 'error', error: err.message }));
      setIsProcessing(false);
    }
  };

  const handleClarificationSubmit = async (answers: Record<string, string>) => {
    if (!dashboard.blueprintId) return;
    setDashboard(prev => ({ ...prev, status: 'executing' }));
    setIsProcessing(true);
    await runDashboardExecute(dashboard.blueprintId, dashboard.dashboardTitle, dashboard.sharedContext, answers);
  };

  const runDashboardExecute = async (
    blueprintId: string,
    dashboardTitle: string,
    sharedContext: any,
    answers: Record<string, string>
  ) => {
    // We don't know panel count yet — show placeholder loading panels (4)
    const loadingPlaceholders: DashboardPanelData[] = Array.from({ length: 4 }, (_, i) => ({
      id: `loading_${i}`,
      title: '...',
      suggestedType: i === 0 ? 'Card' : i === 3 ? 'Table' : 'BarChart',
      uiSpec: null,
      sql: null,
      error: null,
      isLoading: true,
    }));

    setDashboard(prev => ({
      ...prev,
      status: 'executing',
      blueprintId,
      dashboardTitle,
      sharedContext,
      panels: loadingPlaceholders,
    }));

    try {
      const execData = await api.dashboard.execute(sessionId!, blueprintId, answers);
      if (!execData.success) throw new Error(execData.message);

      // Map backend component results to DashboardPanelData
      const panels: DashboardPanelData[] = execData.components.map((comp: any) => ({
        id: comp.id,
        title: comp.title,
        suggestedType: comp.suggestedType,
        uiSpec: comp.uiSpec,
        sql: comp.sql,
        error: comp.error,
        isLoading: false,
      }));

      setDashboard(prev => ({
        ...prev,
        status: 'done',
        dashboardTitle: execData.dashboardTitle || dashboardTitle,
        sharedContext: execData.sharedContext || sharedContext,
        panels,
      }));
    } catch (err: any) {
      toast.error(err.message || 'Failed to build dashboard.');
      setDashboard(prev => ({ ...prev, status: 'error', error: err.message, panels: [] }));
    } finally {
      setIsProcessing(false);
    }
  };

  // Combined command handler — routes to chat or dashboard based on mode
  const handleCommand = (query: string) => {
    if (mode === 'dashboard') {
      handleDashboardCommand(query);
    } else {
      handleChatCommand(query);
    }
  };

  // ============================================================================
  // SYNC LOADING SCREEN
  // ============================================================================

  if (syncStatus === 'pending' || syncStatus === 'syncing') {
    return (
      <div className="flex-1 bg-surface flex items-center justify-center p-6 h-full">
        <div className="max-w-2xl w-full text-center space-y-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold font-headline text-on-surface">Setting up your database...</h2>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/20 w-full max-w-md aspect-video">
            <video src={wizardLoadingVideo} autoPlay loop muted playsInline className="w-full h-full object-cover" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary font-medium">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{syncProgress?.currentTable ? `Analyzing ${syncProgress.currentTable}...` : 'Initializing...'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN LAYOUT
  // ============================================================================

  const isDashboardBusy = dashboard.status === 'planning' || dashboard.status === 'executing';

  return (
    <div className="flex flex-col h-full bg-surface dark:bg-background relative w-full overflow-hidden">
      <Toaster position="top-center" />

      {/* ── Mode Toggle Bar — sticky below the fixed top nav ───────────── */}
      <div className="shrink-0 flex items-center justify-between px-6 lg:px-8 py-2.5 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
        <ModeToggle mode={mode} onChange={(m) => {
          setMode(m);
          if (m === 'chat') setDashboard(INITIAL_DASHBOARD);
        }} />

        <div className="flex gap-2">
          {mode === 'chat' && stream.length > 0 && (
            <button
              onClick={() => { setStream([]); setPendingReply(null); }}
              className="px-3.5 py-1.5 rounded-full border border-slate-200/80 text-slate-500 text-xs font-medium hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
              Clear
            </button>
          )}
          {mode === 'dashboard' && dashboard.status === 'done' && (
            <button
              onClick={() => setDashboard(INITIAL_DASHBOARD)}
              className="px-3.5 py-1.5 rounded-full border border-slate-200/80 text-slate-500 text-xs font-medium hover:border-violet-200 hover:text-violet-600 hover:bg-violet-50 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              New Dashboard
            </button>
          )}
        </div>
      </div>

      {/* ── Main Scrollable Area ─────────────────────────────────────────── */}
      <section className="flex-1 overflow-y-auto" id="main-canvas">
        <AnimatePresence mode="wait">

          {/* CHAT MODE — centered, max-w-5xl */}
          {mode === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="max-w-5xl mx-auto px-6 lg:px-10 pt-6 h-full flex flex-col"
            >
              <div className="flex-1 w-full">
                <ActivityStream stream={stream} onReply={handleReply} onCommand={handleCommand} />
              </div>
            </motion.div>
          )}

          {/* DASHBOARD MODE — full width */}
          {mode === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full"
            >
              {dashboard.status === 'idle' && <DashboardIdlePrompt />}

              {(dashboard.status === 'planning' || dashboard.status === 'executing') && (
                <DashboardLoadingState
                  message={dashboard.status === 'planning'
                    ? 'Analyzing your query & building dashboard blueprint...'
                    : 'Running all charts in parallel...'}
                />
              )}

              {dashboard.status === 'clarifying' && (
                <div className="flex items-center justify-center pt-10 pb-4 px-6">
                  <ClarificationDialog
                    questions={dashboard.clarifyingQuestions}
                    dashboardTitle={dashboard.dashboardTitle}
                    onSubmit={handleClarificationSubmit}
                    isLoading={isProcessing}
                  />
                </div>
              )}

              {dashboard.status === 'error' && (
                <div className="flex flex-col items-center justify-center pt-16 gap-3 text-center px-6">
                  <span className="material-symbols-outlined text-[40px] text-red-400">error_outline</span>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm leading-relaxed">{dashboard.error}</p>
                  <button
                    onClick={() => setDashboard(INITIAL_DASHBOARD)}
                    className="mt-2 px-4 py-2 rounded-xl text-sm font-medium text-violet-600 border border-violet-200 hover:bg-violet-50 transition-colors"
                  >Try again</button>
                </div>
              )}

              {dashboard.status === 'done' && dashboard.panels.length > 0 && (
                <DashboardCanvas
                  dashboardTitle={dashboard.dashboardTitle}
                  sharedContext={dashboard.sharedContext}
                  panels={dashboard.panels}
                />
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </section>

      {/* ── Command Bar ──────────────────────────────────────────────────── */}
      <CommandBar
        ref={commandBarRef}
        onSubmit={handleCommand}
        isProcessing={isProcessing || isDashboardBusy}
        pendingReply={mode === 'chat' ? pendingReply : null}
        onClearReply={() => setPendingReply(null)}
      />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ModeToggle({ mode, onChange }: { mode: AppMode; onChange: (m: AppMode) => void }) {
  return (
    <div className="inline-flex items-center gap-0.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
      {(['chat', 'dashboard'] as AppMode[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`
            relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
            ${mode === m
              ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }
          `}
        >
          {m === 'chat'
            ? <MessageSquare size={14} />
            : <LayoutDashboard size={14} />
          }
          {m === 'chat' ? 'Chat' : 'Dashboard'}
        </button>
      ))}
    </div>
  );
}

function DashboardIdlePrompt() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center pt-20 pb-8 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 flex items-center justify-center mb-4 shadow-sm">
        <LayoutDashboard size={28} className="text-violet-600 dark:text-violet-400" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Dashboard Mode</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
        Ask any analytical question and I'll build a full dashboard with multiple charts, KPIs, and insights — all in one go.
      </p>
      <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 italic">
        Try: "Show sales figures of best-selling products"
      </p>
    </motion.div>
  );
}

function DashboardLoadingState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center pt-20 gap-4"
    >
      {/* Animated grid skeleton */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-xl opacity-60">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            className={`rounded-xl bg-slate-100 dark:bg-slate-800 ${i === 2 ? 'col-span-2 h-20' : 'h-24'}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Loader2 size={16} className="animate-spin text-violet-500" />
        {message}
      </div>
    </motion.div>
  );
}

export default DashboardPage;
