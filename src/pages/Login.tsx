import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
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
        // Register without DB config - it will be asked in the next step
        const result = await api.auth.register({
          email,
          password,
          dbConfig: null as any
        });
        
        login(result.token, result.user);
        navigate('/connect');
      } else {
        const result = await api.auth.login(email, password);
        login(result.token, result.user);
        
        // If they have no DB config, take them to connect page
        if (!result.hasDbConfig) {
          navigate('/connect');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-background text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Ethereal Background Blobs */}
      <div className="blob top-[-200px] left-[-100px]"></div>
      <div className="blob bottom-[-200px] right-[-100px]" style={{ background: 'radial-gradient(circle, rgba(0, 108, 73, 0.1) 0%, rgba(255, 255, 255, 0) 70%)' }}></div>
      
      <main className="relative z-10 w-full max-w-xl px-6 py-12 flex flex-col items-center">
        {/* Logo Section */}
        <div className="mb-12 flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-container rounded-lg flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>database</span>
          </div>
          <h2 className="font-headline text-xl font-bold tracking-tight text-on-surface">Conversational Canvas</h2>
        </div>

        {/* Glass Canvas (The Signature Component) */}
        <section className="glass-card w-full rounded-xl border border-outline-variant/20 p-10 md:p-16 flex flex-col items-center text-center editorial-shadow">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-on-surface tracking-tighter mb-6">
            Talk to your database.
          </h1>
          <p className="font-body text-on-surface-variant text-lg md:text-xl leading-relaxed mb-12 max-w-md">
            Experience high-end data editorial. Query and visualize with natural language.
          </p>

          {/* CTA Container */}
          <div className="w-full space-y-4">
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
              <span className="font-label text-[11px] tracking-widest text-outline uppercase">{step === 'email' ? 'Or use email' : 'Enter Password'}</span>
              <div className="h-[1px] flex-1 bg-outline-variant/20"></div>
            </div>

            {error && <p className="text-error text-sm font-medium">{error}</p>}

            {step === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="group relative w-full">
                  <input 
                    className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-full py-4 px-6 text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-outline" 
                    placeholder="work@company.com" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-8 rounded-full border border-outline-variant/20 text-primary font-medium hover:bg-primary/5 transition-colors disabled:opacity-50"
                  >
                  {isLoading ? 'Checking...' : 'Continue with Email'}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                 <div className="group relative w-full">
                  <input 
                    className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-full py-4 px-6 text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-outline" 
                    placeholder="••••••••" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-8 rounded-full border border-outline-variant/20 text-primary font-medium hover:bg-primary/5 transition-colors disabled:opacity-50"
                  >
                  {isLoading ? 'Signing in...' : (isNewUser ? 'Create Account' : 'Sign In')}
                </button>
              </form>
            )}
          </div>

          {/* Footer Links */}
          <div className="mt-12 flex gap-6">
            <a className="font-label text-[11px] tracking-widest text-outline hover:text-primary transition-colors uppercase" href="#">Security</a>
            <a className="font-label text-[11px] tracking-widest text-outline hover:text-primary transition-colors uppercase" href="#">Privacy</a>
            <a className="font-label text-[11px] tracking-widest text-outline hover:text-primary transition-colors uppercase" href="#">Terms</a>
          </div>
        </section>

        {/* Contextual Decorative Element (Editorial Whisper) */}
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
  );
}

export default LoginPage;
