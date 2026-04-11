import { useState } from 'react';
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { DynamicRenderer } from "../components/DynamicRenderer";
import wizardLoadingVideo from '../assets/wizardLoading.mp4';
import { Loader2 } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  
  // Sync State
  const [syncStatus, setSyncStatus] = useState<string>('complete');
  const [syncProgress, setSyncProgress] = useState<any>(null);

  // Result State
  const [uiSpec, setUiSpec] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = user?.id ? `user_${user.id}` : null;

  const handleSearchSubmit = async (e?: React.FormEvent, forcedQuery?: string) => {
    e?.preventDefault();
    const queryToProcess = forcedQuery !== undefined ? forcedQuery : searchQuery;
    if (!queryToProcess.trim()) return;

    if (!sessionId) {
      toast.error("User session not ready");
      return;
    }

    setChatHistory(prev => [...prev, { role: 'user', content: queryToProcess }]);
    setSearchQuery('');
    processQuery(queryToProcess);
  };

  const processQuery = async (query: string) => {
    setIsProcessing(true);
    setError(null);
    
    // Simulate thinking state in chat
    setChatHistory(prev => [...prev, { role: 'ai', content: 'Thinking...' }]);
    
    try {
      if (!sessionId) throw new Error("Invalid session");

      const genData = await api.query.generate(sessionId, query);
      if (!genData.success) throw new Error(genData.message);
      
      const requestId = genData.requestId;

      const execData = await api.query.execute(sessionId, genData.sql, requestId);
      if (!execData.success) throw new Error(execData.message);

      const visData = await api.query.visualize({
          originalQuery: query,
          sql: genData.sql,
          rows: execData.rows,
          fields: execData.fields,
          requestId,
          sessionId 
      });
      
      if (!visData.success) throw new Error(visData.message);
      
      setUiSpec(visData.uiSpec);
      
      // Update chat history with success
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', content: `I've generated the requested visualization based on ${execData.rows.length} rows of data. Is there anything else you'd like to explore?` };
        return newHistory;
      });

    } catch (err: any) {
      if (err.message && err.message.includes('synchronization in progress')) {
          setSyncStatus('syncing');
          setSyncProgress({ stage: 'enriching', current: 1, total: 10, completed: false });
      } else {
          setError(err.message);
          toast.error(err.message);
          setChatHistory(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1] = { role: 'ai', content: `Error: ${err.message}` };
            return newHistory;
          });
      }
    } finally {
      setIsProcessing(false);
    }
  };

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

  return (
    <>
      <Toaster position="top-center" />
      {/* Canvas (70%) */}
      <section className="w-[70%] h-full p-10 overflow-y-auto bg-surface relative">
        <div className="max-w-5xl mx-auto space-y-10">
          <header className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="tracking-widest uppercase text-[11px] font-label text-primary font-bold">Workspace Canvas</span>
              <h1 className="text-5xl font-headline font-bold tracking-tight text-on-surface">
                {uiSpec ? uiSpec.title || 'Data Visualization' : 'Financial Performance'} {uiSpec ? null : <span className="text-primary/40 font-light">Q3</span>}
              </h1>
            </div>
            <div className="flex gap-3">
              <button className="p-3 rounded-full bg-white border border-outline-variant/20 shadow-sm hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-lg">share</span>
              </button>
              <button className="p-3 rounded-full bg-white border border-outline-variant/20 shadow-sm hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-lg">download</span>
              </button>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {uiSpec ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="glass-canvas rounded-xl p-8 editorial-shadow border border-white/40 shadow-[0_40px_60px_rgba(0,66,43,0.04)] mb-8">
                   <DynamicRenderer 
                     uiSpec={uiSpec}
                     isLoading={isProcessing}
                     error={error}
                   />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Main Mock Chart Area */}
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

                  {/* Visual Mockup of Line Chart */}
                  <div className="h-64 w-full relative flex items-end gap-1">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                      <div className="border-t border-outline"></div>
                      <div className="border-t border-outline"></div>
                      <div className="border-t border-outline"></div>
                      <div className="border-t border-outline"></div>
                    </div>
                    
                    {/* Mock Path SVG for Line */}
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
                    
                    {/* Data Points */}
                    <div className="flex-1 text-[10px] text-outline text-center mt-4 pt-64 flex justify-between px-2">
                      <span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span><span>NOV</span><span>DEC</span>
                    </div>
                  </div>
                </div>

                {/* Grid Layout for Metrics */}
                <div className="grid grid-cols-12 gap-8">
                  {/* Churn Rate Card */}
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

                  {/* Automated Insight */}
                  <div className="col-span-7 bg-primary rounded-xl p-8 relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-6">
                        <span className="material-symbols-outlined text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        <span className="text-[10px] font-label font-bold tracking-widest text-primary-fixed uppercase">Automated Insight</span>
                      </div>
                      <h3 className="text-xl font-headline font-semibold text-on-primary mb-4">Mid-Market expansion is driving 64% of new MRR.</h3>
                      <p className="text-sm text-primary-fixed/80 leading-relaxed max-w-md">The "Enterprise Light" tier has seen a 40% uptick in adoption this quarter. Consider reallocating ad spend toward this segment for Q4.</p>
                    </div>
                    {/* Aesthetic Gradient Blur */}
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-container blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  </div>
                </div>
              </motion.div>
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
          </div>
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
                 How can I help you analyze your data today? Try asking for Q3 MRR trends or user growth.
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
                            <span className="text-primary font-medium italic">Processing query...</span>
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
              placeholder="Ask a follow-up question..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isProcessing}
            />
            <button 
              type="submit" 
              disabled={isProcessing || !searchQuery.trim()}
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
