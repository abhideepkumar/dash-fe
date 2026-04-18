import { useState } from 'react';
import { motion } from 'framer-motion';
import { DynamicRenderer } from '../DynamicRenderer';
import { Loader2 } from 'lucide-react';
import type { ActivityTurn } from './ActivityStream';

interface ChatTurnProps {
  turn: ActivityTurn;
  onReply: (turn: ActivityTurn) => void;
  onCommand: (query: string) => void;
}

export function ChatTurn({ turn, onReply, onCommand }: ChatTurnProps) {
  const [showSql, setShowSql] = useState(false);

  const copySQL = () => {
    if (turn.sql) navigator.clipboard.writeText(turn.sql);
  };

  return (
    <div className="flex flex-col gap-6 w-full group">
      {/* User Query Bubble */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-end w-full"
      >
        <div className="bg-surface-variant text-on-surface px-6 py-3.5 rounded-3xl rounded-tr-sm max-w-[80%] shadow-sm border border-outline-variant/30 text-[15px] font-medium leading-relaxed">
          {turn.query}
        </div>
      </motion.div>

      {/* AI Response Area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex gap-4 w-full"
      >
        {/* Assistant Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1 shadow-sm shadow-primary/5">
          <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Processing State */}
          {turn.isProcessing && !turn.uiSpec && !turn.error && !turn.cannotAnswer && (
            <div className="flex items-center gap-3 text-primary bg-primary/5 px-5 py-3 rounded-2xl rounded-tl-sm w-fit border border-primary/10 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium italic">Analyzing your data...</span>
            </div>
          )}

          {/* Error State */}
          {turn.error && (
            <div className="bg-error/5 text-error border border-error/20 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-start gap-3 w-fit">
               <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
               <div className="text-sm leading-relaxed">{turn.error}</div>
            </div>
          )}

          {/* Clarification State (Cannot Answer) */}
          {turn.cannotAnswer && (
            <div className="bg-white/80 dark:bg-surface-container-low backdrop-blur border border-outline-variant/30 px-6 py-5 rounded-3xl rounded-tl-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-3xl flex flex-col gap-4">
              <div className="flex gap-3 text-amber-600">
                <span className="material-symbols-outlined shrink-0">lightbulb</span>
                <p className="text-sm leading-relaxed font-medium">
                  {turn.fallbackReason || "I couldn't generate a chart for that. Here are some suggestions:"}
                </p>
              </div>
              
              {turn.suggestions && turn.suggestions.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-outline">Suggested Queries</p>
                  <div className="flex flex-wrap gap-2">
                    {turn.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => onCommand(suggestion)}
                        className="text-left px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface text-sm text-on-surface hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-between group/btn gap-3 shadow-sm hover:shadow-md max-w-full"
                      >
                        <span className="truncate">{suggestion}</span>
                        <span className="material-symbols-outlined text-[14px] opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all shrink-0">
                          arrow_forward
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Data & Chart State */}
          {!turn.isProcessing && turn.uiSpec && !turn.cannotAnswer && (
            <div className="bg-white/60 dark:bg-surface-container-lowest backdrop-blur-md border border-white/40 dark:border-white/10 rounded-[2rem] rounded-tl-sm shadow-[0_20px_40px_rgb(0,0,0,0.04)] p-6 md:p-8 w-full overflow-hidden transition-all hover:shadow-[0_20px_60px_rgb(0,0,0,0.06)]">
              
              {/* Action bar — appears on hover */}
              <div className="flex justify-end gap-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* View SQL toggle */}
                <button
                  onClick={() => setShowSql(v => !v)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-colors flex items-center gap-1.5 ${
                    showSql
                      ? 'bg-slate-900 text-slate-100 border-slate-700'
                      : 'bg-surface border-outline-variant/30 text-outline hover:text-primary hover:border-primary/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">code</span>
                  {showSql ? 'Hide SQL' : 'View SQL'}
                </button>

                {/* Reply button */}
                <button
                  onClick={() => onReply(turn)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-surface border border-outline-variant/30 text-outline hover:text-primary hover:border-primary/30 transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[14px]">reply</span>
                  Reply
                </button>
              </div>

              {/* SQL Code Block */}
              {showSql && turn.sql && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 text-slate-100"
                >
                  <div className="flex justify-between items-center px-4 py-2.5 border-b border-slate-700 bg-slate-800/50">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                      <span className="ml-2 text-[11px] uppercase tracking-widest text-slate-400 font-bold">SQL Query</span>
                    </div>
                    <button
                      onClick={copySQL}
                      className="text-[11px] text-slate-400 hover:text-slate-100 transition-colors flex items-center gap-1.5 font-medium"
                    >
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      Copy
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed text-slate-200 whitespace-pre-wrap break-words">
                    {turn.sql}
                  </pre>
                </motion.div>
              )}

              <DynamicRenderer
                uiSpec={turn.uiSpec}
                isLoading={false}
                error={null}
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
