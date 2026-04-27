import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamicRenderer } from '../DynamicRenderer';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle, Code2, ChevronDown, Lightbulb } from 'lucide-react';

export interface DashboardPanelData {
  id: string;
  title: string;
  suggestedType?: string;
  uiSpec: any | null;
  sql: string | null;
  error: string | null;
  isLoading: boolean;
}

interface DashboardPanelProps {
  panel: DashboardPanelData;
}

export function DashboardPanel({ panel }: DashboardPanelProps) {
  const [sqlOpen, setSqlOpen]         = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);

  const { title, uiSpec, sql, error, isLoading } = panel;
  const insights = uiSpec?.insights ?? [];
  const hasInsights = insights.length > 0;
  const hasSql = !!sql && !isLoading && !error;

  // Drawers reduce the chart area — track if any are open
  const drawerOpen = sqlOpen || insightsOpen;

  return (
    <div className="dashboard-panel group h-full flex flex-col rounded-2xl border border-slate-200/70 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">

      {/* ── Panel Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2 shrink-0 border-b border-slate-100/80 dark:border-slate-800/60">
        <h3 className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 tracking-tight truncate pr-2">
          {isLoading ? (
            <Skeleton className="h-4 w-32 rounded" />
          ) : title}
        </h3>

        {/* Action pills — SQL and Insights toggles */}
        {!isLoading && !error && (
          <div className="flex items-center gap-1 shrink-0">
            {hasInsights && (
              <ActionPill
                icon={<Lightbulb size={11} />}
                label={`${insights.length}`}
                active={insightsOpen}
                activeColor="amber"
                onClick={() => { setInsightsOpen(v => !v); setSqlOpen(false); }}
                title="Key Insights"
              />
            )}
            {hasSql && (
              <ActionPill
                icon={<Code2 size={11} />}
                label="SQL"
                active={sqlOpen}
                activeColor="violet"
                onClick={() => { setSqlOpen(v => !v); setInsightsOpen(false); }}
                title="View SQL"
              />
            )}
          </div>
        )}
      </div>

      {/* ── Collapsible Drawers ───────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {insightsOpen && hasInsights && (
          <DrawerSlide key="insights">
            <div className="space-y-2 py-2.5 px-4">
              {insights.slice(0, 5).map((ins: any, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full ${insightDotColor(ins.type)}`} />
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{ins.text}</p>
                </div>
              ))}
            </div>
          </DrawerSlide>
        )}

        {sqlOpen && hasSql && (
          <DrawerSlide key="sql">
            <pre className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 m-2 rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-28">
              {sql}
            </pre>
          </DrawerSlide>
        )}
      </AnimatePresence>

      {/* ── Chart Area ───────────────────────────────────────────────────── */}
      {/* 
        Key: overflow-hidden on the chart area, and DynamicRenderer strips its own 
        top title/description since the panel header already shows the title.
        Charts must fill 100% of the available height — achieved by flex-1 + h-0 trick.
      */}
      <div className={`flex-1 min-h-0 flex flex-col ${drawerOpen ? 'px-3 pb-3' : 'px-3 pt-2 pb-3'}`}>
        {isLoading && <PanelSkeleton />}

        {!isLoading && error && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
            <AlertCircle size={18} className="text-red-400/70" />
            <p className="text-[11px] text-slate-400 max-w-[160px] leading-relaxed">{error}</p>
          </div>
        )}

        {!isLoading && !error && uiSpec && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="flex-1 min-h-0 overflow-hidden"
          >
            {/*
              Pass a modified uiSpec with no top-level title/description
              so the panel header is the only title shown.
            */}
            <ChartOnlyRenderer uiSpec={uiSpec} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── ChartOnlyRenderer ─────────────────────────────────────────────────────────
// Strips the title/description and insights from the uiSpec before rendering,
// since the panel header already shows the title and insights are in the drawer.
// This makes the chart fill the full panel height with no wasted space.

function ChartOnlyRenderer({ uiSpec }: { uiSpec: any }) {
  // Create a spec without title, description, insights so DynamicRenderer
  // only renders the component itself inside a height-filling container.
  const chartSpec = {
    ...uiSpec,
    title: '',
    description: undefined,
    insights: [],
  };

  return (
    <div className="h-full w-full flex flex-col">
      <DynamicRenderer uiSpec={chartSpec} isLoading={false} error={null} />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DrawerSlide({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="overflow-hidden border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 shrink-0"
    >
      {children}
    </motion.div>
  );
}

function ActionPill({
  icon, label, active, activeColor, onClick, title,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  activeColor: 'violet' | 'amber';
  onClick: () => void;
  title: string;
}) {
  const colorMap = {
    violet: active
      ? 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-700/50'
      : 'bg-slate-50 text-slate-400 border-slate-200/80 hover:bg-slate-100 hover:text-slate-600 dark:bg-slate-800 dark:border-slate-700',
    amber: active
      ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700/50'
      : 'bg-slate-50 text-slate-400 border-slate-200/80 hover:bg-slate-100 hover:text-slate-600 dark:bg-slate-800 dark:border-slate-700',
  };

  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium transition-all duration-150 ${colorMap[activeColor]}`}
    >
      {icon}
      {label}
      <ChevronDown size={9} className={`transition-transform duration-200 ${active ? 'rotate-180' : ''}`} />
    </button>
  );
}

function insightDotColor(type: string) {
  switch (type) {
    case 'trend':          return 'bg-emerald-400';
    case 'peak':           return 'bg-purple-400';
    case 'anomaly':        return 'bg-red-400';
    case 'comparison':     return 'bg-cyan-400';
    case 'recommendation': return 'bg-teal-400';
    default:               return 'bg-blue-400';
  }
}

function PanelSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-3 pt-1">
      <Skeleton className="h-5 w-1/2 rounded-lg" />
      <Skeleton className="flex-1 rounded-xl min-h-[80px]" />
    </div>
  );
}
