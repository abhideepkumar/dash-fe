import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Lock, 
  Database, 
  Server, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
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

  // Step 1: Check email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  // Step 2: Password (for both login and register)
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isNewUser) {
        // New user - go to DB config step
        setStep('dbConfig');
        setIsLoading(false);
      } else {
        // Existing user - login directly
        const result = await api.auth.login(email, password);
        login(result.token, result.user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  // Step 3: DB Config (new users only)
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-border/50">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Dashboard AI</CardTitle>
            <CardDescription>
              {step === 'email' && 'Enter your email to get started'}
              {step === 'password' && (isNewUser ? 'Create your account' : 'Welcome back!')}
              {step === 'dbConfig' && 'Connect your PostgreSQL database'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {['email', 'password', 'dbConfig'].map((s, i) => (
                <div 
                  key={s}
                  className={`h-2 rounded-full transition-all ${
                    i <= ['email', 'password', 'dbConfig'].indexOf(step) 
                      ? 'bg-primary w-8' 
                      : 'bg-muted w-4'
                  }`}
                />
              ))}
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <AnimatePresence mode="wait">
              {/* Step 1: Email */}
              {step === 'email' && (
                <motion.form
                  key="email"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleEmailSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </motion.form>
              )}

              {/* Step 2: Password */}
              {step === 'password' && (
                <motion.form
                  key="password"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handlePasswordSubmit}
                  className="space-y-4"
                >
                  <div className="text-sm text-muted-foreground text-center mb-2">
                    {email}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {isNewUser ? 'Create Password' : 'Password'}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        minLength={6}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={goBack}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isNewUser ? (
                        <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>
                      ) : (
                        <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </div>
                </motion.form>
              )}

              {/* Step 3: DB Config (New Users) */}
              {step === 'dbConfig' && (
                <motion.form
                  key="dbConfig"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleDbConfigSubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="host">Host</Label>
                      <div className="relative">
                        <Server className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="host"
                          placeholder="localhost"
                          value={dbConfig.host}
                          onChange={(e) => setDbConfig({ ...dbConfig, host: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="port">Port</Label>
                      <Input
                        id="port"
                        type="number"
                        placeholder="5432"
                        value={dbConfig.port}
                        onChange={(e) => setDbConfig({ ...dbConfig, port: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="database">Database Name</Label>
                    <div className="relative">
                      <Database className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="database"
                        placeholder="mydb"
                        value={dbConfig.database}
                        onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="dbUser">Username</Label>
                      <Input
                        id="dbUser"
                        placeholder="postgres"
                        value={dbConfig.user}
                        onChange={(e) => setDbConfig({ ...dbConfig, user: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dbPassword">Password</Label>
                      <Input
                        id="dbPassword"
                        type="password"
                        placeholder="••••••••"
                        value={dbConfig.password}
                        onChange={(e) => setDbConfig({ ...dbConfig, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={goBack}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>Create Account & Connect <CheckCircle className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Your credentials are encrypted before storage.
                    Schema sync will start in the background.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default LoginPage;
