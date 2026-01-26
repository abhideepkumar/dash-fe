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
  return str
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

interface ChartProps {
  data: any[];
  categoryKey: string;
  dataKey: string | string[];
  nameKey?: string;
  maxValue?: number;
}

/**
 * Bar Chart Renderer
 */
export function RenderBarChart({ data, categoryKey, dataKey }: ChartProps) {
  const keys = Array.isArray(dataKey) ? dataKey : [dataKey];
  const chartConfig = buildChartConfig(keys);

  return (
    <Card>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart data={data} accessibilityLayer>
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
 */
export function RenderLineChart({ data, categoryKey, dataKey }: ChartProps) {
  const keys = Array.isArray(dataKey) ? dataKey : [dataKey];
  const chartConfig = buildChartConfig(keys);

  return (
    <Card>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <LineChart data={data} accessibilityLayer>
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
  const keys = Array.isArray(dataKey) ? dataKey : [dataKey];
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

  return (
    <Card>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <PieChart accessibilityLayer>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
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
              {data.map((_, index) => (
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
  
  // Prepare data with fill colors
  const chartData = data.map((item, i) => ({
    ...item,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // Build config
  const chartConfig: ChartConfig = {};
  data.forEach((item, i) => {
    const label = item[labelKey];
    chartConfig[label] = {
      label: label,
      color: CHART_COLORS[i % CHART_COLORS.length],
    };
  });

  // For single value, show as gauge
  if (data.length === 1) {
    const value = data[0][key];
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
                            {value.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="fill-muted-foreground text-sm"
                          >
                            {data[0][labelKey] || 'Value'}
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
