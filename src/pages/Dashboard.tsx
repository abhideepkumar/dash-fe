import { useState, useRef } from 'react';
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { DashboardPanel, type Panel } from "../components/DashboardPanel";
import wizardLoadingVideo from '../assets/wizardLoading.mp4';
import { Loader2 } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  
  // Sync State
  const [syncStatus, setSyncStatus] = useState<string>('complete');
  const [syncProgress, setSyncProgress] = useState<any>(null);

  // Multi-panel state
  const [panels, setPanels] = useState<Panel[]>([]);
  const [isSidebarProcessing, setIsSidebarProcessing] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const sessionId = user?.id ? `user_${user.id}` : null;

  // ===========================================================================
  // Helpers
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
  // New Panel Flow (sidebar chat → adds panel to canvas)
  // ===========================================================================

  const handleSearchSubmit = async (e?: React.FormEvent, forcedQuery?: string) => {
    e?.preventDefault();
    const queryToProcess = forcedQuery !== undefined ? forcedQuery : searchQuery;
    if (!queryToProcess.trim() || isSidebarProcessing) return;

    if (!sessionId) {
      toast.error("User session not ready");
      return;
    }

    const userMsg = queryToProcess;
    setSearchQuery('');
    setIsSidebarProcessing(true);
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatHistory(prev => [...prev, { role: 'ai', content: 'Thinking...' }]);

    // Create a placeholder panel immediately so the user sees something
    const panelId = crypto.randomUUID();
    const placeholderPanel: Panel = {
      id: panelId,
      originalQuery: userMsg,
      uiSpec: null,
      sql: '',
      history: [],
      isProcessing: true,
      error: null,
      createdAt: new Date(),
    };
    setPanels(prev => [...prev, placeholderPanel]);

    // Scroll canvas to bottom
    setTimeout(() => {
      canvasRef.current?.scrollTo({ top: canvasRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);

    await runQuery(
      userMsg,
      [], // No history for new panels
      (uiSpec, sql) => {
        // Update the panel with the result
        setPanels(prev => prev.map(p =>
          p.id === panelId
            ? { ...p, uiSpec, sql, isProcessing: false, error: null }
            : p
        ));
        setChatHistory(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'ai',
            content: `Chart added to your dashboard. I've visualized the data below. Ask a follow-up directly on the chart!`,
          };
          return updated;
        });
      },
      (msg) => {
        // Error — update panel with error state
        setPanels(prev => prev.map(p =>
          p.id === panelId
            ? { ...p, isProcessing: false, error: msg }
            : p
        ));
        toast.error(msg);
        setChatHistory(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'ai', content: `Error: ${msg}` };
          return updated;
        });
      },
      () => setIsSidebarProcessing(false)
    );
  };

  // ===========================================================================
  // Follow-up Flow (panel inline bar → updates panel in place)
  // ===========================================================================

  const handlePanelFollowUp = async (panelId: string, query: string) => {
    const targetPanel = panels.find(p => p.id === panelId);
    if (!targetPanel || !sessionId) return;

    // The history for this follow-up: all previous (query, sql) pairs for this panel
    const followUpHistory = [
      // Seed with original query to give full context
      { query: targetPanel.originalQuery, sql: targetPanel.sql },
      ...targetPanel.history,
    ];

    // Mark this specific panel as processing
    setPanels(prev => prev.map(p =>
      p.id === panelId ? { ...p, isProcessing: true, error: null } : p
    ));

    await runQuery(
      query,
      followUpHistory,
      (uiSpec, sql) => {
        setPanels(prev => prev.map(p => {
          if (p.id !== panelId) return p;
          return {
            ...p,
            uiSpec,
            sql,
            isProcessing: false,
            error: null,
            // Append this turn to the panel's history for future follow-ups
            history: [...p.history, { query, sql }],
          };
        }));
      },
      (msg) => {
        setPanels(prev => prev.map(p =>
          p.id === panelId ? { ...p, isProcessing: false, error: msg } : p
        ));
        toast.error(msg);
      }
    );
  };

  // ===========================================================================
  // Remove Panel
  // ===========================================================================

  const handleRemovePanel = (panelId: string) => {
    setPanels(prev => prev.filter(p => p.id !== panelId));
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
  // Main Layout
  // ===========================================================================

  return (
    <>
      <Toaster position="top-center" />

      {/* Canvas (70%) */}
      <section ref={canvasRef} className="w-[70%] h-full p-10 overflow-y-auto bg-surface relative">
        <div className="max-w-5xl mx-auto space-y-10">

          {/* Header */}
          <header className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="tracking-widest uppercase text-[11px] font-label text-primary font-bold">Workspace Canvas</span>
              <h1 className="text-5xl font-headline font-bold tracking-tight text-on-surface">
                {panels.length > 0 ? 'Dashboard' : 'Financial Performance'}
                {panels.length === 0 && <span className="text-primary/40 font-light"> Q3</span>}
              </h1>
              {panels.length > 0 && (
                <p className="text-sm text-outline">
                  {panels.length} chart{panels.length !== 1 ? 's' : ''} · Ask follow-ups directly on each chart
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {panels.length > 0 && (
                <button
                  onClick={() => setPanels([])}
                  className="px-4 py-2 rounded-full border border-outline-variant/20 text-outline text-sm font-medium hover:border-error/30 hover:text-error hover:bg-error/5 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">clear_all</span>
                  Clear all
                </button>
              )}
              <button className="p-3 rounded-full bg-white border border-outline-variant/20 shadow-sm hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-lg">share</span>
              </button>
              <button className="p-3 rounded-full bg-white border border-outline-variant/20 shadow-sm hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-lg">download</span>
              </button>
            </div>
          </header>

          {/* Panels Feed */}
          <AnimatePresence mode="popLayout">
            {panels.length === 0 ? (
              <motion.div
                key="mock"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Static Mock Dashboard (shown when no panels yet) */}
                <div className="glass-canvas rounded-xl p-8 editorial-shadow border border-white/40 shadow-[0_40px_60px_rgba(0,66,43,0.04)] mb-8">
                  <div className="flex justify-between items-start mb-12">
                    <div>
                      <h3 className="text-xl font-headline font-semibold text-on-surface">Monthly Recurring Revenue</h3>
                      <p className="text-sm text-outline">Projected vs Actual growth trends</p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-headline font-bold text-primary">$428,500</span>
                      <div className="flex items-center justify-end text-primary gap-1 text-xs font-bold">
                        <span className="material-symbols-outlined text-xs">trending_up</span>
                        <span>+12.4% YoY</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-64 w-full relative flex items-end gap-1">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                      <div className="border-t border-outline"></div>
                      <div className="border-t border-outline"></div>
                      <div className="border-t border-outline"></div>
                      <div className="border-t border-outline"></div>
                    </div>
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
                      <defs>
                        <linearGradient id="chartGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                          <stop offset="0%" style={{ stopColor: 'rgba(16, 185, 129, 0.2)', stopOpacity: 1 }}></stop>
                          <stop offset="100%" style={{ stopColor: 'rgba(16, 185, 129, 0)', stopOpacity: 1 }}></stop>
                        </linearGradient>
                      </defs>
                      <path d="M0,150 Q100,140 200,160 T400,120 T600,100 T800,40 T1000,20" fill="none" stroke="#006c49" strokeLinecap="round" strokeWidth="4"></path>
                      <path d="M0,150 Q100,140 200,160 T400,120 T600,100 T800,40 T1000,20 L1000,200 L0,200 Z" fill="url(#chartGradient)"></path>
                    </svg>
                    <div className="flex-1 text-[10px] text-outline text-center mt-4 pt-64 flex justify-between px-2">
                      <span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span><span>NOV</span><span>DEC</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-5 bg-white rounded-xl p-8 border border-outline-variant/10 shadow-[0_40px_60px_rgba(0,66,43,0.04)]">
                    <div className="flex justify-between items-center mb-6">
                      <div className="w-12 h-12 rounded-full bg-error-container/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-error">analytics</span>
                      </div>
                      <span className="text-[10px] font-label font-bold tracking-widest text-outline uppercase">Active Metric</span>
                    </div>
                    <h4 className="text-sm font-medium text-outline mb-1">Churn Rate</h4>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-headline font-bold text-on-surface">1.8%</span>
                      <span className="text-sm text-error font-bold">-0.2%</span>
                    </div>
                    <p className="text-xs text-outline mt-4 leading-relaxed">Improved by 20 basis points compared to Q2, driven by new retention campaigns.</p>
                  </div>
                  <div className="col-span-7 bg-primary rounded-xl p-8 relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-6">
                        <span className="material-symbols-outlined text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        <span className="text-[10px] font-label font-bold tracking-widest text-primary-fixed uppercase">Automated Insight</span>
                      </div>
                      <h3 className="text-xl font-headline font-semibold text-on-primary mb-4">Mid-Market expansion is driving 64% of new MRR.</h3>
                      <p className="text-sm text-primary-fixed/80 leading-relaxed max-w-md">The "Enterprise Light" tier has seen a 40% uptick in adoption this quarter. Consider reallocating ad spend toward this segment for Q4.</p>
                    </div>
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-container blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  </div>
                </div>
              </motion.div>
            ) : (
              panels.map((panel, index) => (
                <DashboardPanel
                  key={panel.id}
                  panel={panel}
                  index={index}
                  onFollowUp={(query) => handlePanelFollowUp(panel.id, query)}
                  onRemove={() => handleRemovePanel(panel.id)}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Assistant Panel (30%) */}
      <section className="w-[30%] h-full bg-surface-container-low border-l border-outline-variant/10 flex flex-col relative">
        <div className="p-6 border-b border-outline-variant/10 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <h2 className="font-headline font-bold text-on-surface">AI Assistant</h2>
            {panels.length > 0 && (
              <span className="ml-auto text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-primary/20">
                {panels.length} chart{panels.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-[11px] text-outline mt-1">
            Type below to add new charts · Ask follow-ups directly on each chart
          </p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-start space-y-3 opacity-60">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] text-on-primary-container font-medium">auto_awesome</span>
                </div>
                <span className="text-[11px] font-label font-bold text-primary uppercase tracking-wider">Assistant</span>
              </div>
              <div className="bg-primary/5 rounded-2xl p-5 text-sm text-on-surface leading-relaxed border border-primary/10">
                Build your dashboard by asking questions — each query adds a new chart. Then ask follow-ups directly on any chart to refine it!
              </div>
            </div>
          ) : (
            chatHistory.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.role === 'user' ? (
                  <div className="bg-white/80 dark:bg-black/80 backdrop-blur shadow-sm rounded-2xl p-4 max-w-[85%] text-sm text-on-surface-variant border border-white/40">
                    {msg.content}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-[14px] text-on-primary-container font-medium">auto_awesome</span>
                      </div>
                      <span className="text-[11px] font-label font-bold text-primary uppercase tracking-wider">Assistant</span>
                    </div>
                    <div className="bg-primary/5 rounded-2xl p-5 text-sm text-on-surface leading-relaxed border border-primary/10 max-w-[95%]">
                      {msg.content === 'Thinking...' ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-primary font-medium italic">Building chart...</span>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-gradient-to-t from-surface-container-low via-surface-container-low to-transparent">
          <form onSubmit={handleSearchSubmit} className="relative group shadow-[0_40px_60px_rgba(0,0,0,0.04)]">
            <input
              className="w-full bg-white border border-outline-variant/20 rounded-full py-4 pl-6 pr-14 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none text-on-surface placeholder:text-outline-variant"
              placeholder="Add a new chart..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSidebarProcessing}
            />
            <button
              type="submit"
              disabled={isSidebarProcessing || !searchQuery.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">arrow_upward</span>
            </button>
          </form>
          <div className="flex justify-center gap-4 mt-4">
            <button className="text-[10px] font-bold text-outline uppercase tracking-widest hover:text-primary transition-colors">Summarize</button>
            <span className="text-outline/20">•</span>
            <button className="text-[10px] font-bold text-outline uppercase tracking-widest hover:text-primary transition-colors">Export Data</button>
            <span className="text-outline/20">•</span>
            <button className="text-[10px] font-bold text-outline uppercase tracking-widest hover:text-primary transition-colors">Share View</button>
          </div>
        </div>
      </section>
    </>
  );
}

export default DashboardPage;
