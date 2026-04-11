import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import wizardLoadingVideo from '../assets/wizardLoading.mp4';
import { motion } from 'framer-motion';
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
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
             <span className="material-symbols-outlined text-[12px]">check_circle</span> Synced
          </span>
        );
      case 'syncing':
        return (
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
             <span className="material-symbols-outlined text-[12px] animate-spin">refresh</span> Syncing
          </span>
        );
      case 'error':
        return (
          <span className="px-3 py-1 rounded-full bg-error/10 text-error border border-error/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
             <span className="material-symbols-outlined text-[12px]">error</span> Error
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
             <span className="material-symbols-outlined text-[12px]">schedule</span> Pending
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-surface-container-high text-outline text-[10px] font-bold uppercase tracking-widest">
            Unknown
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-12">
        <span className="material-symbols-outlined text-4xl text-outline/50 animate-spin mb-4">settings</span>
        <span className="text-sm font-label uppercase tracking-widest text-outline font-bold">Loading System Config</span>
      </div>
    );
  }

  // Show sync wizard if syncing
  if (isSyncing || settings?.dbConfig?.syncStatus === 'syncing') {
    return (
      <div className="w-full h-full flex items-center justify-center p-12">
           <div className="max-w-2xl w-full text-center space-y-8 flex flex-col items-center">
               <h2 className="text-3xl font-bold font-headline">Syncing Workspace Dictionary...</h2>
               
               <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/20 w-full max-w-md aspect-video bg-black/5 editorial-shadow">
                  <video 
                    src={wizardLoadingVideo} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low/20 to-transparent pointer-events-none" />
               </div>

               <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-primary font-medium">
                      <span className="material-symbols-outlined animate-spin text-lg">autorenew</span>
                      <span className="text-sm">Updating embedded schema context...</span>
                  </div>
                  <p className="text-on-surface-variant text-xs">
                      This synchronizes the LLM bindings with your latest precise database schema.
                  </p>
               </div>
           </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto px-8 md:px-12 py-12 flex flex-col gap-12">
      {/* Hero Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight text-on-surface font-headline">Workspace Settings</h1>
          <p className="text-on-surface-variant max-w-lg leading-relaxed">
            Manage your account setup, secure your active database connection bounds, and monitor dependent LLM agent health in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLogout}
            className="px-6 py-2.5 rounded-full border border-error/30 bg-error/5 text-error text-sm font-semibold hover:bg-error hover:text-white transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Sign Out
          </button>
        </div>
      </section>

      {error && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3 text-error">
          <span className="material-symbols-outlined">error</span>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Grid Layout taking full width */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-12">
        
        {/* Left Column: Account & Database (7 cols) */}
        <div className="xl:col-span-7 space-y-8">
          
          {/* Account Details */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-canvas rounded-[2rem] p-8 editorial-shadow shadow-sm"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary-fixed border border-primary/20 flex items-center justify-center">
                 <span className="material-symbols-outlined text-xl">person</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold font-headline text-on-surface mb-1">Account Profile</h3>
                <p className="text-[10px] font-label uppercase tracking-widest text-outline font-bold">Personal Details</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-5 rounded-2xl bg-white/40 border border-outline-variant/10 shadow-sm soft-inlay">
                 <div className="text-[10px] font-label font-bold uppercase tracking-widest text-outline mb-1">Authorized Key</div>
                 <div className="text-sm font-medium font-body text-on-surface truncate">{settings?.user.email}</div>
               </div>
               <div className="p-5 rounded-2xl bg-white/40 border border-outline-variant/10 shadow-sm soft-inlay">
                 <div className="text-[10px] font-label font-bold uppercase tracking-widest text-outline mb-1">Authorization Start</div>
                 <div className="text-sm font-medium font-body text-on-surface">{formatDate(settings?.user.createdAt)}</div>
               </div>
            </div>
          </motion.section>

          {/* Database Connection */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-canvas rounded-[2rem] p-8 editorial-shadow relative overflow-hidden"
          >
            {/* Background flourish */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 blur-3xl opacity-50 rounded-full pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row justify-between items-start mb-8 relative z-10 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                  <span className="material-symbols-outlined text-xl text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>database</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-headline text-on-surface mb-1">System Integration</h3>
                  <p className="text-[10px] font-label uppercase tracking-widest text-outline font-bold">PostgreSQL Backend Configuration</p>
                </div>
              </div>
              <div className="mt-2 sm:mt-0">
                {settings?.dbConfig ? getSyncStatusBadge(settings.dbConfig.syncStatus) : null}
              </div>
            </div>

            {settings?.dbConfig ? (
              <div className="relative z-10 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="px-5 py-4 rounded-xl border border-outline-variant/10 bg-white/60 shadow-sm">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest block mb-1">Host Entity</span>
                    <span className="font-mono text-sm text-on-surface-variant break-all">{settings.dbConfig.host}</span>
                  </div>
                  <div className="px-5 py-4 rounded-xl border border-outline-variant/10 bg-white/60 shadow-sm">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest block mb-1">Active Port</span>
                    <span className="font-mono text-sm text-on-surface-variant">{settings.dbConfig.port}</span>
                  </div>
                  <div className="px-5 py-4 rounded-xl border border-outline-variant/10 bg-white/60 shadow-sm">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest block mb-1">Bound Database</span>
                    <span className="font-mono text-sm text-on-surface-variant">{settings.dbConfig.database}</span>
                  </div>
                  <div className="px-5 py-4 rounded-xl border border-outline-variant/10 bg-white/60 shadow-sm">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest block mb-1">IAM Username</span>
                    <span className="font-mono text-sm text-on-surface-variant">{settings.dbConfig.user}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 px-5 py-4 rounded-xl border border-outline-variant/10 bg-white/60 shadow-sm">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest block mb-1">Read Access</span>
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">lock</span>
                      <span className="font-mono text-sm">•••••••••••••</span>
                    </div>
                  </div>
                  <div className="flex-1 px-5 py-4 rounded-xl border border-outline-variant/10 bg-emerald-500/5 shadow-sm">
                     <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block mb-1">Metadata Extracted</span>
                     <span className="font-mono text-xl font-bold text-emerald-700">{settings.dbConfig.tableCount || 0} Tables</span>
                  </div>
                </div>

                {settings.dbConfig.syncError && (
                  <div className="p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3 text-error">
                    <span className="material-symbols-outlined">error</span>
                    <span className="text-sm font-medium">{settings.dbConfig.syncError}</span>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row justify-between sm:items-center pt-4 gap-4">
                  <span className="text-[10px] uppercase font-bold text-outline tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">cloud_done</span> 
                    Last Synced: {formatDate(settings.dbConfig.lastSyncedAt)}
                  </span>
                  <button 
                    onClick={handleSync}
                    disabled={isSyncing || settings.dbConfig.syncStatus === 'syncing'}
                    className="px-6 py-3 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <span className={`material-symbols-outlined text-sm ${(isSyncing || settings.dbConfig.syncStatus === 'syncing') ? 'animate-spin' : ''}`}>sync</span>
                    {isSyncing || settings.dbConfig.syncStatus === 'syncing' ? 'Syncing...' : 'Force Resync Data'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-16 border-2 border-dashed border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center relative z-10 bg-white/30 text-center">
                <span className="material-symbols-outlined text-outline/40 text-5xl mb-4">database_off</span>
                <h4 className="text-lg font-bold font-headline mb-1">No Database Configured</h4>
                <p className="text-sm text-on-surface-variant max-w-sm mb-6">Complete the connection setup wizard to attach your analytical database to the platform.</p>
                <button onClick={() => navigate('/connect')} className="px-6 py-2.5 rounded-full border border-primary text-primary font-semibold text-sm hover:bg-primary/5 transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">add_link</span>
                  Initialize Setup
                </button>
              </div>
            )}
          </motion.section>
        </div>

        {/* Right Column: Diagnostics (5 cols) */}
        <div className="xl:col-span-5 h-full">
          <motion.section 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-canvas rounded-[2rem] p-8 editorial-shadow h-full flex flex-col relative overflow-hidden"
          >
            <div className="absolute -left-20 top-20 w-48 h-48 bg-blue-500/5 blur-3xl opacity-50 rounded-full pointer-events-none"></div>

            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-headline text-on-surface mb-1">Network Health</h3>
                  <p className="text-[10px] font-label uppercase tracking-widest text-outline font-bold">Component Diagnostics</p>
                </div>
              </div>
              <button 
                onClick={loadHealth} disabled={isHealthLoading}
                className="p-2.5 rounded-xl border border-outline-variant/20 bg-white/50 hover:bg-white text-outline hover:text-primary active:scale-95 transition-all shadow-sm"
              >
                <span className={`material-symbols-outlined text-[20px] ${isHealthLoading ? 'animate-spin text-primary' : ''}`}>sync_saved_locally</span>
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-4 relative z-10">
              {healthStatus ? (
                Object.entries(healthStatus.services).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex flex-col p-5 rounded-2xl border border-outline-variant/10 bg-white/60 hover:bg-white transition-colors shadow-sm soft-inlay group">
                    <div className="flex justify-between items-start w-full">
                      <div className="flex gap-4 items-center">
                         <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center border border-outline-variant/10 group-hover:bg-white transition-colors shadow-sm">
                           {key === 'postgres' && <span className="material-symbols-outlined text-slate-700">dns</span>}
                           {key === 'mongodb' && <span className="material-symbols-outlined text-emerald-700">inventory_2</span>}
                           {key === 'pinecone' && <span className="material-symbols-outlined text-blue-500 text-[18px]">hub</span>}
                           {key === 'llm' && <span className="material-symbols-outlined text-purple-600 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>}
                         </div>
                         <div>
                           <div className="text-sm font-bold capitalize font-headline mb-1">
                             {key === 'llm' ? 'AI Language Matrix' : key}
                           </div>
                           <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${
                               value.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 
                               value.status === 'error' ? 'bg-error' : 'bg-amber-500 animate-pulse'
                             }`}></div>
                             <span className={`text-[10px] font-label uppercase tracking-widest font-bold ${
                               value.status === 'connected' ? 'text-emerald-700' : 
                               value.status === 'error' ? 'text-error' : 'text-amber-600'
                             }`}>
                               {value.status}
                             </span>
                           </div>
                         </div>
                      </div>
                      
                      <div className="text-right flex flex-col items-end">
                         {value.provider && (
                           <span className="px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest bg-primary/10 text-primary-fixed-variant mb-1">
                             {value.provider.replace('_', ' ')}
                           </span>
                         )}
                         {value.model && (
                           <span className="text-[11px] text-outline font-mono truncate max-w-[120px]" title={value.model}>{value.model}</span>
                         )}
                         {value.message && !value.model && (
                           <span className="text-[11px] text-outline truncate max-w-[120px]" title={value.message}>{value.message}</span>
                         )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-outline/50 space-y-4 py-12">
                  <span className="material-symbols-outlined text-5xl animate-pulse">radar</span>
                  <span className="text-sm font-bold uppercase tracking-widest font-label">Running Platform Diagnostics...</span>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-outline-variant/10 text-center relative z-10 flex justify-center items-center gap-2 text-[10px] text-outline uppercase tracking-widest font-bold">
               <span className="material-symbols-outlined text-[14px]">history</span>
               Last Pulse: {healthStatus ? new Date(healthStatus.timestamp).toLocaleTimeString() : 'Never'}
            </div>
          </motion.section>
        </div>

      </div>
    </div>
  );
}

export default SettingsPage;
