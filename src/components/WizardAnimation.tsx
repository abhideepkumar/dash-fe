import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Database, Brain, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface WizardAnimationProps {
  stage: 'starting' | 'extracting' | 'enriching' | 'storing' | 'completed' | 'error';
  progress: number;
  currentTable?: string;
  error?: string;
}

export function WizardAnimation({ stage, progress, currentTable, error }: WizardAnimationProps) {
  const getIcon = () => {
    switch (stage) {
      case 'extracting': return <Database className="h-12 w-12 text-blue-500" />;
      case 'enriching': return <Brain className="h-12 w-12 text-purple-500" />;
      case 'storing': return <Save className="h-12 w-12 text-green-500" />;
      case 'completed': return <CheckCircle2 className="h-12 w-12 text-emerald-500" />;
      case 'error': return <AlertCircle className="h-12 w-12 text-destructive" />;
      default: return <Wand2 className="h-12 w-12 text-primary" />;
    }
  };

  const getStageText = () => {
    switch (stage) {
      case 'extracting': return 'Reading Database Tables...';
      case 'enriching': return 'Generative AI: Creating Metadata...';
      case 'storing': return 'Storing Table Context Locally...';
      case 'completed': return 'Setup Complete!';
      case 'error': return 'Extraction Failed';
      default: return 'Starting the Wizard...';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-12 text-center">
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: stage === 'completed' ? 0 : [0, 5, -5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        <div className="absolute inset-0 blur-3xl opacity-20 bg-primary rounded-full" />
        <div className="relative z-10 bg-background border-2 border-primary/20 p-6 rounded-3xl shadow-2xl">
          {getIcon()}
        </div>
        
        {/* Particle effects for completion */}
        {stage === 'completed' && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-primary/30 rounded-full"
          />
        )}
      </motion.div>

      <div className="space-y-4 max-w-md w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ 
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1] // Custom backOut
            }}
            className="space-y-3"
          >
            <h3 className="text-3xl font-bold tracking-tight text-foreground">{getStageText()}</h3>
            {currentTable && (
              <p className="text-sm text-muted-foreground font-mono bg-muted/50 py-1 px-3 rounded-md inline-block">
                Processing: <span className="font-semibold">{currentTable}</span>
              </p>
            )}
            {error && (
              <p className="text-sm text-destructive font-semibold bg-destructive/10 py-2 px-4 rounded-lg">{error}</p>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="space-y-2">
          <Progress value={progress} className="h-2 w-full" />
          <p className="text-xs font-medium text-muted-foreground">{Math.round(progress)}% complete</p>
        </div>
      </div>
    </div>
  );
}
