import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import wizardLoadingVideo from '../assets/wizardLoading.mp4';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User,
  Database,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowLeft,
  LogOut,
  Server,
  Shield,
  Loader2
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
      // Use sessionId if available
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
      
      // Poll for status updates
      const pollInterval = setInterval(async () => {
        try {
          const status = await api.user.syncStatus();
          if (status.status === 'completed' || status.status === 'error') {
            clearInterval(pollInterval);
            setIsSyncing(false);
            loadSettings(); // Reload settings to get updated data
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
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" /> Synced</Badge>;
      case 'syncing':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20"><RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Syncing</Badge>;
      case 'error':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><AlertCircle className="h-3 w-3 mr-1" /> Error</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show sync wizard if syncing
  if (isSyncing || settings?.dbConfig?.syncStatus === 'syncing') {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] flex items-center justify-center p-6">
           <div className="max-w-2xl w-full text-center space-y-8 flex flex-col items-center">
               <h2 className="text-2xl font-bold">Syncing your database...</h2>
               
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
                      <span>Updating schema metadata...</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                      This ensures we have the latest table structures for accurate queries.
                  </p>
               </div>
           </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Account Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>Your account information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{settings?.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">{formatDate(settings?.user.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Database Connection Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Database className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle>Database Connection</CardTitle>
                    <CardDescription>Your PostgreSQL configuration</CardDescription>
                  </div>
                </div>
                {settings?.dbConfig && getSyncStatusBadge(settings.dbConfig.syncStatus)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings?.dbConfig ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Server className="h-3 w-3" /> Host
                      </p>
                      <p className="font-mono text-sm">{settings.dbConfig.host}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Port</p>
                      <p className="font-mono text-sm">{settings.dbConfig.port}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Database</p>
                      <p className="font-mono text-sm">{settings.dbConfig.database}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Username</p>
                      <p className="font-mono text-sm">{settings.dbConfig.user}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Password</p>
                      <p className="font-mono text-sm flex items-center gap-1">
                        <Shield className="h-3 w-3" /> {settings.dbConfig.password}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tables Extracted</p>
                      <p className="font-medium">{settings.dbConfig.tableCount || 0}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Last Synced</p>
                    <p className="font-medium">{formatDate(settings.dbConfig.lastSyncedAt)}</p>
                  </div>

                  {settings.dbConfig.syncError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{settings.dbConfig.syncError}</AlertDescription>
                    </Alert>
                  )}

                  <Separator />

                  <Button 
                    onClick={handleSync} 
                    disabled={isSyncing || settings.dbConfig.syncStatus === 'syncing'}
                    className="w-full"
                  >
                    {isSyncing || settings.dbConfig.syncStatus === 'syncing' ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Database Again
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Re-extracts schema and updates AI understanding of your database
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No database configured yet.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* System Diagnostic Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Server className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle>System Diagnostic</CardTitle>
                    <CardDescription>Health check for dependent services</CardDescription>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={loadHealth}
                  disabled={isHealthLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isHealthLoading ? 'animate-spin' : ''}`} />
                  Check
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {healthStatus ? (
                  Object.entries(healthStatus.services).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${
                          value.status === 'connected' ? 'bg-green-500' : 
                          value.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <span className="capitalize font-medium">
                          {key === 'llm' ? 'AI Model' : key}
                        </span>
                        {value.provider && (
                          <Badge variant="outline" className="text-[10px] h-5 px-1.5 ml-2 uppercase">
                            {value.provider.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-medium ${
                          value.status === 'connected' ? 'text-green-500' : 
                          value.status === 'error' ? 'text-red-500' : 'text-yellow-500'
                        }`}>
                          {value.status.toUpperCase()}
                        </p>
                        {value.model && (
                          <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                            {value.model}
                          </p>
                        )}
                        {value.message && !value.model && (
                          <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                            {value.message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Running diagnostic...</p>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <p className="text-xs text-muted-foreground italic">
                  Last check: {healthStatus ? new Date(healthStatus.timestamp).toLocaleTimeString() : 'Never'}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default SettingsPage;
