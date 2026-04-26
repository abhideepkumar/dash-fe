"use client";

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  PolarGrid,
  PolarRadiusAxis,
  Label,
  ScatterChart,
  Scatter,
  ZAxis,
  FunnelChart,
  Funnel,
  LabelList,
  Treemap,
  ComposedChart,
  Tooltip,
  ReferenceLine,
  Legend,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { Card, CardContent } from "@/components/ui/card";

// Premium color palette for charts
const CHART_COLORS = [
  "hsl(221, 83%, 53%)",  // Blue
  "hsl(142, 71%, 45%)",  // Green
  "hsl(262, 83%, 58%)",  // Purple
  "hsl(24, 95%, 53%)",   // Orange
  "hsl(340, 75%, 55%)",  // Pink
  "hsl(47, 95%, 53%)",   // Yellow
  "hsl(186, 72%, 42%)",  // Teal
  "hsl(0, 72%, 51%)",    // Red
];

// Helper to build chart config from data keys
function buildChartConfig(keys: string[]): ChartConfig {
  const config: ChartConfig = {};
  keys.forEach((key, i) => {
    config[key] = {
      label: formatLabel(key),
      color: CHART_COLORS[i % CHART_COLORS.length],
    };
  });
  return config;
}

// Format column names to human-readable labels
function formatLabel(str: string): string {
  if (!str) return 'Value';
  return String(str)
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

// Time-based category keys that may have a companion "year" column
const TIME_UNITS = new Set(['week', 'month', 'quarter', 'day', 'hour']);

// Month name lookup for human-readable labels
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Preprocesses time-series data where week/month/quarter exists alongside a year column.
 * Synthesizes a compound "__period__" key used as the real categoryKey so that
 * year rollovers (week 52 → week 1) display correctly on the x-axis.
 * Also sorts the data chronologically (year asc, then unit asc).
 */
function preprocessTimeSeries(
  data: any[],
  categoryKey: string
): { data: any[], categoryKey: string } {
  if (!data || data.length === 0) return { data, categoryKey };

  const isTimeUnit = TIME_UNITS.has(String(categoryKey).toLowerCase());
  
  // Try to find if any row contains a 'year' key (case insensitive)
  let yearKey = '';
  for (const key of Object.keys(data[0] || {})) {
    if (key.toLowerCase() === 'year') {
      yearKey = key;
      break;
    }
  }

  if (!isTimeUnit || !yearKey) return { data, categoryKey };

  // Sort chronologically: year asc, then unit asc
  const sorted = [...data].sort((a, b) => {
    const yearDiff = Number(a[yearKey] || 0) - Number(b[yearKey] || 0);
    if (yearDiff !== 0) return yearDiff;
    return Number(a[categoryKey] || 0) - Number(b[categoryKey] || 0);
  });

  // Synthesize a human-readable compound period label
  const unit = String(categoryKey).toLowerCase();
  const processed = sorted.map(row => {
    const rawVal = row[categoryKey];
    if (rawVal === undefined || rawVal === null) return row;
    
    // For years like '2025' or 2025, extract '25'
    const yrRaw = row[yearKey];
    const yr = yrRaw ? String(Number(yrRaw)).slice(-2) : '';
    const val = Number(rawVal);
    let label = String(rawVal);

    if (yr) {
      if (unit === 'month' && !isNaN(val)) {
        label = `${MONTH_NAMES[val - 1] || val} '${yr}`;
      } else if (unit === 'week') {
        label = `W${val} '${yr}`;
      } else if (unit === 'quarter') {
        label = `Q${val} '${yr}`;
      } else {
        label = `${val} '${yr}`;
      }
    }

    return { ...row, __period__: label };
  });

  return { data: processed, categoryKey: '__period__' };
}

/**
 * Ensures specified columns are numeric so that Recharts doesn't calculate Y-axis domains
 * using alphabetical string comparison (where "81000" > "600000").
 * PostgreSQL pg driver returns BigInt and Decimal as strings by default.
 */
function parseNumericColumns(data: any[], numericKeys: string[]): any[] {
  if (!data || data.length === 0 || !numericKeys || numericKeys.length === 0) return data;
  
  return data.map(row => {
    const newRow = { ...row };
    numericKeys.forEach(k => {
      const val = newRow[k];
      if (typeof val === 'string' && val.trim() !== '') {
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) {
          newRow[k] = parsed;
        }
      }
    });
    return newRow;
  });
}

interface ChartProps {
  data: any[];
  categoryKey: string;
  dataKey: string | string[];
  nameKey?: string;
  maxValue?: number;
  seriesKey?: string; // For multi-series charts (groups data by this column)
}

/**
 * Bar Chart Renderer
 * Supports multi-series via seriesKey prop (creates grouped bars)
 */
export function RenderBarChart({ data, categoryKey, dataKey, seriesKey }: ChartProps) {
  // Preprocess: synthesize compound period label when year column co-exists with a time unit
  const pre = preprocessTimeSeries(data, categoryKey);
  categoryKey = pre.categoryKey;

  const valueKeys = Array.isArray(dataKey) ? dataKey : [dataKey];
  // Parse numeric values before pivoting so Recharts scales correctly
  data = parseNumericColumns(pre.data, valueKeys);

  const valueKey = valueKeys[0];
  
  // If seriesKey provided, pivot data for multi-series grouped bars
  let chartData = data;
  let seriesNames: string[] = [];
  
  if (seriesKey) {
    // Get unique series values
    seriesNames = [...new Set(data.map(row => String(row[seriesKey])))];
    
    // Get unique category values
    const categories = [...new Set(data.map(row => row[categoryKey]))];
    
    // Pivot: create one row per category with columns for each series
    chartData = categories.map(cat => {
      const row: Record<string, any> = { [categoryKey]: cat };
      seriesNames.forEach(series => {
        const matchingRow = data.find(
          d => d[categoryKey] === cat && String(d[seriesKey]) === series
        );
        row[series] = matchingRow ? matchingRow[valueKey] : 0;
      });
      return row;
    });
  }
  
  // Keys for bars: either series names (multi-series) or original dataKey
  const keys = seriesKey ? seriesNames : (Array.isArray(dataKey) ? dataKey : [dataKey]);
  const chartConfig = buildChartConfig(keys);

  return (
    <Card>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey={categoryKey} 
              tickLine={false} 
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => String(value).slice(0, 12)}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {keys.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
            {keys.map((key, i) => (
              <Bar 
                key={key} 
                dataKey={key} 
                fill={CHART_COLORS[i % CHART_COLORS.length]} 
                radius={[4, 4, 0, 0]} 
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Line Chart Renderer
 * Supports multi-series via seriesKey prop
 */
export function RenderLineChart({ data, categoryKey, dataKey, seriesKey }: ChartProps) {
  // Preprocess: synthesize compound period label when year column co-exists with a time unit
  const pre = preprocessTimeSeries(data, categoryKey);
  categoryKey = pre.categoryKey;

  const valueKeys = Array.isArray(dataKey) ? dataKey : [dataKey];
  // Parse numeric values before pivoting so Recharts scales correctly
  data = parseNumericColumns(pre.data, valueKeys);

  const valueKey = valueKeys[0];
  
  // If seriesKey provided, pivot data for multi-series
  let chartData = data;
  let seriesNames: string[] = [];
  
  if (seriesKey) {
    // Get unique series values
    seriesNames = [...new Set(data.map(row => String(row[seriesKey])))];
    
    // Get unique category values
    const categories = [...new Set(data.map(row => row[categoryKey]))];
    
    // Pivot: create one row per category with columns for each series
    chartData = categories.map(cat => {
      const row: Record<string, any> = { [categoryKey]: cat };
      seriesNames.forEach(series => {
        const matchingRow = data.find(
          d => d[categoryKey] === cat && String(d[seriesKey]) === series
        );
        row[series] = matchingRow ? matchingRow[valueKey] : null;
      });
      return row;
    });
  }
  
  // Keys for lines: either series names (multi-series) or original dataKey
  const keys = seriesKey ? seriesNames : (Array.isArray(dataKey) ? dataKey : [dataKey]);
  const chartConfig = buildChartConfig(keys);

  return (
    <Card>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <LineChart data={chartData} accessibilityLayer>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey={categoryKey} 
              tickLine={false} 
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => String(value).slice(0, 12)}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {keys.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
            {keys.map((key, i) => (
              <Line 
                key={key} 
                type="monotone"
                dataKey={key} 
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS[i % CHART_COLORS.length], strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Area Chart Renderer
 */
export function RenderAreaChart({ data, categoryKey, dataKey }: ChartProps) {
  // Preprocess: synthesize compound period label when year column co-exists with a time unit
  const pre = preprocessTimeSeries(data, categoryKey);
  categoryKey = pre.categoryKey;

  const keys = Array.isArray(dataKey) ? dataKey : [dataKey];
  data = parseNumericColumns(pre.data, keys);

  const chartConfig = buildChartConfig(keys);

  return (
    <Card>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <AreaChart data={data} accessibilityLayer>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey={categoryKey} 
              tickLine={false} 
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => String(value).slice(0, 12)}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {keys.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
            {keys.map((key, i) => (
              <Area 
                key={key} 
                type="monotone"
                dataKey={key} 
                fill={CHART_COLORS[i % CHART_COLORS.length]}
                fillOpacity={0.3}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Pie Chart Renderer
 */
export function RenderPieChart({ data, nameKey, dataKey }: ChartProps) {
  const key = Array.isArray(dataKey) ? dataKey[0] : dataKey;
  const labelKey = nameKey || 'name';
  
  // Build config from data labels
  const chartConfig: ChartConfig = {};
  data.forEach((item, i) => {
    const label = item[labelKey];
    chartConfig[label] = {
      label: label,
      color: CHART_COLORS[i % CHART_COLORS.length],
    };
  });

  // Ensure the value used for sizing the pie slices is a number
  const parsedData = data.map(item => ({
    ...item,
    [key]: typeof item[key] === 'string' ? parseFloat(item[key]) : item[key]
  }));

  return (
    <Card>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <PieChart accessibilityLayer>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={parsedData}
              dataKey={key}
              nameKey={labelKey}
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={60}
              paddingAngle={2}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={false}
            >
              {parsedData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey={labelKey} />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Radial Chart Renderer
 */
export function RenderRadialChart({ data, nameKey, dataKey, maxValue = 100 }: ChartProps) {
  const key = Array.isArray(dataKey) ? dataKey[0] : dataKey;
  const labelKey = nameKey || 'name';
  
  // Prepare data with fill colors and parse numbers
  const chartData = data.map((item, i) => ({
    ...item,
    [key]: typeof item[key] === 'string' ? parseFloat(item[key]) : item[key],
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // Build config
  const chartConfig: ChartConfig = {};
  chartData.forEach((item, i) => {
    const label = item[labelKey];
    chartConfig[label] = {
      label: label,
      color: CHART_COLORS[i % CHART_COLORS.length],
    };
  });

  // For single value, show as gauge
  if (chartData.length === 1) {
    const value = chartData[0][key];
    const percentage = Math.min(100, (value / maxValue) * 100);
    
    return (
      <Card>
        <CardContent className="pt-6">
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <RadialBarChart
              data={[{ value: percentage, fill: CHART_COLORS[0] }]}
              startAngle={180}
              endAngle={0}
              innerRadius="60%"
              outerRadius="100%"
            >
              <PolarRadiusAxis tick={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 10}
                            className="fill-foreground text-4xl font-bold"
                          >
                            {Number(value).toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="fill-muted-foreground text-sm"
                          >
                            {chartData[0][labelKey] || 'Value'}
                          </tspan>
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </PolarRadiusAxis>
              <RadialBar
                dataKey="value"
                background
                cornerRadius={10}
              />
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }

  // For multiple values, show as radial bar chart
  return (
    <Card>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <RadialBarChart
            data={chartData}
            innerRadius="20%"
            outerRadius="90%"
          >
            <ChartTooltip content={<ChartTooltipContent nameKey={labelKey} />} />
            <PolarGrid gridType="circle" />
            <RadialBar
              dataKey={key}
              background
              cornerRadius={5}
              label={{ position: 'insideStart', fill: '#fff', fontSize: 12 }}
            />
            <ChartLegend content={<ChartLegendContent nameKey={labelKey} />} />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Heatmap Props
 */
interface HeatmapProps {
  data: any[];
  xKey: string;   // Column for x-axis (e.g., month)
  yKey: string;   // Column for y-axis (e.g., user_name)
  valueKey: string; // Column for cell value (color intensity)
}

/**
 * Heatmap Renderer
 * Creates a 2D grid with color intensity based on numeric values
 */
export function RenderHeatmap({ data, xKey, yKey, valueKey }: HeatmapProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No data to display</p>
        </CardContent>
      </Card>
    );
  }

  // Extract unique x and y values, and sort x-axis (for proper month/date ordering)
  const xValues = [...new Set(data.map(row => row[xKey]))].sort((a, b) => {
    // Sort numerically if both are numbers, otherwise alphabetically
    const aNum = Number(a);
    const bNum = Number(b);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return String(a).localeCompare(String(b));
  });
  const yValues = [...new Set(data.map(row => row[yKey]))];
  
  // Find min/max for color scaling
  const values = data.map(row => Number(row[valueKey]) || 0);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;
  
  // Create lookup map for O(1) access
  const valueMap = new Map<string, number>();
  data.forEach(row => {
    const key = `${row[xKey]}|${row[yKey]}`;
    valueMap.set(key, Number(row[valueKey]) || 0);
  });
  
  // Color function: interpolate from blue (low) to red (high)
  const getColor = (value: number | undefined) => {
    if (value === undefined) return 'hsl(0, 0%, 95%)'; // Gray for missing data
    const normalized = (value - minValue) / range;
    // Blue (210°) -> Green (120°) -> Yellow (60°) -> Red (0°)
    const hue = 210 - (normalized * 210);
    const saturation = 70 + (normalized * 20);
    const lightness = 50 - (normalized * 15);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };
  
  return (
    <Card>
      <CardContent className="pt-6 overflow-x-auto">
        <div className="min-w-fit">
          {/* Header row with x-axis labels */}
          <div 
            className="grid gap-1 mb-1"
            style={{ gridTemplateColumns: `120px repeat(${xValues.length}, minmax(60px, 1fr))` }}
          >
            <div className="text-xs font-medium text-muted-foreground"></div>
            {xValues.map((x, i) => (
              <div key={i} className="text-xs font-medium text-center text-muted-foreground truncate px-1">
                {String(x)}
              </div>
            ))}
          </div>
          
          {/* Data rows */}
          {yValues.map((y, yIdx) => (
            <div 
              key={yIdx}
              className="grid gap-1 mb-1"
              style={{ gridTemplateColumns: `120px repeat(${xValues.length}, minmax(60px, 1fr))` }}
            >
              {/* Y-axis label */}
              <div className="text-xs font-medium text-muted-foreground truncate pr-2 flex items-center">
                {String(y)}
              </div>
              
              {/* Cells */}
              {xValues.map((x, xIdx) => {
                const cellKey = `${x}|${y}`;
                const cellValue = valueMap.get(cellKey);
                return (
                  <div
                    key={xIdx}
                    className="h-8 rounded-sm flex items-center justify-center text-xs font-medium transition-all hover:ring-2 hover:ring-offset-1 hover:ring-primary cursor-default"
                    style={{ 
                      backgroundColor: getColor(cellValue),
                      color: cellValue !== undefined && (cellValue - minValue) / range > 0.5 ? 'white' : 'black'
                    }}
                    title={`${y} / ${x}: ${cellValue !== undefined ? cellValue.toLocaleString() : 'N/A'}`}
                  >
                    {cellValue !== undefined ? (
                      cellValue >= 1000 ? `${(cellValue / 1000).toFixed(1)}k` : cellValue.toLocaleString()
                    ) : '-'}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>{minValue.toLocaleString()}</span>
          <div 
            className="h-3 w-32 rounded"
            style={{ 
              background: 'linear-gradient(to right, hsl(210, 70%, 50%), hsl(120, 80%, 45%), hsl(60, 85%, 45%), hsl(0, 90%, 42%))'
            }}
          />
          <span>{maxValue.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Scatter Chart Renderer
 * Supports optional sizeKey for bubble mode
 */
interface ScatterProps {
  data: any[];
  xKey: string;
  yKey: string;
  labelKey?: string;
  sizeKey?: string;
}

export function RenderScatterChart({ data, xKey, yKey, labelKey, sizeKey }: ScatterProps) {
  if (!data || data.length === 0) {
    return <Card><CardContent className="pt-6"><p className="text-muted-foreground">No data to display</p></CardContent></Card>;
  }

  const parsedData = data.map(row => ({
    ...row,
    [xKey]: parseFloat(String(row[xKey])) || 0,
    [yKey]: parseFloat(String(row[yKey])) || 0,
    ...(sizeKey ? { [sizeKey]: parseFloat(String(row[sizeKey])) || 1 } : {}),
  }));

  const chartConfig: ChartConfig = {
    scatter: { label: `${formatLabel(yKey)} vs ${formatLabel(xKey)}`, color: CHART_COLORS[0] },
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className="h-[380px] w-full">
          <ScatterChart accessibilityLayer margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={xKey}
              type="number"
              name={formatLabel(xKey)}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              label={{ value: formatLabel(xKey), position: 'insideBottom', offset: -15, fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              dataKey={yKey}
              type="number"
              name={formatLabel(yKey)}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              label={{ value: formatLabel(yKey), angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            {sizeKey && <ZAxis dataKey={sizeKey} range={[40, 400]} name={formatLabel(sizeKey)} />}
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm text-xs space-y-1">
                    {labelKey && d[labelKey] && <p className="font-semibold">{d[labelKey]}</p>}
                    <p>{formatLabel(xKey)}: <span className="font-mono">{Number(d[xKey]).toLocaleString()}</span></p>
                    <p>{formatLabel(yKey)}: <span className="font-mono">{Number(d[yKey]).toLocaleString()}</span></p>
                    {sizeKey && <p>{formatLabel(sizeKey)}: <span className="font-mono">{Number(d[sizeKey]).toLocaleString()}</span></p>}
                  </div>
                );
              }}
            />
            <Scatter data={parsedData} fill={CHART_COLORS[0]} fillOpacity={0.75}>
              {parsedData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Waterfall Chart Renderer
 * Transparent baseline bar + color-coded stacked bar
 */
interface WaterfallProps {
  data: any[];
  categoryKey: string;
  valueKey: string;
}

export function RenderWaterfallChart({ data, categoryKey, valueKey }: WaterfallProps) {
  if (!data || data.length === 0) {
    return <Card><CardContent className="pt-6"><p className="text-muted-foreground">No data to display</p></CardContent></Card>;
  }

  let running = 0;
  const chartData = data.map(row => {
    const rawVal = parseFloat(String(row[valueKey])) || 0;
    const isTotal = String(row[categoryKey]).toLowerCase().includes('total');
    const base = rawVal >= 0 ? running : running + rawVal;
    const barValue = Math.abs(rawVal);
    if (!isTotal) running += rawVal;
    return { name: row[categoryKey], base, value: barValue, rawValue: rawVal, isPositive: rawVal >= 0, isTotal };
  });

  const chartConfig: ChartConfig = {
    base: { label: 'Offset', color: 'transparent' },
    value: { label: formatLabel(valueKey), color: CHART_COLORS[0] },
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className="h-[380px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(v) => String(v).slice(0, 14)} />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm text-xs space-y-1">
                    <p className="font-semibold">{d.name}</p>
                    <p className={d.isTotal ? 'text-slate-500' : d.isPositive ? 'text-emerald-600' : 'text-red-500'}>
                      {d.isTotal ? '' : d.isPositive ? '+' : '-'}{Number(d.value).toLocaleString()}
                    </p>
                  </div>
                );
              }}
            />
            <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <Bar dataKey="base" stackId="wf" fill="transparent" radius={0} />
            <Bar dataKey="value" stackId="wf" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.isTotal ? 'hsl(217, 19%, 55%)' : entry.isPositive ? 'hsl(142, 71%, 45%)' : 'hsl(0, 72%, 51%)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />Increase</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />Decrease</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-400 inline-block" />Total</span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Funnel Chart Renderer
 */
interface FunnelRendererProps {
  data: any[];
  stageKey: string;
  valueKey: string;
}

export function RenderFunnelChart({ data, stageKey, valueKey }: FunnelRendererProps) {
  if (!data || data.length === 0) {
    return <Card><CardContent className="pt-6"><p className="text-muted-foreground">No data to display</p></CardContent></Card>;
  }

  const parsedData = data.map((row, i) => ({
    name: row[stageKey],
    value: parseFloat(String(row[valueKey])) || 0,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const maxVal = parsedData[0]?.value || 1;
  const withConversion = parsedData.map((item, i) => ({
    ...item,
    conversionRate: Math.round((item.value / maxVal) * 100),
    stepRate: i === 0 ? 100 : parsedData[i - 1].value > 0
      ? Math.round((item.value / parsedData[i - 1].value) * 100) : 0,
  }));

  const chartConfig: ChartConfig = {
    value: { label: formatLabel(valueKey), color: CHART_COLORS[0] },
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className="h-[380px] w-full">
          <FunnelChart accessibilityLayer>
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm text-xs space-y-1">
                    <p className="font-semibold">{d.name}</p>
                    <p>Count: <span className="font-mono">{Number(d.value).toLocaleString()}</span></p>
                    <p>Overall: <span className="font-mono font-semibold">{d.conversionRate}%</span></p>
                    {d.stepRate !== d.conversionRate && (
                      <p>Step rate: <span className="font-mono">{d.stepRate}%</span></p>
                    )}
                  </div>
                );
              }}
            />
            <Funnel dataKey="value" data={withConversion} isAnimationActive>
              {withConversion.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
              <LabelList
                position="right"
                content={(props: any) => {
                  const { x, y, width, height, index } = props;
                  const entry = withConversion[Number(index)];
                  if (!entry) return null;
                  return (
                    <text
                      x={Number(x) + Number(width) + 8}
                      y={Number(y) + Number(height) / 2}
                      fill="hsl(var(--foreground))"
                      fontSize={11}
                      textAnchor="start"
                      dominantBaseline="middle"
                    >
                      <tspan fontWeight="600">{entry.name}</tspan>
                      <tspan dx={5} fill="hsl(var(--muted-foreground))">
                        {Number(entry.value).toLocaleString()} ({entry.conversionRate}%)
                      </tspan>
                    </text>
                  );
                }}
              />
            </Funnel>
          </FunnelChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/**
 * TreeMap Renderer
 */
interface TreeMapProps {
  data: any[];
  nameKey: string;
  valueKey: string;
}

export function RenderTreeMap({ data, nameKey, valueKey }: TreeMapProps) {
  if (!data || data.length === 0) {
    return <Card><CardContent className="pt-6"><p className="text-muted-foreground">No data to display</p></CardContent></Card>;
  }

  const parsedData = data.map((row, i) => ({
    name: String(row[nameKey]),
    size: parseFloat(String(row[valueKey])) || 0,
    colorIndex: i,
  }));

  const total = parsedData.reduce((sum, d) => sum + d.size, 0);

  const CustomContent = (props: any) => {
    const { x, y, width, height, name, size, colorIndex } = props;
    const fill = CHART_COLORS[colorIndex % CHART_COLORS.length];
    const pct = total > 0 ? ((size / total) * 100).toFixed(1) : '0';
    const fontSize = Math.min(13, Math.max(9, width / 10));

    if (width < 30 || height < 20) {
      return <rect x={x} y={y} width={width} height={height} fill={fill} stroke="white" strokeWidth={2} />;
    }
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={fill} stroke="white" strokeWidth={2} rx={4} />
        {width > 50 && height > 30 && (
          <text
            x={x + width / 2}
            y={y + height / 2 - (height > 50 ? 8 : 0)}
            textAnchor="middle"
            fill="white"
            fontSize={fontSize}
            fontWeight="600"
            dominantBaseline="middle"
          >
            {String(name).slice(0, Math.floor(width / (fontSize * 0.62)))}
          </text>
        )}
        {height > 50 && width > 50 && (
          <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize={fontSize - 1} dominantBaseline="middle">
            {pct}%
          </text>
        )}
      </g>
    );
  };

  const chartConfig: ChartConfig = {
    size: { label: formatLabel(valueKey), color: CHART_COLORS[0] },
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className="h-[420px] w-full">
          <Treemap data={parsedData} dataKey="size" aspectRatio={4 / 3} content={<CustomContent />}>
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                const pct = total > 0 ? ((d.size / total) * 100).toFixed(1) : '0';
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm text-xs space-y-1">
                    <p className="font-semibold">{d.name}</p>
                    <p>{formatLabel(valueKey)}: <span className="font-mono">{Number(d.size).toLocaleString()}</span></p>
                    <p>Share: <span className="font-mono">{pct}%</span></p>
                  </div>
                );
              }}
            />
          </Treemap>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Combo Chart Renderer — Bar (left axis) + Line (right axis)
 */
interface ComboProps {
  data: any[];
  categoryKey: string;
  barKey: string;
  lineKey: string;
  barLabel?: string;
  lineLabel?: string;
}

export function RenderComboChart({ data, categoryKey, barKey, lineKey, barLabel, lineLabel }: ComboProps) {
  if (!data || data.length === 0) {
    return <Card><CardContent className="pt-6"><p className="text-muted-foreground">No data to display</p></CardContent></Card>;
  }

  const pre = preprocessTimeSeries(data, categoryKey);
  const usedCategoryKey = pre.categoryKey;
  const parsedData = parseNumericColumns(pre.data, [barKey, lineKey]);

  const chartConfig: ChartConfig = {
    [barKey]: { label: barLabel || formatLabel(barKey), color: CHART_COLORS[0] },
    [lineKey]: { label: lineLabel || formatLabel(lineKey), color: CHART_COLORS[2] },
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className="h-[380px] w-full">
          <ComposedChart data={parsedData} accessibilityLayer>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey={usedCategoryKey}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(v) => String(v).slice(0, 12)}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm text-xs space-y-1">
                    <p className="font-semibold">{label}</p>
                    {payload.map((p: any, i: number) => (
                      <p key={i} style={{ color: p.color }}>
                        {p.name}: <span className="font-mono">{Number(p.value).toLocaleString()}</span>
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Legend
              content={({ payload }) => (
                <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
                  {payload?.map((p: any, i: number) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm inline-block" style={{ background: p.color }} />
                      {p.value}
                    </span>
                  ))}
                </div>
              )}
            />
            <Bar
              yAxisId="left"
              dataKey={barKey}
              name={barLabel || formatLabel(barKey)}
              fill={CHART_COLORS[0]}
              radius={[4, 4, 0, 0]}
              fillOpacity={0.85}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey={lineKey}
              name={lineLabel || formatLabel(lineKey)}
              stroke={CHART_COLORS[2]}
              strokeWidth={2.5}
              dot={{ fill: CHART_COLORS[2], strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              connectNulls
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
