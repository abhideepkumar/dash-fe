import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, ArrowLeft, Loader2, Settings, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

type Step = 'email' | 'password' | 'dbConfig';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Form state
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  
  // DB Config state
  const [dbConfig, setDbConfig] = useState({
    host: '',
    port: '5432',
    database: '',
    user: '',
    password: ''
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError(null);
    setIsLoading(true);

    try {
      const result = await api.auth.check(email);
      setIsNewUser(!result.exists);
      setStep('password');
    } catch (err: any) {
      setError(err.message || 'Failed to check email');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setError(null);
    setIsLoading(true);

    try {
      if (isNewUser) {
        setStep('dbConfig');
        setIsLoading(false);
      } else {
        const result = await api.auth.login(email, password);
        login(result.token, result.user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  const handleDbConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await api.auth.register({
        email,
        password,
        dbConfig: {
          ...dbConfig,
          port: parseInt(dbConfig.port) || 5432
        }
      });
      
      login(result.token, result.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setError(null);
    if (step === 'dbConfig') {
      setStep('password');
    } else if (step === 'password') {
      setStep('email');
    }
  };

  return (
    <div className="font-body text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      {step !== 'dbConfig' ? (
        // Login / Welcome Phase (login_welcome_glass)
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-background">
          <div className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] rounded-full bg-primary-container/15 blur-[60px] z-0 pointer-events-none" />
          <div className="absolute bottom-[-200px] right-[-100px] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[60px] z-0 pointer-events-none" />
          
          <main className="relative z-10 w-full max-w-xl px-6 py-12 flex flex-col items-center">
            <div className="mb-12 flex flex-col items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-container rounded-lg flex items-center justify-center shadow-lg">
                <Database className="text-white w-8 h-8" />
              </div>
              <h2 className="font-headline text-xl font-bold tracking-tight text-on-surface">Conversational Canvas</h2>
            </div>

            <section className="w-full bg-white/70 dark:bg-black/70 backdrop-blur-[16px] rounded-xl border border-outline-variant/20 p-10 md:p-16 flex flex-col items-center text-center shadow-[0_40px_60px_rgba(0,0,0,0.04)]">
              <h1 className="font-headline text-4xl md:text-5xl font-bold text-on-surface tracking-tighter mb-6">
                Talk to your database.
              </h1>
              <p className="font-body text-on-surface-variant text-lg md:text-xl leading-relaxed mb-12 max-w-md">
                Experience high-end data editorial. Query and visualize with natural language.
              </p>

              <div className="w-full space-y-4">
                {step === 'email' ? (
                  <>
                    <button className="w-full py-4 px-8 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-semibold flex items-center justify-center gap-3 transition-all hover:opacity-90 hover:scale-[0.98] active:scale-95">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"></path>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"></path>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="currentColor"></path>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"></path>
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                    <div className="flex items-center gap-4 py-4">
                      <div className="h-[1px] flex-1 bg-outline-variant/20"></div>
                      <span className="font-label text-[11px] tracking-widest text-outline uppercase">Or use email</span>
                      <div className="h-[1px] flex-1 bg-outline-variant/20"></div>
                    </div>
                    
                    <form onSubmit={handleEmailSubmit} className="space-y-4 relative w-full group">
                      <input 
                        className="w-full bg-surface-container border border-outline-variant/20 rounded-full py-4 px-6 text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-outline" 
                        placeholder="work@company.com" 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      {error && <p className="text-error text-sm">{error}</p>}
                      <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-4 px-8 rounded-full border border-outline-variant/20 text-primary font-medium hover:bg-primary/5 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Access via Magic Link"}
                      </button>
                    </form>
                  </>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4 relative w-full group">
                    <p className="text-sm text-outline font-medium mb-2">{isNewUser ? 'Create a password' : 'Welcome back'} for {email}</p>
                    <input 
                      className="w-full bg-surface-container border border-outline-variant/20 rounded-full py-4 px-6 text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-outline" 
                      placeholder="••••••••" 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    {error && <p className="text-error text-sm">{error}</p>}
                    <div className="flex gap-2">
                       <button type="button" onClick={goBack} className="p-4 rounded-full border border-outline-variant/20 text-outline hover:bg-surface-container-low transition-colors">
                          <ArrowLeft className="w-5 h-5" />
                       </button>
                       <button 
                         type="submit" 
                         disabled={isLoading}
                         className="flex-1 py-4 px-8 rounded-full bg-primary text-on-primary font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                       >
                         {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isNewUser ? "Continue" : "Sign In")}
                       </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="mt-12 flex gap-6">
                <a className="font-label text-[11px] tracking-widest text-outline hover:text-primary transition-colors uppercase" href="#">Security</a>
                <a className="font-label text-[11px] tracking-widest text-outline hover:text-primary transition-colors uppercase" href="#">Privacy</a>
                <a className="font-label text-[11px] tracking-widest text-outline hover:text-primary transition-colors uppercase" href="#">Terms</a>
              </div>
            </section>

            <div className="mt-16 flex flex-col items-center animate-pulse">
              <span className="font-label text-[10px] tracking-[0.3em] text-outline uppercase mb-2">Trusted by Editorial Teams at</span>
              <div className="flex gap-8 opacity-40 grayscale filter contrast-125">
                <span className="font-headline text-sm font-bold tracking-tighter text-on-surface">METRIC.IO</span>
                <span className="font-headline text-sm font-bold tracking-tighter text-on-surface">DATAFLOW</span>
                <span className="font-headline text-sm font-bold tracking-tighter text-on-surface">SYNTAX</span>
              </div>
            </div>
          </main>
        </div>
      ) : (
        // DB Setup Phase (connection_setup_glass)
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-background">
          <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_0%_0%,#f7f9fb_0%,#e6f7f1_50%,#d1fae5_100%)] dark:bg-[radial-gradient(circle_at_0%_0%,#191c1e_0%,#002113_50%,#000000_100%)] overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/30 blur-[100px]"></div>
          </div>
          
          <main className="relative z-10 flex items-center justify-center w-full min-h-screen p-6">
            <div className="flex flex-col items-center w-full max-w-[400px]">
              <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center p-4 mb-6 rounded-xl bg-surface-container-lowest/50 backdrop-blur-[24px] saturate-180 border border-outline-variant/20 shadow-sm">
                  <Database className="text-primary w-8 h-8" />
                </div>
                <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface mb-2">Connect Database</h1>
                <p className="text-outline text-sm">Configure your workspace connection to start querying.</p>
              </div>

              <div className="w-full bg-surface-container-lowest/70 dark:bg-black/70 backdrop-blur-[24px] saturate-180 rounded-xl border border-outline-variant/20 shadow-[0_40px_60px_rgba(0,0,0,0.04)] p-8">
                <form onSubmit={handleDbConfigSubmit} className="space-y-6">
                  {error && <p className="text-error text-sm font-bold">{error}</p>}
                  
                  <div className="space-y-1.5 group">
                    <label className="font-label text-[11px] uppercase tracking-widest font-semibold text-outline group-focus-within:text-primary transition-colors block ml-1">Host</label>
                    <div className="bg-white/40 dark:bg-white/5 border-b border-primary/10 px-0 py-2 transition-all duration-200 focus-within:bg-white/80 dark:focus-within:bg-white/10 focus-within:border-primary focus-within:border-b-2 block">
                      <input 
                        className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/50 p-1 px-2 outline-none" 
                        placeholder="e.g. localhost or db.example.com" 
                        value={dbConfig.host}
                        onChange={(e) => setDbConfig({...dbConfig, host: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-1 space-y-1.5 group">
                      <label className="font-label text-[11px] uppercase tracking-widest font-semibold text-outline group-focus-within:text-primary transition-colors block ml-1">Port</label>
                      <div className="bg-white/40 dark:bg-white/5 border-b border-primary/10 px-0 py-2 transition-all duration-200 focus-within:bg-white/80 dark:focus-within:bg-white/10 focus-within:border-primary focus-within:border-b-2 block">
                        <input 
                          className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/50 p-1 px-2 outline-none" 
                          placeholder="5432"
                          value={dbConfig.port}
                          onChange={(e) => setDbConfig({...dbConfig, port: e.target.value})}
                          required 
                        />
                      </div>
                    </div>
                    <div className="col-span-2 space-y-1.5 group">
                      <label className="font-label text-[11px] uppercase tracking-widest font-semibold text-outline group-focus-within:text-primary transition-colors block ml-1">Database</label>
                      <div className="bg-white/40 dark:bg-white/5 border-b border-primary/10 px-0 py-2 transition-all duration-200 focus-within:bg-white/80 dark:focus-within:bg-white/10 focus-within:border-primary focus-within:border-b-2 block">
                        <input 
                          className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/50 p-1 px-2 outline-none" 
                          placeholder="postgres"
                          value={dbConfig.database}
                          onChange={(e) => setDbConfig({...dbConfig, database: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5 group">
                      <label className="font-label text-[11px] uppercase tracking-widest font-semibold text-outline group-focus-within:text-primary transition-colors block ml-1">Username</label>
                      <div className="bg-white/40 dark:bg-white/5 border-b border-primary/10 px-0 py-2 transition-all duration-200 focus-within:bg-white/80 dark:focus-within:bg-white/10 focus-within:border-primary focus-within:border-b-2 block">
                        <input 
                          className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/50 p-1 px-2 outline-none" 
                          placeholder="postgres"
                          value={dbConfig.user}
                          onChange={(e) => setDbConfig({...dbConfig, user: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-span-1 space-y-1.5 group">
                      <label className="font-label text-[11px] uppercase tracking-widest font-semibold text-outline group-focus-within:text-primary transition-colors block ml-1">Password</label>
                      <div className="bg-white/40 dark:bg-white/5 border-b border-primary/10 px-0 py-2 transition-all duration-200 focus-within:bg-white/80 dark:focus-within:bg-white/10 focus-within:border-primary focus-within:border-b-2 block">
                        <input 
                          type="password"
                          className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/50 p-1 px-2 outline-none" 
                          placeholder="••••••••"
                          value={dbConfig.password}
                          onChange={(e) => setDbConfig({...dbConfig, password: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer group">
                      <Settings className="text-primary w-4 h-4" />
                      <span className="text-xs font-medium text-primary group-hover:underline">Advanced Options</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      <span className="text-[10px] uppercase tracking-tighter text-outline font-bold">SSL Required</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      disabled={isLoading}
                      className="w-full rounded-full py-4 px-8 bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold text-sm tracking-tight shadow-lg shadow-primary/20 hover:shadow-primary/30 transform active:scale-[0.98] transition-all duration-150 flex items-center justify-center disabled:opacity-50" 
                      type="submit"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Connect Database"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="mt-8 flex items-center gap-8 text-outline/80">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[11px] uppercase tracking-widest font-medium">End-to-end Encrypted</span>
                </div>
              </div>

              <button onClick={goBack} className="mt-12 text-sm font-medium text-primary flex items-center gap-2 hover:opacity-80 transition-opacity">
                <ArrowLeft className="w-4 h-4" />
                Return to Login
              </button>
            </div>
          </main>

          {/* Decoration Layer */}
          <div className="fixed bottom-12 left-12 z-0 hidden lg:block opacity-20 rotate-12 pointer-events-none">
            <div className="w-32 h-32 border border-primary rounded-xl"></div>
          </div>
          <div className="fixed top-24 right-24 z-0 hidden lg:block opacity-10 -rotate-12 pointer-events-none">
            <div className="w-48 h-48 bg-primary-container rounded-full blur-[80px]"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
