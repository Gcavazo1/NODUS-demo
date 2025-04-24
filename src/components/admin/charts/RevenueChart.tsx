'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { useTheme } from 'next-themes';
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { AlertCircle, DollarSign, Loader2 } from 'lucide-react';

interface ChartData {
  date: string;
  revenue: number;
  formattedRevenue: string;
}

interface RevenueChartProps {
  demoMode?: boolean;
}

// --- DEMO MODE: Default Theme Colors (Fallback) ---
const defaultDemoColors = {
  light: {
    primary: '#3b82f6', // blue-500
    background: '#ffffff',
    mutedForeground: '#6b7280' // gray-500
  },
  dark: {
    primary: '#60a5fa', // blue-400
    background: '#1f2937', // gray-800
    mutedForeground: '#9ca3af' // gray-400
  }
};

// --- DEMO MODE: Fake Data Generation ---
const generateFakeRevenueData = (startDate: Date, endDate: Date): { chartData: ChartData[], totalRevenue: number } => {
  const data: ChartData[] = [];
  let total = 0;
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  days.forEach(day => {
    // Simulate some weekday/weekend variation and randomness
    const dayOfWeek = day.getDay(); // 0=Sun, 6=Sat
    const baseRevenue = Math.random() * 30000 + 10000; // 100 - 400 USD base
    let multiplier = 1;
    if (dayOfWeek === 0 || dayOfWeek === 6) multiplier = 0.7; // Lower on weekends
    if (Math.random() < 0.1) multiplier *= 1.5; // Random spike

    const revenue = Math.max(0, Math.floor(baseRevenue * multiplier));
    total += revenue;
    data.push({
      date: format(day, 'yyyy-MM-dd'),
      revenue,
      formattedRevenue: formatCurrencyStatic(revenue) // Use static formatter here
    });
  });

  console.log(`[Demo] Generated fake revenue: ${data.length} days, total ${formatCurrencyStatic(total)}`);
  return { chartData: data, totalRevenue: total };
};

// Static formatter function (not relying on class instance)
const formatCurrencyStatic = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount / 100);
};
// --- End DEMO MODE ---

export default function RevenueChart({ demoMode = false }: RevenueChartProps) {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const { siteSettings, isLoading: isSettingsLoading } = useSiteSettings();
  const { resolvedTheme } = useTheme();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const end = new Date();
    const start = subDays(end, 29);
    return { from: start, to: end };
  });

  // Get theme colors, using robust fallback for demo
  const themeMode = resolvedTheme === 'dark' ? 'dark' : 'light';
  const colors = useMemo(() => {
      const themeColors = siteSettings?.theme?.colors?.[themeMode];
      return {
          primary: themeColors?.primary || defaultDemoColors[themeMode].primary,
          background: themeColors?.background || defaultDemoColors[themeMode].background,
          mutedForeground: themeColors?.mutedForeground || defaultDemoColors[themeMode].mutedForeground,
      };
  }, [siteSettings?.theme?.colors, themeMode]);

  // --- DEMO MODE: Generate data based on date range --- 
  useEffect(() => {
    if (demoMode && dateRange?.from && dateRange?.to) {
      setIsLoading(true);
      // Simulate async loading slightly
      setTimeout(() => {
        const { chartData, totalRevenue: calculatedTotal } = generateFakeRevenueData(dateRange.from!, dateRange.to!);
        setData(chartData);
        setTotalRevenue(calculatedTotal);
        setIsLoading(false);
      }, 300); // Short delay
    }
  }, [demoMode, dateRange]);

  // Format currency (Instance method - used less now)
  const formatCurrency = (amount: number) => {
      return formatCurrencyStatic(amount);
  };
  
  // Custom tooltip component
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        date: string;
        revenue: number;
        formattedRevenue: string;
      };
    }>;
    label?: string;
  }
  
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length && label) {
      return (
        <div className="bg-background border rounded p-2 shadow-sm">
          <p className="font-medium">{format(new Date(label), 'MMM d, yyyy')}</p>
          <p className="text-primary">{`Revenue: ${payload[0].payload.formattedRevenue}`}</p>
        </div>
      );
    }
    return null;
  };

  // Date Range Picker Button
  const DatePickerWithRange = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
    const handleDateSelect = (selectedRange: DateRange | undefined) => {
      setDateRange(selectedRange);
      // Close the popover only if both dates are selected
      if (selectedRange?.from && selectedRange?.to) {
        setIsDatePickerOpen(false);
      }
    };
  
    return (
      <div className={cn("grid gap-2", className)}>
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[260px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")}
                    {" - "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateSelect} // Use the custom handler
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  // Format date range for display
  const formattedDateRange = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return "Selected Period";
    if (format(dateRange.from, 'yyyy-MM-dd') === format(dateRange.to, 'yyyy-MM-dd')) {
      return format(dateRange.from, "MMM d, yyyy");
    }
    return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`;
  }, [dateRange]);
  
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-4">
        <div>
          <CardTitle className="text-xl font-semibold">Revenue Trend (Demo)</CardTitle>
          <CardDescription>Simulated revenue for {formattedDateRange}</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
           <DatePickerWithRange />
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Generating demo revenue data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px]">
            <DollarSign className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No revenue data generated for the selected period.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground">Total simulated revenue for {formattedDateRange}</p>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.mutedForeground + '40'} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                    stroke={colors.mutedForeground}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={(value) => `$${Math.round(value / 100)}`}
                    stroke={colors.mutedForeground}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={colors.primary}
                    strokeWidth={2}
                    dot={{ r: 3, fill: colors.primary }}
                    activeDot={{ r: 5, fill: colors.primary }}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 