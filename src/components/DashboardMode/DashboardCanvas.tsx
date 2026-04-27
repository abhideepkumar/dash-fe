import { useMemo } from 'react';
import { Responsive, useContainerWidth } from 'react-grid-layout';
import type { LayoutItem } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { motion } from 'framer-motion';
import { DashboardPanel, type DashboardPanelData } from './DashboardPanel';
import { LayoutDashboard } from 'lucide-react';

// ── Layout helpers ────────────────────────────────────────────────────────────

function getDefaultSize(type: string | undefined): { w: number; h: number } {
  switch (type) {
    case 'Card':       return { w: 3, h: 6 };
    case 'StatGrid':   return { w: 6, h: 6 };
    case 'GaugeChart':
    case 'RadialChart':
    case 'PieChart':   return { w: 4, h: 10 };
    case 'FunnelChart': return { w: 4, h: 10 };
    case 'Table':      return { w: 12, h: 10 };
    case 'Heatmap':    return { w: 8, h: 10 };
    case 'WaterfallChart':
    case 'ComboChart':
    case 'ScatterChart':
    case 'TreeMap':    return { w: 6, h: 10 };
    case 'BarChart':
    case 'LineChart':
    case 'AreaChart':
    default:           return { w: 6, h: 10 };
  }
}

/**
 * Greedy row-pack: place panels left-to-right, wrapping when they don't fit.
 * Cards are grouped in a top row, charts fill the main area, tables go full-width at the end.
 */
function buildLayout(panels: DashboardPanelData[]): LayoutItem[] {
  const items: LayoutItem[] = [];

  // Separate by type priority: cards first, then charts, then tables
  const cards = panels.filter(p => p.suggestedType === 'Card' || p.suggestedType === 'StatGrid');
  const tables = panels.filter(p => p.suggestedType === 'Table');
  const charts = panels.filter(p => !cards.includes(p) && !tables.includes(p));
  const ordered = [...cards, ...charts, ...tables];

  let curX = 0;
  let curY = 0;
  let rowH = 0;

  for (const panel of ordered) {
    const { w, h } = getDefaultSize(panel.suggestedType);

    if (curX + w > 12) {
      curX = 0;
      curY += rowH;
      rowH = 0;
    }

    items.push({ i: panel.id, x: curX, y: curY, w, h, minH: 5, minW: 2 });
    curX += w;
    rowH = Math.max(rowH, h);
  }

  return items;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface DashboardCanvasProps {
  dashboardTitle: string;
  sharedContext?: {
    timeRange?: string | null;
    primaryEntity?: string;
    primaryMetric?: string;
  };
  panels: DashboardPanelData[];
}

export function DashboardCanvas({ dashboardTitle, sharedContext, panels }: DashboardCanvasProps) {
  const { width, containerRef, mounted } = useContainerWidth({ initialWidth: 1280 });

  const layout = useMemo(
    () => buildLayout(panels),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [panels.map(p => p.id).join(',')]
  );

  const layouts = { lg: layout, md: layout, sm: layout };

  return (
    <div className="w-full min-h-screen">
      {/* ── Dashboard Header ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="px-6 lg:px-8 pt-5 pb-4"
      >
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/40">
                <LayoutDashboard size={16} className="text-violet-600 dark:text-violet-400" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                {dashboardTitle}
              </h1>
            </div>
            {sharedContext && (
              <div className="flex items-center gap-2 flex-wrap ml-9">
                {sharedContext.timeRange && (
                  <ContextBadge icon="schedule" label={sharedContext.timeRange} />
                )}
                {sharedContext.primaryEntity && (
                  <ContextBadge icon="category" label={sharedContext.primaryEntity} />
                )}
                {sharedContext.primaryMetric && (
                  <ContextBadge icon="bar_chart" label={sharedContext.primaryMetric} />
                )}
              </div>
            )}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 pb-1">
            <span className="material-symbols-outlined text-[13px]">drag_pan</span>
            Drag · Resize
          </span>
        </div>

        {/* Accent rule */}
        <div className="mt-3 h-px bg-gradient-to-r from-violet-300/70 via-purple-200/50 to-transparent dark:from-violet-700/40 dark:via-purple-800/30" />
      </motion.div>

      {/* ── Full-width Grid ───────────────────────────────────────────────── */}
      <div ref={containerRef} className="w-full px-4 lg:px-6 pb-10">
        {mounted && (
          <Responsive
            width={width}
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 960, sm: 600 }}
            cols={{ lg: 12, md: 12, sm: 6 }}
            rowHeight={44}
            margin={[12, 12]}
            containerPadding={[0, 0]}
            dragConfig={{ enabled: true }}
            resizeConfig={{ enabled: true }}
          >
            {panels.map((panel, i) => (
              <div key={panel.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full"
                >
                  <DashboardPanel panel={panel} />
                </motion.div>
              </div>
            ))}
          </Responsive>
        )}
      </div>
    </div>
  );
}

function ContextBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[10px] font-medium border border-slate-200/60 dark:border-slate-700/50">
      <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>
        {icon}
      </span>
      {label}
    </span>
  );
}
