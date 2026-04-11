import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import wizardLoadingVideo from '../assets/wizardLoading.mp4';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User,
  Database,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  LogOut,
  Server,
  Shield,
  Loader2,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface Settings {
  user: {
    email: string;
    createdAt: string;
    lastLoginAt?: string;
  };
  dbConfig: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    syncStatus: string;
    lastSyncedAt?: string;
    tableCount?: number;
    syncError?: string;
  } | null;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'account' | 'database' | 'diagnostics'>('account');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isHealthLoading, setIsHealthLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadHealth();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const result = await api.user.settings();
      setSettings(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const loadHealth = async () => {
    try {
      setIsHealthLoading(true);
      const sessionId = localStorage.getItem('sessionId');
      const result = await api.health.status(sessionId || undefined);
      setHealthStatus(result);
    } catch (err: any) {
      console.error('Failed to load health status:', err);
    } finally {
      setIsHealthLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      await api.user.sync();
      
      const pollInterval = setInterval(async () => {
        try {
          const status = await api.user.syncStatus();
          if (status.status === 'completed' || status.status === 'error') {
            clearInterval(pollInterval);
            setIsSyncing(false);
            loadSettings(); 
          }
        } catch (e) {
          clearInterval(pollInterval);
          setIsSyncing(false);
        }
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to start sync');
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSyncStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="bg-primary/10 text-primary border border-primary/20 flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest"><CheckCircle className="h-3 w-3 mr-1" /> Synced</span>;
      case 'syncing':
        return <span className="bg-secondary/10 text-secondary border border-secondary/20 flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest"><RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Syncing</span>;
      case 'error':
        return <span className="bg-error/10 text-error border border-error/20 flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest"><AlertCircle className="h-3 w-3 mr-1" /> Error</span>;
      case 'pending':
        return <span className="bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest"><Clock className="h-3 w-3 mr-1" /> Pending</span>;
      default:
        return <span className="bg-outline-variant/20 text-outline border border-outline-variant/30 flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Unknown</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-outline">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-headline font-bold">Loading Preferences...</p>
        </div>
      </div>
    );
  }

  if (isSyncing || settings?.dbConfig?.syncStatus === 'syncing') {
    return (
      <div className="flex-1 bg-surface flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center space-y-8 flex flex-col items-center">
            <h2 className="text-3xl font-bold font-headline text-on-surface">Syncing your database...</h2>
            
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/20 w-full max-w-md aspect-video bg-black/5">
                <video 
                  src={wizardLoadingVideo} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-full object-cover"
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-primary font-medium">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Updating schema metadata...</span>
                </div>
                <p className="text-outline text-sm max-w-md">
                    This ensures we have the latest table structures for accurate queries.
                </p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex w-full h-full bg-background relative selection:bg-primary/10">
      
      {/* Inner Profile Sidebar */}
      <div className="w-72 bg-surface-container-lowest/50 border-r border-outline-variant/10 flex-col p-8 z-10 hidden md:flex">
        <div className="mb-10">
          <p className="text-secondary font-bold tracking-[0.2em] uppercase text-[10px] mb-2">Configuration</p>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface">Preferences</h1>
        </div>
        
        <div className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${
              activeTab === 'account' 
                ? 'bg-primary/10 text-primary shadow-sm inner-border opacity-100' 
                : 'text-outline hover:bg-surface-container hover:text-on-surface opacity-80'
            }`}
          >
            <User className="w-5 h-5" /> Account Details
          </button>
          <button 
            onClick={() => setActiveTab('database')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${
              activeTab === 'database' 
                ? 'bg-primary/10 text-primary shadow-sm inner-border opacity-100' 
                : 'text-outline hover:bg-surface-container hover:text-on-surface opacity-80'
            }`}
          >
            <Database className="w-5 h-5" /> Workspace Data
          </button>
          <button 
            onClick={() => setActiveTab('diagnostics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${
              activeTab === 'diagnostics' 
                ? 'bg-primary/10 text-primary shadow-sm inner-border opacity-100' 
                : 'text-outline hover:bg-surface-container hover:text-on-surface opacity-80'
            }`}
          >
            <Server className="w-5 h-5" /> System Diagnostics
          </button>
        </div>

        <div className="pt-6 border-t border-outline-variant/10 mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error/80 hover:text-error hover:bg-error/10 transition-colors text-sm font-bold">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Settings Content Area */}
      <div className="flex-1 overflow-y-auto relative w-full">
        {/* Background Gradient for flair */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary-fixed/20 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-8 py-12 lg:py-16 space-y-8">
          
          {error && (
            <Alert variant="destructive" className="bg-error-container text-on-error-container border-error/20 mb-8 blur-[0px]">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-bold">{error}</AlertDescription>
            </Alert>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-headline font-bold text-on-surface mb-2">My Profile</h2>
                  <p className="text-outline text-lg">Manage your personal information and security.</p>
                </div>

                <GlassCard className="p-10">
                  <div className="flex items-start gap-6 border-b border-outline-variant/10 pb-8 mb-8">
                    <div className="h-20 w-20 rounded-full bg-primary-container/30 flex items-center justify-center border-2 border-primary/20 ring-4 ring-surface-container">
                      <User className="h-10 w-10 text-primary" />
                    </div>
                    <div className="pt-2">
                       <h3 className="text-2xl font-bold font-headline text-on-surface mb-1">{settings?.user.email}</h3>
                       <Badge variant="outline" className="text-[10px] font-bold tracking-widest uppercase bg-surface border-outline-variant/30 text-primary">Admin</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-outline">Email Address</p>
                      <p className="font-medium text-on-surface bg-surface-container py-2 px-3 rounded-lg border border-outline-variant/10 inline-block w-full">{settings?.user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-outline">Member Since</p>
                      <p className="font-medium text-on-surface bg-surface-container py-2 px-3 rounded-lg border border-outline-variant/10 inline-block w-full">{formatDate(settings?.user.createdAt)}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'database' && (
              <motion.div
                key="database"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-8 flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-headline font-bold text-on-surface mb-2">Workspace Data</h2>
                    <p className="text-outline text-lg">Current PostgreSQL connection and schema indexing state.</p>
                  </div>
                  {settings?.dbConfig && getSyncStatusBadge(settings.dbConfig.syncStatus)}
                </div>

                <GlassCard className="p-0 overflow-hidden">
                   <div className="p-10 border-b border-outline-variant/10 bg-surface-container-lowest/30">
                      {settings?.dbConfig ? (
                        <div className="flex flex-col gap-8">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="col-span-1 border-r border-outline-variant/10">
                              <p className="text-[11px] font-bold uppercase tracking-widest text-outline flex items-center gap-1 mb-2">
                                <Server className="h-3 w-3" /> Host
                              </p>
                              <p className="font-mono text-sm text-on-surface font-semibold">{settings.dbConfig.host}</p>
                            </div>
                            <div className="col-span-1 border-r border-outline-variant/10">
                              <p className="text-[11px] font-bold uppercase tracking-widest text-outline mb-2">Database</p>
                              <p className="font-mono text-sm text-on-surface font-semibold">{settings.dbConfig.database}</p>
                            </div>
                            <div className="col-span-1">
                              <p className="text-[11px] font-bold uppercase tracking-widest text-outline mb-2">Port</p>
                              <p className="font-mono text-sm text-on-surface font-semibold">{settings.dbConfig.port}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-widest text-outline mb-2">Role/Username</p>
                              <p className="font-mono text-sm text-on-surface bg-surface py-2 px-3 rounded-lg border border-outline-variant/10 inline-block w-full">{settings.dbConfig.user}</p>
                            </div>
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-widest text-outline mb-2">Password</p>
                              <p className="font-mono text-sm text-on-surface bg-surface py-2 px-3 rounded-lg border border-outline-variant/10 w-full flex items-center gap-2">
                                <Shield className="h-4 w-4 text-primary" /> {settings.dbConfig.password}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-10 flex flex-col items-center justify-center text-outline gap-4">
                           <Database className="w-12 h-12 opacity-20" />
                           <p className="font-medium text-lg">No database configured yet.</p>
                        </div>
                      )}
                   </div>

                   {settings?.dbConfig && (
                     <div className="bg-surface-container/30 p-10">
                        <div className="flex justify-between items-center mb-8">
                           <div>
                              <h4 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2"><Zap className="w-5 h-5 text-secondary" /> AI Schema Index</h4>
                              <p className="text-sm text-outline mt-1">Total operational tables extracted and mapped for natural language queries.</p>
                           </div>
                           <div className="text-right">
                              <p className="text-4xl font-black font-headline text-on-surface">{settings.dbConfig.tableCount || 0}</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-outline mt-1">Tables Indexed</p>
                           </div>
                        </div>

                        {settings.dbConfig.syncError && (
                          <Alert variant="destructive" className="bg-error-container text-on-error-container border-error/20 mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{settings.dbConfig.syncError}</AlertDescription>
                          </Alert>
                        )}

                        <div className="flex items-center justify-between">
                           <div className="text-sm text-outline">
                              <span className="font-bold">Last Synced:</span> {formatDate(settings.dbConfig.lastSyncedAt)}
                           </div>
                           <button 
                             onClick={handleSync} 
                             disabled={isSyncing || settings.dbConfig.syncStatus === 'syncing'}
                             className="rounded-full py-3 px-6 bg-surface-container-highest text-on-surface font-headline font-bold text-sm tracking-tight hover:bg-primary/10 hover:text-primary transform active:scale-[0.98] transition-all duration-150 flex items-center disabled:opacity-50 border border-outline-variant/20 shadow-sm"
                           >
                             {isSyncing || settings.dbConfig.syncStatus === 'syncing' ? (
                               <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Syncing</>
                             ) : (
                               <><RefreshCw className="h-4 w-4 mr-2" /> Force Re-Sync</>
                             )}
                           </button>
                        </div>
                     </div>
                   )}
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'diagnostics' && (
              <motion.div
                key="diagnostics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-8 flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-headline font-bold text-on-surface mb-2">System Diagnostics</h2>
                    <p className="text-outline text-lg">Real-time health check of all operational endpoints.</p>
                  </div>
                  <button 
                    className="text-sm flex items-center gap-2 font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 px-4 py-2 rounded-full" 
                    onClick={loadHealth}
                    disabled={isHealthLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isHealthLoading ? 'animate-spin' : ''}`} />
                    Check Now
                  </button>
                </div>

                <GlassCard className="p-8">
                  <div className="space-y-4">
                    {healthStatus ? (
                      Object.entries(healthStatus.services).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex items-center justify-between p-5 rounded-2xl border border-outline-variant/10 bg-surface-container/50 hover:bg-white/40 dark:hover:bg-white/5 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className={`h-4 w-4 rounded-full flex items-center justify-center ${
                              value.status === 'connected' ? 'bg-primary/20' : 
                              value.status === 'error' ? 'bg-error/20' : 'bg-yellow-500/20'
                            }`}>
                               <div className={`h-2 w-2 rounded-full ${
                                value.status === 'connected' ? 'bg-primary shadow-[0_0_8px_rgba(0,108,73,0.6)]' : 
                                value.status === 'error' ? 'bg-error shadow-[0_0_8px_rgba(186,26,26,0.6)]' : 'bg-yellow-500'
                              }`} />
                            </div>
                            <span className="capitalize font-bold text-lg text-on-surface">
                              {key === 'llm' ? 'AI Provider' : key}
                            </span>
                            {value.provider && (
                              <span className="text-[10px] bg-outline-variant/10 border border-outline-variant/20 py-1 px-3 rounded-full uppercase font-bold tracking-widest text-outline">
                                {value.provider.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          
                          <div className="text-right flex flex-col items-end">
                            <span className={`text-[11px] font-black tracking-widest uppercase py-1 px-3 rounded-full border ${
                              value.status === 'connected' ? 'text-primary bg-primary/5 border-primary/20' : 
                              value.status === 'error' ? 'text-error bg-error/5 border-error/20' : 'text-yellow-600 bg-yellow-500/5 border-yellow-500/20'
                            }`}>
                              {value.status}
                            </span>
                            {value.model && (
                              <p className="text-xs text-outline font-mono mt-2 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> {value.model}
                              </p>
                            )}
                            {value.message && !value.model && (
                              <p className="text-xs text-outline font-medium mt-2 max-w-xs truncate">
                                {value.message}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-20 text-center text-outline flex flex-col items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
                        <p className="text-lg font-headline font-bold text-on-surface">Validating Endpoints...</p>
                        <p className="text-sm">Connecting to backend services</p>
                      </div>
                    )}
                  </div>

                  {healthStatus && (
                    <div className="pt-6 mt-6 border-t border-outline-variant/10 text-center">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-outline font-bold">
                        Last Inspected: {new Date(healthStatus.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
