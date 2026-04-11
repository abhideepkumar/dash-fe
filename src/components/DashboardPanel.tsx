import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DynamicRenderer } from './DynamicRenderer';

export interface PanelHistory {
  query: string;
  sql: string;
}

export interface Panel {
  id: string;
  originalQuery: string;
  uiSpec: any;
  sql: string;
  history: PanelHistory[];
  isProcessing: boolean;
  error: string | null;
  createdAt: Date;
}

interface DashboardPanelProps {
  panel: Panel;
  index: number;
  onFollowUp: (query: string) => void;
  onRemove: () => void;
}

export function DashboardPanel({ panel, index, onFollowUp, onRemove }: DashboardPanelProps) {
  const [followUpQuery, setFollowUpQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuery.trim() || panel.isProcessing) return;
    onFollowUp(followUpQuery.trim());
    setFollowUpQuery('');
  };

  // Focus the follow-up input when processing completes and there's history
  useEffect(() => {
    if (!panel.isProcessing && panel.history.length > 0) {
      inputRef.current?.focus();
    }
  }, [panel.isProcessing]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
      className="glass-canvas rounded-2xl editorial-shadow border border-white/40 shadow-[0_40px_60px_rgba(0,66,43,0.04)] overflow-hidden"
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/20">
        <div className="flex items-center gap-3 min-w-0">
          {/* Panel index badge */}
          <div className="w-7 h-7 shrink-0 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[11px] font-bold text-primary font-mono">
            {index + 1}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold font-headline text-on-surface truncate">
              {panel.uiSpec?.title || panel.originalQuery}
            </h3>
            <p className="text-[10px] font-label uppercase tracking-widest text-outline font-bold truncate">
              {panel.originalQuery}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          {/* History turn count */}
          {panel.history.length > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-primary/8 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/15 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">history</span>
              {panel.history.length} follow-up{panel.history.length !== 1 ? 's' : ''}
            </span>
          )}

          {/* Processing indicator */}
          {panel.isProcessing && (
            <span className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-[14px] animate-spin">autorenew</span>
              Updating...
            </span>
          )}

          {/* Remove button */}
          <button
            onClick={onRemove}
            className="w-7 h-7 rounded-lg border border-outline-variant/20 flex items-center justify-center text-outline hover:text-error hover:border-error/30 hover:bg-error/5 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>

      {/* Inline Follow-up Bar (Moved to top for better UX) */}
      <div className="px-6 py-4 bg-surface-container-lowest/50 border-b border-white/10">
        <form onSubmit={handleFollowUpSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={followUpQuery}
              onChange={e => setFollowUpQuery(e.target.value)}
              disabled={panel.isProcessing}
              placeholder="Ask a follow-up to refine this chart..."
              className="w-full bg-white/80 backdrop-blur border border-outline-variant/30 rounded-full py-2 pl-4 pr-10 text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:outline-none transition-all shadow-sm disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={panel.isProcessing || !followUpQuery.trim()}
            className="w-9 h-9 rounded-full bg-primary/90 text-on-primary flex items-center justify-center hover:bg-primary hover:scale-105 active:scale-95 transition-all shadow-sm shadow-primary/20 disabled:opacity-40 disabled:pointer-events-none shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
          </button>
        </form>

        {/* Conversation History Trail */}
        {panel.history.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {panel.history.map((entry, i) => (
              <span
                key={i}
                className="text-[10px] px-2.5 py-1 flex items-center gap-1 rounded-full bg-primary/5 border border-primary/10 text-primary truncate max-w-[180px]"
                title={entry.query}
              >
                <span className="material-symbols-outlined text-[10px]">history</span>
                {entry.query.length > 30 ? entry.query.substring(0, 30) + '...' : entry.query}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Chart Body & Insights */}
      <div className="p-6">
        <DynamicRenderer
          uiSpec={panel.isProcessing ? null : panel.uiSpec}
          isLoading={panel.isProcessing}
          error={panel.error}
        />
      </div>
    </motion.div>
  );
}
