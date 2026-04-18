import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChatTurn } from './ChatTurn';

export interface ActivityTurn {
  id: string;
  query: string;
  uiSpec: any | null;
  sql: string;
  history: Array<{query: string, sql: string}>;
  isProcessing: boolean;
  error: string | null;
  createdAt: Date;
  cannotAnswer?: boolean;
  fallbackReason?: string;
  suggestions?: string[];
}

interface ActivityStreamProps {
  stream: ActivityTurn[];
  onReply: (turn: ActivityTurn) => void;
  onCommand: (query: string) => void;
}

export function ActivityStream({ stream, onReply, onCommand }: ActivityStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new items are added
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [stream.length, stream[stream.length - 1]?.isProcessing]);

  if (stream.length === 0) {
    return (
      <div className="flex flex-col items-center h-full opacity-60">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-sm">
          <span className="material-symbols-outlined text-[32px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            assistant
          </span>
        </div>
        <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Welcome to your Conversation Canvas</h2>
        <p className="text-sm text-outline max-w-md text-center leading-relaxed">
          Ask any question about your data. The dashboard will build itself as we chat. Try asking about revenue, active customers, or churn trends.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-32 pt-8">
      <AnimatePresence mode="popLayout">
        {stream.map((turn, index) => (
          <motion.div
            key={turn.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <ChatTurn turn={turn} onReply={onReply} onCommand={onCommand} />
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
