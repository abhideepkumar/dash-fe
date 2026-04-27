import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Sparkles } from 'lucide-react';

interface ClarificationDialogProps {
  questions: string[];
  dashboardTitle: string;
  onSubmit: (answers: Record<string, string>) => void;
  isLoading: boolean;
}

export function ClarificationDialog({
  questions,
  dashboardTitle,
  onSubmit,
  isLoading,
}: ClarificationDialogProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(answers);
  };

  const allAnswered = questions.every((_, i) => answers[i]?.trim());

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl mx-auto"
      >
        {/* Card */}
        <div className="relative rounded-2xl border border-violet-200/60 dark:border-violet-800/40 bg-gradient-to-br from-white via-violet-50/30 to-white dark:from-slate-900 dark:via-violet-950/20 dark:to-slate-900 shadow-lg overflow-hidden">
          {/* Subtle gradient strip */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-400" />

          <div className="px-6 pt-6 pb-5">
            {/* Header */}
            <div className="flex items-start gap-3 mb-5">
              <div className="mt-0.5 shrink-0 p-2 rounded-xl bg-violet-100 dark:bg-violet-900/40">
                <HelpCircle size={18} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-widest text-violet-500 dark:text-violet-400 mb-1">
                  A few quick questions
                </p>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                  Help me build the perfect dashboard for{' '}
                  <span className="text-violet-600 dark:text-violet-400">"{dashboardTitle}"</span>
                </h3>
              </div>
            </div>

            {/* Questions */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {questions.map((question, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.35 }}
                  className="space-y-1.5"
                >
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 text-[10px] font-bold mr-2">
                      {i + 1}
                    </span>
                    {question}
                  </label>
                  <input
                    type="text"
                    value={answers[i] || ''}
                    onChange={e => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                    placeholder="Type your answer..."
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 transition-all"
                  />
                </motion.div>
              ))}

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!allAnswered || isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/20 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Sparkles size={15} />
                  {isLoading ? 'Generating Dashboard...' : 'Generate Dashboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
