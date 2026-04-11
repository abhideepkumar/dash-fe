import { useState } from 'react';
import { 
  Loader2, 
  Share,
  Download,
  ArrowUp
} from 'lucide-react';

import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

import { DynamicRenderer } from "../components/DynamicRenderer";
import wizardLoadingVideo from '../assets/wizardLoading.mp4';
import { GlassCard } from '@/components/ui/GlassCard';

export function DashboardPage() {
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  
  // Sync State
  const [syncStatus, setSyncStatus] = useState<string>('complete'); // Assuming complete for UI demo, normally checking
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
        <div className="flex-1 bg-surface flex items-center justify-center p-6">
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
      
      {/* Left Canvas Area (70%) */}
      <section className="w-[70%] h-full p-10 overflow-y-auto bg-surface relative">
        <div className="max-w-5xl mx-auto space-y-10">
          
          <header className="flex justify-between items-end">
            <div className="space-y-1 max-w-[80%]">
              <span className="tracking-widest uppercase text-[11px] font-label text-primary font-bold">Workspace Canvas</span>
              <h1 className="text-5xl font-headline font-bold tracking-tight text-on-surface">
                {uiSpec ? uiSpec.title || 'Data Visualization' : 'Empty Canvas'}
              </h1>
            </div>
            <div className="flex gap-3">
              <button className="p-3 rounded-full bg-surface-container-lowest border border-outline-variant/20 shadow-sm hover:bg-surface-container-low transition-colors text-outline hover:text-primary">
                <Share className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-full bg-surface-container-lowest border border-outline-variant/20 shadow-sm hover:bg-surface-container-low transition-colors text-outline hover:text-primary">
                <Download className="w-5 h-5" />
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
                <div className="glass-canvas rounded-xl p-8 shadow-[0_40px_60px_rgba(0,0,0,0.04)] border border-outline-variant/20 bg-white/70 backdrop-blur-xl mb-8">
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
                className="h-[60vh] flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/20 rounded-xl bg-surface-container/10"
              >
                <h3 className="text-2xl font-headline text-outline mb-2">No Active Views</h3>
                <p className="text-on-surface-variant max-w-sm text-center">Use the AI Assistant on the right to start querying your database and generating insights.</p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* Right Assistant Panel (30%) */}
      <section className="w-[30%] h-full bg-surface-container-low border-l border-outline-variant/10 flex flex-col relative">
        <div className="p-6 border-b border-outline-variant/10 bg-white/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <h2 className="font-headline font-bold text-on-surface">AI Assistant</h2>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
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
                  <div className="bg-white/80 dark:bg-black/80 backdrop-blur shadow-sm rounded-2xl p-4 max-w-[85%] text-sm text-on-surface-variant border border-outline-variant/20">
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
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-surface-container-low via-surface-container-low to-transparent">
          <form onSubmit={handleSearchSubmit} className="relative group shadow-[0_40px_60px_rgba(0,0,0,0.04)]">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-black border border-outline-variant/20 rounded-full py-4 pl-6 pr-14 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none text-on-surface placeholder-outline/60"
              placeholder="Ask a follow-up question..."
              disabled={isProcessing}
            />
            <button 
              type="submit"
              disabled={isProcessing || !searchQuery.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </form>
          
          <div className="flex justify-center gap-4 mt-4 opacity-70">
            <button className="text-[10px] font-bold text-outline hover:text-primary uppercase tracking-widest transition-colors">Summarize</button>
            <span className="text-outline/20">•</span>
            <button className="text-[10px] font-bold text-outline hover:text-primary uppercase tracking-widest transition-colors">Export Data</button>
            <span className="text-outline/20">•</span>
            <button className="text-[10px] font-bold text-outline hover:text-primary uppercase tracking-widest transition-colors">Share View</button>
          </div>
        </div>
      </section>
    </>
  );
}
