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
import { AlertCircle, TrendingUp, TrendingDown, Lightbulb, BarChart3, Target, AlertTriangle, Info } from 'lucide-react';
import { motion } from "framer-motion";

// Chart Renderers
import {
  RenderBarChart,
  RenderLineChart,
  RenderAreaChart,
  RenderPieChart,
  RenderRadialChart,
  RenderHeatmap,
} from "./ChartRenderers";

interface Column {
  Header?: string;
  header?: string;
  accessor: string;
}

interface ComponentProps {
  title?: string;
  value?: any;
  description?: string;
  trend?: number;
  icon?: string;
  columns?: Column[];
  data?: any[];
  caption?: string;
  label?: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  // Chart-specific props
  categoryKey?: string;
  dataKey?: string | string[];
  nameKey?: string;
  maxValue?: number;
  // Heatmap-specific props
  xKey?: string;
  yKey?: string;
  valueKey?: string;
}

interface ComponentSpec {
  type: 'Card' | 'Table' | 'Progress' | 'Badge' | 'BarChart' | 'LineChart' | 'AreaChart' | 'PieChart' | 'RadialChart' | 'Heatmap';
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
 * Render a single component based on its type and props
 */
function renderComponent(component: ComponentSpec) {
  if (!component || !component.type) {
    return <div className="text-muted-foreground">No component to render</div>;
  }

  const { type, props } = component;

  switch (type) {
    case 'Card':
      return <RenderCard {...props} />;
    case 'Table':
      return <RenderTable {...props} />;
    case 'Progress':
      return <RenderProgress {...props} />;
    case 'Badge':
      return <RenderBadge {...props} />;
    // Chart Components
    case 'BarChart':
      return <RenderBarChart data={props.data || []} categoryKey={props.categoryKey || ''} dataKey={props.dataKey || ''} />;
    case 'LineChart':
      return <RenderLineChart data={props.data || []} categoryKey={props.categoryKey || ''} dataKey={props.dataKey || ''} />;
    case 'AreaChart':
      return <RenderAreaChart data={props.data || []} categoryKey={props.categoryKey || ''} dataKey={props.dataKey || ''} />;
    case 'PieChart':
      return <RenderPieChart data={props.data || []} categoryKey={props.categoryKey || ''} dataKey={props.dataKey || ''} nameKey={props.nameKey} />;
    case 'RadialChart':
      return <RenderRadialChart data={props.data || []} categoryKey={props.categoryKey || ''} dataKey={props.dataKey || ''} nameKey={props.nameKey} maxValue={props.maxValue} />;
    case 'Heatmap':
      return <RenderHeatmap data={props.data || []} xKey={props.xKey || ''} yKey={props.yKey || ''} valueKey={props.valueKey || ''} />;
    default:
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
}

/**
 * Insights Section Component - Displays AI-generated insights below the chart
 */
function InsightsSection({ insights }: { insights: Insight[] }) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'summary':
        return <BarChart3 className="h-4 w-4" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4" />;
      case 'peak':
        return <Target className="h-4 w-4" />;
      case 'comparison':
        return <BarChart3 className="h-4 w-4" />;
      case 'anomaly':
        return <AlertTriangle className="h-4 w-4" />;
      case 'recommendation':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getInsightStyles = (type: string, priority: string) => {
    // Priority-based border intensity
    const borderOpacity = priority === 'high' ? 'border-l-4' : 'border-l-2';
    
    // Type-based colors
    switch (type) {
      case 'summary':
        return `${borderOpacity} border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20`;
      case 'trend':
        return `${borderOpacity} border-l-green-500 bg-green-50/50 dark:bg-green-950/20`;
      case 'peak':
        return `${borderOpacity} border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20`;
      case 'comparison':
        return `${borderOpacity} border-l-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20`;
      case 'anomaly':
        return `${borderOpacity} border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20`;
      case 'recommendation':
        return `${borderOpacity} border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20`;
      default:
        return `${borderOpacity} border-l-gray-400 bg-gray-50/50 dark:bg-gray-950/20`;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'summary': return 'text-blue-600 dark:text-blue-400';
      case 'trend': return 'text-green-600 dark:text-green-400';
      case 'peak': return 'text-purple-600 dark:text-purple-400';
      case 'comparison': return 'text-cyan-600 dark:text-cyan-400';
      case 'anomaly': return 'text-amber-600 dark:text-amber-400';
      case 'recommendation': return 'text-emerald-600 dark:text-emerald-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="mt-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-foreground">Key Insights</h3>
      </div>
      
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
            className={`p-4 rounded-lg ${getInsightStyles(insight.type, insight.priority)}`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${getIconColor(insight.type)}`}>
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  {insight.text}
                </p>
                {insight.evidence && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    📊 {insight.evidence}
                  </p>
                )}
              </div>
              {insight.priority === 'high' && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  High Priority
                </span>
              )}
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
function RenderCard({ title, value, description, trend, icon }: ComponentProps) {
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
function RenderTable({ columns, data, caption }: ComponentProps) {
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
                {columns.map((col, idx) => (
                  <TableHead key={idx} className="font-mono text-xs uppercase whitespace-nowrap">
                    {col.Header || col.header || col.accessor}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 100).map((row, rowIdx) => (
                <TableRow key={rowIdx}>
                  {columns.map((col, colIdx) => (
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
function RenderProgress({ value, label }: ComponentProps) {
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
function RenderBadge({ label, variant = 'default' }: ComponentProps) {
  return (
    <Badge variant={variant} className="text-lg px-4 py-2">
      {label}
    </Badge>
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

export default DynamicRenderer;
