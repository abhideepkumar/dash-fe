import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PendingReply {
  label: string;
}

interface CommandBarProps {
  onSubmit: (query: string) => void;
  isProcessing: boolean;
  pendingReply?: PendingReply | null;
  onClearReply?: () => void;
}

export interface CommandBarHandle {
  focus: () => void;
}

export const CommandBar = forwardRef<CommandBarHandle, CommandBarProps>(
  ({ onSubmit, isProcessing, pendingReply, onClearReply }, ref) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Expose focus() to parent via ref
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
    }));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim() || isProcessing) return;
      onSubmit(query.trim());
      setQuery('');
    };

    // Re-focus input when processing finishes
    useEffect(() => {
      if (!isProcessing) {
        inputRef.current?.focus();
      }
    }, [isProcessing]);

    return (
      <div className="fixed bottom-0 left-0 w-full z-40 bg-gradient-to-t from-surface via-surface/90 to-transparent pt-20 pb-8 px-4 pointer-events-none">
        <div className="max-w-4xl mx-auto w-full pointer-events-auto">

          {/* Pending Reply Pill */}
          <AnimatePresence>
            {pendingReply && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="mb-2 flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full w-fit shadow-sm"
              >
                <span className="material-symbols-outlined text-[14px] text-primary">reply</span>
                <span className="text-[12px] text-primary font-medium truncate max-w-xs">
                  Replying to: "{pendingReply.label.length > 60 ? pendingReply.label.substring(0, 60) + '…' : pendingReply.label}"
                </span>
                <button
                  onClick={onClearReply}
                  className="w-4 h-4 flex items-center justify-center rounded-full text-primary/60 hover:text-primary transition-colors ml-1"
                  aria-label="Cancel reply"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`relative group shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-[2rem] bg-white/80 dark:bg-black/60 backdrop-blur-xl border transition-all duration-200 ${
              pendingReply
                ? 'border-primary/40 shadow-[0_20px_40px_rgba(0,0,0,0.08),0_0_0_3px_rgba(var(--primary),0.08)]'
                : 'border-white/40 dark:border-white/10'
            }`}
          >
            <form onSubmit={handleSubmit} className="relative flex items-center p-2">
              <div className="w-12 h-12 shrink-0 flex items-center justify-center text-outline">
                <span className="material-symbols-outlined text-[22px]">search</span>
              </div>

              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent border-none outline-none py-3 px-2 text-[15px] text-on-surface placeholder:text-outline-variant focus:ring-0 w-full h-12"
                placeholder={pendingReply ? `Follow up on "${pendingReply.label.substring(0, 40)}${pendingReply.label.length > 40 ? '…' : ''}"...` : 'Ask a question about your data...'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isProcessing}
                autoFocus
              />

              <div className="flex items-center gap-2 pr-2 shrink-0">
                <button
                  type="button"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-outline hover:bg-surface-variant hover:text-on-surface transition-colors disabled:opacity-50"
                  disabled={isProcessing}
                  title="Voice input"
                >
                  <span className="material-symbols-outlined text-[20px]">mic</span>
                </button>

                <button
                  type="submit"
                  disabled={isProcessing || !query.trim()}
                  className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-sm"
                >
                  {isProcessing ? (
                    <span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Quick Actions Footer */}
          <div className="flex justify-center gap-4 mt-4 opacity-70">
            <button className="text-[10px] font-bold text-outline uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">summarize</span>
              Summarize Last
            </button>
            <span className="text-outline/20">•</span>
            <button className="text-[10px] font-bold text-outline uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">download</span>
              Export Data
            </button>
            <span className="text-outline/20">•</span>
            <button className="text-[10px] font-bold text-outline uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">clear_all</span>
              Clear Chat
            </button>
          </div>
        </div>
      </div>
    );
  }
);

CommandBar.displayName = 'CommandBar';
