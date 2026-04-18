import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Toaster, toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
// unified components
import { ActivityStream, type ActivityTurn } from '../components/Unified/ActivityStream';
import { CommandBar, type CommandBarHandle } from '../components/Unified/CommandBar';
import wizardLoadingVideo from '../assets/wizardLoading.mp4';
import { Loader2 } from 'lucide-react';

interface PendingReply {
  label: string;
  history: Array<{ query: string; sql: string }>;
}

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  // Sync State
  const [syncStatus, setSyncStatus] = useState<string>('complete');
  const [syncProgress, setSyncProgress] = useState<any>(null);

  // Unified Stream state
  const [stream, setStream] = useState<ActivityTurn[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Reply context state — set when user clicks "Reply" on a specific chart
  const [pendingReply, setPendingReply] = useState<PendingReply | null>(null);

  const commandBarRef = useRef<CommandBarHandle>(null);
  const sessionId = user?.id ? `user_${user.id}` : null;

  // Auto-run query from URL param "q"
  useEffect(() => {
    const query = searchParams.get('q');
    if (query && sessionId && !isProcessing && stream.length === 0) {
      handleCommand(query);
      // Clean up the URL after starting execution
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('q');
      setSearchParams(newParams, { replace: true });
    }
  }, [sessionId, searchParams]);

  // ===========================================================================
  // Core query runner
  // ===========================================================================

  const runQuery = async (
    query: string,
    history: Array<{query: string, sql: string}>,
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
          suggestions: genData.suggestions 
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

  // ===========================================================================
  // Main command handler
  // - Global bar (no pendingReply): sends empty history → fresh query
  // - Global bar (with pendingReply): uses pendingReply.history → chart follow-up
  // ===========================================================================

  const handleCommand = async (query: string) => {
    if (!query.trim() || isProcessing) return;
    if (!sessionId) {
      toast.error("User session not ready");
      return;
    }

    // Capture and immediately clear pendingReply so UI resets instantly
    const replyContext = pendingReply;
    setPendingReply(null);
    setIsProcessing(true);

    const turnId = crypto.randomUUID();
    // Use reply context history if available, otherwise send empty (fresh query)
    const contextHistory = replyContext?.history ?? [];

    const newTurn: ActivityTurn = {
      id: turnId,
      query,
      uiSpec: null,
      sql: '',
      history: contextHistory,
      isProcessing: true,
      error: null,
      createdAt: new Date(),
    };

    setStream(prev => [...prev, newTurn]);

    await runQuery(
      query,
      contextHistory,
      (uiSpec, sql) => {
        setStream(prev => prev.map(t => {
          if (t.id !== turnId) return t;
          
          if (uiSpec.cannotAnswer) {
            return {
              ...t,
              cannotAnswer: true,
              fallbackReason: uiSpec.reason,
              suggestions: uiSpec.suggestions,
              isProcessing: false,
              error: null
            };
          }

          return { ...t, uiSpec, sql, isProcessing: false, error: null };
        }));
      },
      (msg) => {
        setStream(prev => prev.map(t =>
          t.id === turnId ? { ...t, isProcessing: false, error: msg } : t
        ));
        toast.error(msg);
      },
      () => setIsProcessing(false)
    );
  };

  // ===========================================================================
  // Reply handler — called when user clicks "Reply" on a chart
  // ===========================================================================

  const handleReply = (turn: ActivityTurn) => {
    // Build explicit history chain: this turn's prior history + this turn itself
    const replyHistory = [
      ...turn.history,
      { query: turn.query, sql: turn.sql },
    ];

    setPendingReply({ label: turn.query, history: replyHistory });
    // Focus the command bar so the user can start typing immediately
    commandBarRef.current?.focus();
  };

  // ===========================================================================
  // Sync Loading Screen
  // ===========================================================================

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

  // ===========================================================================
  // Main Unified Layout
  // ===========================================================================

  return (
    <div className="flex flex-col h-full bg-surface dark:bg-background relative w-full overflow-hidden">
      <Toaster position="top-center" />

      {/* Main Scrollable Canvas */}
      <section className="flex-1 h-full overflow-y-auto" id="conversation-canvas">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 h-full flex flex-col pt-10">
          
          {/* Header */}
          <header className="flex justify-between items-end mb-8 shrink-0">            
            <div className="flex gap-3">
              {stream.length > 0 && (
                <button
                  onClick={() => { setStream([]); setPendingReply(null); }}
                  className="px-4 py-2 rounded-full border border-outline-variant/20 text-outline text-sm font-medium hover:border-error/30 hover:text-error hover:bg-error/5 transition-all flex items-center gap-2 shadow-sm bg-white/50"
                  title="Clear conversation"
                >
                  <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                  Clear History
                </button>
              )}
            </div>
          </header>

          {/* Stream Feed */}
          <div className="flex-1 w-full">
            <ActivityStream stream={stream} onReply={handleReply} onCommand={handleCommand} />
          </div>

        </div>
      </section>

      {/* Unified Command Bar */}
      <CommandBar
        ref={commandBarRef}
        onSubmit={handleCommand}
        isProcessing={isProcessing}
        pendingReply={pendingReply}
        onClearReply={() => setPendingReply(null)}
      />
    </div>
  );
}

export default DashboardPage;
