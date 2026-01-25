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
}

interface ComponentSpec {
  type: 'Card' | 'Table' | 'Progress' | 'Badge';
  props: ComponentProps;
}

interface UISpec {
  title: string;
  description?: string;
  component: ComponentSpec;
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

  const { title, description, component } = uiSpec;

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
