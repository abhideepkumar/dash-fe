import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from "framer-motion";

// Chart Renderers
import {
  RenderBarChart,
  RenderLineChart,
  RenderAreaChart,
  RenderPieChart,
  RenderRadialChart,
  RenderHeatmap,
  RenderScatterChart,
  RenderWaterfallChart,
  RenderFunnelChart,
  RenderTreeMap,
  RenderComboChart,
} from "./ChartRenderers";

// ============================================
// EXTENSIBLE TYPES - open to new components
// ============================================

interface ComponentProps {
  [key: string]: any; // Open to any props from backend
}

interface ComponentSpec {
  type: string; // Open to any component type from metadata
  props: ComponentProps;
}

// Insight type from backend
interface Insight {
  type: 'summary' | 'trend' | 'peak' | 'comparison' | 'anomaly' | 'recommendation' | 'info' | 'error';
  priority: 'high' | 'medium' | 'low';
  text: string;
  evidence?: string;
  score?: number;
}

interface UISpec {
  title: string;
  description?: string;
  component: ComponentSpec;
  insights?: Insight[];
}

interface DynamicRendererProps {
  uiSpec: UISpec | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// COMPONENT REGISTRY - defined after all renderers below
// (forward-declared here so TypeScript knows the type)
// ============================================
// See COMPONENT_REGISTRY definition after all renderer functions at bottom of file.

/**
 * DynamicRenderer - Renders UI components based on a UI specification from the backend
 */
export function DynamicRenderer({ uiSpec, isLoading, error }: DynamicRendererProps) {
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Visualization Error
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // No spec yet
  if (!uiSpec) {
    return null;
  }

  const { title, description, component, insights } = uiSpec;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.16, 1, 0.3, 1] // Custom easeOutExponential
      }}
      className="space-y-6"
    >
      {/* Title and Description */}
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground/90">{title}</h2>
        {description && (
          <p className="text-lg text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>

      {/* Dynamic Component */}
      <div className="mt-6">
        {renderComponent(component)}
      </div>

      {/* Insights Section */}
      {insights && insights.length > 0 && (
        <InsightsSection insights={insights} />
      )}
    </motion.div>
  );
}

/**
 * Render a single component using the registry pattern.
 * All props are spread through — no manual destructuring, no silent prop drops.
 */
function renderComponent(component: ComponentSpec) {
  if (!component || !component.type) {
    return <div className="text-muted-foreground">No component to render</div>;
  }

  const { type, props } = component;

  // Look up renderer in registry
  const Renderer = COMPONENT_REGISTRY[type];
  
  if (!Renderer) {
    return (
      <Card className="border-yellow-500">
        <CardContent className="pt-6">
          <p className="text-yellow-600">Unsupported component type: {type}</p>
          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
            {JSON.stringify(props, null, 2)}
          </pre>
        </CardContent>
      </Card>
    );
  }

  // Spread ALL props through — this fixes seriesKey, nameKey, maxValue, etc.
  return <Renderer {...props} />;
}

function InsightsSection({ insights }: { insights: Insight[] }) {
  const getInsightIconName = (type: string) => {
    switch (type) {
      case 'summary': return 'monitoring';
      case 'trend': return 'trending_up';
      case 'peak': return 'adjust';
      case 'comparison': return 'compare_arrows';
      case 'anomaly': return 'warning';
      case 'recommendation': return 'tips_and_updates';
      default: return 'info';
    }
  };

  const getInsightStyles = (type: string) => {
    const baseClasses = "relative overflow-hidden rounded-[1.5rem] border backdrop-blur-xl transition-all duration-300 hover:shadow-sm";
    switch (type) {
      case 'summary':
        return `${baseClasses} border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10`;
      case 'trend':
        return `${baseClasses} border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10`;
      case 'peak':
        return `${baseClasses} border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10`;
      case 'comparison':
        return `${baseClasses} border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10`;
      case 'anomaly':
        return `${baseClasses} border-error/20 bg-error/5 hover:bg-error/10`;
      case 'recommendation':
        return `${baseClasses} border-primary/20 bg-primary/5 hover:bg-primary/10`;
      default:
        return `${baseClasses} border-outline-variant/20 bg-surface-container-low hover:bg-surface-container`;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'summary': return 'text-blue-600 bg-blue-500/10';
      case 'trend': return 'text-emerald-600 bg-emerald-500/10';
      case 'peak': return 'text-purple-600 bg-purple-500/10';
      case 'comparison': return 'text-cyan-600 bg-cyan-500/10';
      case 'anomaly': return 'text-error bg-error/10';
      case 'recommendation': return 'text-primary bg-primary/10';
      default: return 'text-on-surface-variant bg-surface-variant/50';
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'summary': return 'bg-blue-500';
      case 'trend': return 'bg-emerald-500';
      case 'peak': return 'bg-purple-500';
      case 'comparison': return 'bg-cyan-500';
      case 'anomaly': return 'bg-error';
      case 'recommendation': return 'bg-primary';
      default: return 'bg-outline-variant';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="mt-6"
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-sm">
          <span className="material-symbols-outlined text-[16px] text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
        </div>
        <div>
           <h3 className="text-sm font-bold font-headline text-on-surface leading-none">Key Insights</h3>
        </div>
      </div>
      
      <div className="space-y-1.5 flex flex-col">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
            className={`${getInsightStyles(insight.type)} py-1`}
          >
            {/* Left emphasis border */}
            <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${getBorderColor(insight.type)} ${insight.priority === 'high' ? 'opacity-100' : 'opacity-60'}`}></div>
            
            <div className="p-2.5 pl-4 flex items-start gap-3">
              <div className={`mt-0.5 w-7 h-7 shrink-0 rounded-lg flex items-center justify-center border border-current/10 ${getIconColor(insight.type)} shadow-sm`}>
                <span className="material-symbols-outlined text-[16px]">
                  {getInsightIconName(insight.type)}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium font-body text-on-surface leading-snug">
                  {insight.text}
                </p>
                {insight.evidence && (
                  <div className="mt-2 pt-2 border-t border-current/5">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border bg-white/40 border-white/60">
                       <span className="material-symbols-outlined text-[12px] text-outline">data_object</span>
                       <span className="text-[10px] font-mono text-on-surface-variant break-all">
                         {insight.evidence}
                       </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* High Priority Badge */}
              <div className="shrink-0 flex items-center">
                {insight.priority === 'high' && (
                  <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full bg-error/10 text-error border border-error/20 whitespace-nowrap">
                    <span className="material-symbols-outlined text-[10px]">error</span>
                    High
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}


/**
 * Card Component Renderer
 */
function RenderCard({ title, value, description, trend, icon }: any) {
  return (
    <Card className="max-w-sm">
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </CardDescription>
        <CardTitle className="text-4xl font-bold">
          {formatValue(value)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {trend !== undefined && trend !== null && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{trend >= 0 ? '+' : ''}{trend}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Table Component Renderer
 */
function RenderTable({ columns, data, caption }: any) {
  if (!columns || !data || data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No data to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {caption && (
        <CardHeader className="pb-2">
          <CardDescription>{caption}</CardDescription>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col: any, idx: number) => (
                  <TableHead key={idx} className="font-mono text-xs uppercase whitespace-nowrap">
                    {col.Header || col.header || col.accessor}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 100).map((row: any, rowIdx: number) => (
                <TableRow key={rowIdx}>
                  {columns.map((col: any, colIdx: number) => (
                    <TableCell key={colIdx} className="font-mono text-sm">
                      {formatValue(row[col.accessor])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {data.length > 100 && (
          <p className="text-sm text-muted-foreground text-center py-2 italic">
            Showing first 100 of {data.length} rows
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Progress Component Renderer
 */
function RenderProgress({ value, label }: any) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));
  
  return (
    <Card className="max-w-md">
      <CardContent className="pt-6">
        {label && (
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">{label}</span>
            <span className="text-sm text-muted-foreground">{safeValue}%</span>
          </div>
        )}
        <Progress value={safeValue} className="h-3" />
      </CardContent>
    </Card>
  );
}

/**
 * Badge Component Renderer
 */
function RenderBadge({ label, variant = 'default' }: any) {
  return (
    <Badge variant={variant} className="text-lg px-4 py-2">
      {label}
    </Badge>
  );
}

/**
 * StatGrid — responsive grid of KPI metric tiles
 * Renders a metrics array (each with title, value, description, trend)
 */
function RenderStatGrid({ metrics }: { metrics: Array<{ title: string; value: any; description?: string; trend?: number }> }) {
  if (!metrics || metrics.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No metrics to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`grid gap-4 ${
      metrics.length === 2 ? 'grid-cols-2' :
      metrics.length === 3 ? 'grid-cols-3' :
      metrics.length === 4 ? 'grid-cols-2 md:grid-cols-4' :
      'grid-cols-2 md:grid-cols-3'
    }`}>
      {metrics.map((metric, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">
              {metric.title}
            </CardDescription>
            <CardTitle className="text-3xl font-bold">
              {formatValue(metric.value)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metric.description && (
              <p className="text-sm text-muted-foreground">{metric.description}</p>
            )}
            {metric.trend !== undefined && metric.trend !== null && (
              <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${
                Number(metric.trend) >= 0 ? 'text-emerald-600' : 'text-red-500'
              }`}>
                {Number(metric.trend) >= 0
                  ? <TrendingUp className="h-3.5 w-3.5" />
                  : <TrendingDown className="h-3.5 w-3.5" />}
                <span>{Number(metric.trend) >= 0 ? '+' : ''}{metric.trend}%</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * GaugeChart — semicircular gauge with Red/Yellow/Green zones
 * Pure SVG implementation, no external dependencies needed.
 */
function RenderGaugeChart({ value, max = 100, min = 0, label, unit = '' }: any) {
  const safeValue = Math.min(max, Math.max(min, Number(value) || 0));
  const range = max - min;
  const pct = range > 0 ? ((safeValue - min) / range) * 100 : 0;

  // Color based on percentage thresholds
  const color = pct < 33 ? 'hsl(0, 72%, 51%)' : pct < 66 ? 'hsl(47, 95%, 53%)' : 'hsl(142, 71%, 45%)';
  // Arc circumference for a 90-radius semicircle = π * 90 ≈ 282.7
  const ARC_LENGTH = 282.7;

  return (
    <div className="flex flex-col items-center max-w-xs mx-auto">
      {/* SVG-based semicircle gauge */}
      <div className="relative w-64 h-36 overflow-hidden">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {/* Background track */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="18"
            strokeLinecap="round"
          />
          {/* Danger zone tint (full arc at low opacity) */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="hsl(0,72%,51%)"
            strokeWidth="18"
            strokeLinecap="butt"
            strokeOpacity={0.12}
          />
          {/* Value arc */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke={color}
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * ARC_LENGTH} ${ARC_LENGTH}`}
          />
          {/* Center value */}
          <text x="100" y="88" textAnchor="middle" fontSize="28" fontWeight="700" fill="hsl(var(--foreground))">
            {Number(safeValue).toLocaleString()}{unit}
          </text>
          <text x="100" y="108" textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))">
            {label || ''}
          </text>
        </svg>
      </div>
      {/* Zone labels */}
      <div className="flex items-center justify-between w-full px-2 mt-1 text-[10px] text-muted-foreground">
        <span className="text-red-500 font-medium">{Number(min).toLocaleString()}</span>
        <span className="text-yellow-500 font-medium">{Number(min + range * 0.33).toFixed(0)}</span>
        <span className="text-emerald-500 font-medium">{Number(min + range * 0.66).toFixed(0)}</span>
        <span className="text-emerald-600 font-semibold">{Number(max).toLocaleString()}{unit}</span>
      </div>
      {/* Status badge */}
      <div className="mt-3 px-3 py-1 rounded-full text-xs font-bold" style={{ background: color + '20', color }}>
        {pct < 33 ? 'Below Target' : pct < 66 ? 'On Track' : 'Target Achieved'}
      </div>
    </div>
  );
}

/**
 * Format a value for display
 */
function formatValue(value: any) {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'number') {
    // Format large numbers with commas
    return value.toLocaleString();
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  return String(value);
}

// ============================================
// COMPONENT REGISTRY - defined here AFTER all renderer functions
// so all function references are guaranteed to be in scope.
// ============================================
const COMPONENT_REGISTRY: Record<string, React.FC<any>> = {
  // Original components
  Card: RenderCard,
  Table: RenderTable,
  Progress: RenderProgress,
  Badge: RenderBadge,
  BarChart: RenderBarChart,
  LineChart: RenderLineChart,
  AreaChart: RenderAreaChart,
  PieChart: RenderPieChart,
  RadialChart: RenderRadialChart,
  Heatmap: RenderHeatmap,
  // New components
  ScatterChart: RenderScatterChart,
  WaterfallChart: RenderWaterfallChart,
  FunnelChart: RenderFunnelChart,
  TreeMap: RenderTreeMap,
  ComboChart: RenderComboChart,
  StatGrid: RenderStatGrid,
  GaugeChart: RenderGaugeChart,
};

export default DynamicRenderer;
