import { useState, useEffect } from 'react';
import { 
  Search, 
  Loader2, 
  ArrowRight,
  Sparkles,
  Settings,
  X
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

import { DynamicRenderer } from "../components/DynamicRenderer";
import wizardLoadingVideo from '../assets/wizardLoading.mp4';

// Professional Console Logger
const log = (message: string, type: 'info' | 'success' | 'error' | 'process' = 'info') => {
  const styles = {
    info: 'color: #3b82f6; font-weight: bold',
    success: 'color: #10b981; font-weight: bold',
    error: 'color: #ef4444; font-weight: bold',
    process: 'color: #8b5cf6; font-weight: bold'
  };
  console.log(`%c[DashboardAI] ${message}`, styles[type]);
};

type ViewState = 'SEARCH' | 'RESULTS';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [viewState, setViewState] = useState<ViewState>('SEARCH');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sync State
  const [syncStatus, setSyncStatus] = useState<string>('checking');
  const [syncProgress, setSyncProgress] = useState<any>(null);

  // Result State
  const [uiSpec, setUiSpec] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed session ID for queries
  // user object might not have id immediately if type def is incomplete, but the API now returns it.
  // We'll trust that user.id exists or we fallback to user.email/token hash if mostly needed for uniqueness.
  // Actually, backend expects "user_{userId}" for session-based Pinecone namespaces in the new flow?
  // Let's check syncService.js: "user_${userId}". 
  // So we need the exact user._id.
  const sessionId = user?.id ? `user_${user.id}` : null;

  // Poll sync status
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const checkStatus = async () => {
      try {
        const data = await api.user.syncStatus();
        setSyncStatus(data.status);

        if (data.status === 'syncing' || data.status === 'pending') {
            // Mock progress since real progress isn't exposed yet for async bg jobs
             setSyncProgress({
                stage: 'enriching',
                current: 1,
                total: 10,
                completed: false
             });
        } else if (data.status === 'completed') {
             setSyncProgress(null);
        } else if (data.status === 'error') {
            setError(data.error || 'Sync failed');
            setSyncProgress({ error: data.error });
        }
      } catch (err) {
        console.error('Failed to check sync status:', err);
      }
    };

    checkStatus();
    interval = setInterval(checkStatus, 3000); // Poll every 3s

    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = async (e?: React.FormEvent, forcedQuery?: string) => {
    e?.preventDefault();
    const queryToProcess = forcedQuery !== undefined ? forcedQuery : searchQuery;
    if (!queryToProcess.trim()) return;

    if (!sessionId) {
      toast.error("User session not ready");
      return;
    }

    setViewState('RESULTS');
    processQuery(queryToProcess);
  };

  const processQuery = async (query: string) => {
    setIsProcessing(true);
    setError(null);
    setUiSpec(null);
    
    try {
      if (!sessionId) throw new Error("Invalid session");

      log(`Enhancing query: "${query}"`, 'process');
      const genData = await api.query.generate(sessionId, query);
      
      if (!genData.success) throw new Error(genData.message);
      log('SQL Generated successfully', 'success');

      log('Executing SQL...', 'process');
      const execData = await api.query.execute(sessionId, genData.sql);
      
      if (!execData.success) throw new Error(execData.message);
      log(`Execution complete: ${execData.rows.length} rows returned`, 'success');

      log('Generating UI Visualization...', 'process');
      const visData = await api.query.visualize({
          originalQuery: query,
          sql: genData.sql,
          rows: execData.rows,
          fields: execData.fields,
      });
      
      if (!visData.success) throw new Error(visData.message);
      setUiSpec(visData.uiSpec);
      log('UI Rendered', 'success');

    } catch (err: any) {
      log(`Error: ${err.message}`, 'error');
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // If syncing, show wizard
  if (syncStatus === 'pending' || syncStatus === 'syncing') {
      return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] flex items-center justify-center p-6">
             <div className="max-w-2xl w-full text-center space-y-8 flex flex-col items-center">
                 <h2 className="text-2xl font-bold">Setting up your database...</h2>
                 
                 <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 w-full max-w-md aspect-video bg-black/5">
                    <video 
                      src={wizardLoadingVideo} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
                 </div>

                 <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-primary font-medium">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{syncProgress?.currentTable ? `Analyzing ${syncProgress.currentTable}...` : 'Initializing...'}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Extracting schema and generating AI metadata.
                    </p>
                 </div>
             </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] selection:bg-primary/10 transition-colors duration-500">
      <Toaster position="top-center" />
      
      {/* Header / Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div 
            layoutId="logo"
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => {
              setViewState('SEARCH');
              setSearchQuery('');
              setUiSpec(null);
            }}
          >
            <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold tracking-tight text-xl">Dashboard AI</span>
          </motion.div>

          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-muted/50 transition-colors"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-8 w-8 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Main Search Experience */}
          <AnimatePresence mode="wait">
            {(viewState === 'SEARCH' || viewState === 'RESULTS') && (
              <motion.div
                key="search-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-12"
                layout
              >
                <motion.div layout className="text-center space-y-4">
                  <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 leading-tight">
                    Ask your data anything.
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Transform natural language into powerful insights, charts, and tables in seconds.
                  </p>
                </motion.div>

                <motion.form 
                  layout
                  onSubmit={handleSearchSubmit}
                  className="relative group max-w-3xl mx-auto"
                >
                    {/* ... Search Bar UI ... */}
                  <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <div className="relative flex items-center bg-background/80 backdrop-blur-xl border border-muted-foreground/20 hover:border-primary/50 focus-within:border-primary/70 focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-500 rounded-2xl p-2 pl-6 shadow-2xl overflow-hidden">
                    <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors flex-shrink-0" />
                    <Input 
                      placeholder="e.g. What were the total sales by product category last month?"
                      className="border-0 focus-visible:ring-0 text-lg bg-transparent py-6 h-auto placeholder:text-muted-foreground/50 transition-all flex-grow font-medium"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    
                    {searchQuery && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setSearchQuery('')}
                        type="button"
                        className="p-2 hover:bg-muted/50 rounded-full text-muted-foreground hover:text-foreground transition-colors mr-2"
                      >
                        <X className="h-4 w-4" /> 
                      </motion.button>
                    )}

                    <Button 
                      size="lg" 
                      className="rounded-xl h-12 px-6 ml-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 text-white font-semibold transition-all active:scale-95"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Analyze
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </div>
                  
                  <motion.div layout className="mt-6 flex flex-wrap justify-center gap-2">
                    {['Top products', 'Monthly revenue', 'Customer retention'].map((tag) => (
                      <button 
                        key={tag}
                        type="button"
                        onClick={() => { 
                          setSearchQuery(tag); 
                          handleSearchSubmit(undefined, tag); 
                        }}
                        className="px-4 py-2 rounded-full border border-muted-foreground/10 bg-background/50 backdrop-blur-sm hover:bg-muted/50 hover:border-primary/30 text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:shadow-sm active:scale-95"
                      >
                        {tag}
                      </button>
                    ))}
                  </motion.div>
                </motion.form>

                {/* Results Area */}
                <motion.div layout className="mt-20">
                  <DynamicRenderer 
                    uiSpec={uiSpec}
                    isLoading={isProcessing}
                    error={error}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
