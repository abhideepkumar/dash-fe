import { useState, useEffect } from 'react';
import { 
  Search, 
  Database, 
  Loader2, 
  ArrowRight,
  Sparkles,
  Settings,
  X
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { DynamicRenderer } from "./components/DynamicRenderer";
import { WizardAnimation } from "./components/WizardAnimation";

const API_BASE = 'http://localhost:8000/api';

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

type AppState = 'INITIAL' | 'CONFIGURING' | 'SYNCING' | 'RESULTS';

export function App() {
  const [appState, setAppState] = useState<AppState>('INITIAL');
  const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('dashboard_session_id'));
  const [searchQuery, setSearchQuery] = useState('');
  const [dbConfig, setDbConfig] = useState({
    host: 'localhost',
    port: '5432',
    database: 'dashboard_test',
    user: 'postgres',
    password: 'postgres',
  });

  // Extraction State
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState<any>(null);

  // Result State
  const [nlQuery, setNlQuery] = useState('');
  const [generatedSQL, setGeneratedSQL] = useState<any>(null);
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [uiSpec, setUiSpec] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist session
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('dashboard_session_id', sessionId);
      log(`Session initialized: ${sessionId}`, 'success');
    }
  }, [sessionId]);

  const handleSearchSubmit = async (e?: React.FormEvent, forcedQuery?: string) => {
    e?.preventDefault();
    const queryToProcess = forcedQuery !== undefined ? forcedQuery : searchQuery;
    if (!queryToProcess.trim()) return;

    if (!sessionId) {
      log('No active session found. Redirecting to configuration.', 'info');
      setAppState('CONFIGURING');
      return;
    }

    setAppState('RESULTS');
    setNlQuery(queryToProcess);
    processQuery(queryToProcess);
  };

  const processQuery = async (query: string) => {
    setIsProcessing(true);
    setError(null);
    setUiSpec(null);
    
    try {
      log(`Enhancing query: "${query}"`, 'process');
      const genRes = await fetch(`${API_BASE}/query/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, query, topK: 5 }),
      });
      const genData = await genRes.json();
      
      if (!genData.success) throw new Error(genData.message);
      setGeneratedSQL(genData);
      log('SQL Generated successfully', 'success');

      log('Executing SQL...', 'process');
      const execRes = await fetch(`${API_BASE}/query/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, sql: genData.sql }),
      });
      const execData = await execRes.json();
      
      if (!execData.success) throw new Error(execData.message);
      setSqlResult(execData);
      log(`Execution complete: ${execData.rows.length} rows returned`, 'success');

      log('Generating UI Visualization...', 'process');
      const visRes = await fetch(`${API_BASE}/query/visualize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalQuery: query,
          sql: genData.sql,
          rows: execData.rows,
          fields: execData.fields,
        }),
      });
      const visData = await visRes.json();
      
      if (!visData.success) throw new Error(visData.message);
      setUiSpec(visData.uiSpec);
      log('UI Rendered', 'success');

    } catch (err: any) {
      log(`Error: ${err.message}`, 'error');
      
      // Handle invalid session by clearing localStorage and redirecting to config
      if (err.message?.toLowerCase().includes('invalid') && err.message?.toLowerCase().includes('session')) {
        log('Session expired. Clearing localStorage and prompting for reconnection.', 'info');
        localStorage.removeItem('dashboard_session_id');
        setSessionId(null);
        setAppState('CONFIGURING');
        toast.error('Session expired. Please reconnect to the database.');
      } else {
        setError(err.message);
        toast.error(err.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConnect = async () => {
    log('Testing database connection...', 'process');
    try {
      const res = await fetch(`${API_BASE}/schema/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbConfig),
      });
      const data = await res.json();
      if (data.success) {
        setSessionId(data.sessionId);
        log('Connection successful!', 'success');
        startExtraction(data.sessionId);
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      log(`Connection failed: ${err.message}`, 'error');
      toast.error(err.message);
    }
  };

  const startExtraction = async (sid: string) => {
    setAppState('SYNCING');
    setIsExtracting(true);
    log('Starting schema extraction wizard...', 'process');

    try {
      await fetch(`${API_BASE}/schema/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid }),
      });

      const poll = setInterval(async () => {
        const res = await fetch(`${API_BASE}/schema/progress/${sid}`);
        const data = await res.json();
        
        if (data.success) {
          setExtractionProgress(data.progress);
          if (data.progress.stage !== 'completed' && data.progress.stage !== 'error') {
            log(`Progress: ${data.progress.stage} (${data.progress.current}/${data.progress.total})`, 'info');
          }
          
          if (data.progress.completed) {
            clearInterval(poll);
            setIsExtracting(false);
            log('Schema extraction completed!', 'success');
            toast.success('Database ready!');
            setTimeout(() => {
              setAppState('INITIAL');
              // Optionally trigger search if initial query was typed
              if (searchQuery) handleSearchSubmit(undefined, searchQuery);
            }, 2000);
          } else if (data.progress.stage === 'error') {
            clearInterval(poll);
            setIsExtracting(false);
            log(`Extraction error: ${data.progress.error}`, 'error');
            setError(data.progress.error);
          }
        }
      }, 1000);
    } catch (err: any) {
      log(`Extraction failed: ${err.message}`, 'error');
      setIsExtracting(false);
    }
  };

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
              setAppState('INITIAL');
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
            {sessionId && (
              <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 gap-1.5 px-3 py-1 group cursor-help transition-all hover:bg-emerald-500/10">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Connection
              </Badge>
            )}
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/50 transition-colors">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Main Search Experience */}
          <AnimatePresence mode="wait">
            {(appState === 'INITIAL' || appState === 'RESULTS') && (
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
                  <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <div className="relative flex items-center bg-background border-2 border-muted hover:border-primary/40 focus-within:border-primary transition-all duration-500 rounded-3xl p-2 pl-6 shadow-2xl overflow-hidden">
                    <Search className="h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors flex-shrink-0" />
                    <Input 
                      placeholder="e.g. What were the total sales by product category last month?"
                      className="border-0 focus-visible:ring-0 text-lg bg-transparent py-8 h-auto placeholder:text-muted-foreground/50 transition-all flex-grow"
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
                        className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors mr-2"
                      >
                        <X className="h-5 w-5" /> 
                      </motion.button>
                    )}

                    <Button 
                      size="lg" 
                      className="rounded-2xl h-14 px-8 ml-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all font-semibold flex-shrink-0 whitespace-nowrap"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Analyze
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
                        className="px-4 py-2 rounded-full border bg-background hover:bg-muted text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95"
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

            {appState === 'SYNCING' && (
              <motion.div
                key="syncing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex items-center justify-center min-h-[400px]"
              >
                <WizardAnimation 
                  stage={extractionProgress?.stage || 'starting'} 
                  progress={(extractionProgress?.current / (extractionProgress?.total || 1)) * 100 || 0}
                  currentTable={extractionProgress?.currentTable}
                  error={extractionProgress?.error}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* DB Configuration Dialog */}
      <Dialog open={appState === 'CONFIGURING'} onOpenChange={(open) => !open && setAppState('INITIAL')}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
          <div className="bg-primary p-8 text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Database className="h-24 w-24 rotate-12" />
            </div>
            <h2 className="text-2xl font-bold">Connect your database</h2>
            <p className="text-primary-foreground/80 mt-1">We need to index your schema to understand your data.</p>
          </div>
          
          <div className="p-8 space-y-6 bg-background">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Host</label>
                <Input 
                  className="rounded-xl bg-muted/50 focus:bg-background border-transparent focus:border-primary"
                  value={dbConfig.host}
                  onChange={(e) => setDbConfig({...dbConfig, host: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Port</label>
                <Input 
                  className="rounded-xl bg-muted/50 focus:bg-background border-transparent focus:border-primary"
                  value={dbConfig.port}
                  onChange={(e) => setDbConfig({...dbConfig, port: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Database</label>
              <Input 
                className="rounded-xl bg-muted/50 focus:bg-background border-transparent focus:border-primary"
                value={dbConfig.database}
                onChange={(e) => setDbConfig({...dbConfig, database: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Username</label>
                <Input 
                  className="rounded-xl bg-muted/50 focus:bg-background border-transparent focus:border-primary"
                  value={dbConfig.user}
                  onChange={(e) => setDbConfig({...dbConfig, user: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Password</label>
                <Input 
                  type="password"
                  className="rounded-xl bg-muted/50 focus:bg-background border-transparent focus:border-primary"
                  value={dbConfig.password}
                  onChange={(e) => setDbConfig({...dbConfig, password: e.target.value})}
                />
              </div>
            </div>
            <Button 
              className="w-full h-12 rounded-xl font-bold text-lg shadow-xl shadow-primary/20"
              onClick={handleConnect}
            >
              Connect to DB
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;