import * as React from "react";
import { format, addDays, startOfDay } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingDown, TrendingUp, Minus, Info, Calendar } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { PriceInsights, FlightResult } from "../schemas";
import { formatPrice } from "../utils";

interface PriceGraphProps {
  priceInsights?: PriceInsights;
  filteredFlights: FlightResult[];
  isLoading?: boolean;
  filterRange?: { min: number; max: number };
}

type TimeInterval = "7d" | "14d" | "1m" | "2m";

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--primary))",
  },
};

// Generate price predictions based on current data with some variance
function generatePricePredictions(
  basePrice: number,
  typicalRange: [number, number],
  days: number
): { date: string; price: number; isPredicted: boolean }[] {
  const predictions: { date: string; price: number; isPredicted: boolean }[] = [];
  const today = startOfDay(new Date());

  // Use a seeded random for consistency
  let seed = basePrice;
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = 0; i <= days; i++) {
    const date = addDays(today, i);
    // Create realistic price variance - prices typically increase closer to travel date
    const weekendBoost = [0, 6].includes(date.getDay()) ? 1.08 : 1;
    const variance = (seededRandom() - 0.5) * (typicalRange[1] - typicalRange[0]) * 0.25;

    // Prices tend to increase as departure date approaches for near-term bookings
    // and decrease for very far-out bookings
    let trendFactor = 1;
    if (i < 14) {
      trendFactor = 1.15 - (i * 0.008); // higher prices for near-term
    } else if (i > 45) {
      trendFactor = 0.92 + (seededRandom() * 0.05); // lower prices for far-out
    } else {
      trendFactor = 1 + (seededRandom() * 0.06 - 0.03);
    }

    const price = Math.round(
      basePrice * trendFactor * weekendBoost + variance
    );

    predictions.push({
      date: format(date, "MMM d"),
      price: Math.max(typicalRange[0] * 0.85, Math.min(typicalRange[1] * 1.15, price)),
      isPredicted: i > 0,
    });
  }

  return predictions;
}

function getIntervalDays(interval: TimeInterval): number {
  switch (interval) {
    case "7d": return 7;
    case "14d": return 14;
    case "1m": return 30;
    case "2m": return 60;
    default: return 14;
  }
}

export function PriceGraph({
  priceInsights,
  filteredFlights,
  isLoading,
  filterRange,
}: PriceGraphProps) {
  const [timeInterval, setTimeInterval] = React.useState<TimeInterval>("14d");

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!priceInsights) {
    return null;
  }

  // Calculate current filtered stats
  const filteredPrices = filteredFlights.map((f) => f.price);
  const currentLowest = filteredPrices.length > 0 ? Math.min(...filteredPrices) : priceInsights.lowest_price;
  const currentHighest = filteredPrices.length > 0 ? Math.max(...filteredPrices) : priceInsights.typical_price_range[1];
  const currentAvg =
    filteredPrices.length > 0
      ? Math.round(filteredPrices.reduce((a, b) => a + b, 0) / filteredPrices.length)
      : Math.round((priceInsights.typical_price_range[0] + priceInsights.typical_price_range[1]) / 2);

  // Generate future price predictions
  const days = getIntervalDays(timeInterval);
  const chartData = generatePricePredictions(
    currentLowest || priceInsights.lowest_price,
    priceInsights.typical_price_range,
    days
  );

  // Calculate trend from first week to last week of predictions
  const firstWeekPrices = chartData.slice(0, 7);
  const firstWeekAvg = firstWeekPrices.reduce((a, b) => a + b.price, 0) / firstWeekPrices.length;
  const lastWeekStart = Math.max(0, chartData.length - 7);
  const lastWeekPrices = chartData.slice(lastWeekStart);
  const lastWeekAvg = lastWeekPrices.reduce((a, b) => a + b.price, 0) / lastWeekPrices.length;
  const trendPercent = firstWeekAvg > 0 ? ((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100 : 0;

  const TrendIcon =
    trendPercent > 2 ? TrendingUp : trendPercent < -2 ? TrendingDown : Minus;
  const trendColor =
    trendPercent > 2
      ? "text-red-500"
      : trendPercent < -2
        ? "text-green-500"
        : "text-muted-foreground";

  // Price level badge
  const priceLevelConfig = {
    low: { label: "Low prices", variant: "secondary" as const, color: "text-green-600" },
    typical: { label: "Typical prices", variant: "outline" as const, color: "text-muted-foreground" },
    high: { label: "High prices", variant: "destructive" as const, color: "text-red-600" },
  };
  const priceLevel = priceLevelConfig[priceInsights.price_level];

  // Get interval label for trend text
  const intervalLabels: Record<TimeInterval, string> = {
    "7d": "week",
    "14d": "2 weeks",
    "1m": "month",
    "2m": "2 months",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold">Price Forecast</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={priceLevel.variant}>{priceLevel.label}</Badge>
            <Select value={timeInterval} onValueChange={(v) => setTimeInterval(v as TimeInterval)}>
              <SelectTrigger className="w-[110px] h-8">
                <Calendar className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="14d">14 days</SelectItem>
                <SelectItem value="1m">1 month</SelectItem>
                <SelectItem value="2m">2 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Lowest</p>
            <p className="text-lg font-bold text-green-600">
              {formatPrice(currentLowest)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Average</p>
            <p className="text-lg font-bold">
              {formatPrice(currentAvg)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Highest</p>
            <p className="text-lg font-bold text-muted-foreground">
              {formatPrice(currentHighest)}
            </p>
          </div>
        </div>

        {/* Trend indicator */}
        <div className="flex items-center gap-2 text-sm">
          <TrendIcon className={`h-4 w-4 ${trendColor}`} />
          <span className={trendColor}>
            {Math.abs(trendPercent).toFixed(1)}%{" "}
            {trendPercent > 2 ? "expected increase" : trendPercent < -2 ? "expected decrease" : "stable"}{" "}
            over next {intervalLabels[timeInterval]}
          </span>
        </div>

        {/* Chart */}
        <ChartContainer config={chartConfig} className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
                domain={["dataMin - 500", "dataMax + 500"]}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, _name, item) => {
                      const isPredicted = item.payload?.isPredicted;
                      return [
                        `${formatPrice(value as number)}${isPredicted ? " (forecast)" : " (today)"}`,
                        "Price"
                      ];
                    }}
                  />
                }
              />
              {/* Typical price range area */}
              <ReferenceArea
                y1={priceInsights.typical_price_range[0]}
                y2={priceInsights.typical_price_range[1]}
                fill="hsl(var(--muted))"
                fillOpacity={0.3}
              />
              {/* Current filter range if applied */}
              {filterRange && (
                <ReferenceArea
                  y1={filterRange.min}
                  y2={filterRange.max}
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                  stroke="hsl(var(--primary))"
                  strokeDasharray="3 3"
                />
              )}
              {/* Current lowest price line */}
              <ReferenceLine
                y={currentLowest}
                stroke="hsl(var(--chart-2))"
                strokeDasharray="5 5"
              // label={{
              //   // value: `Lowest: ${formatPrice(currentLowest)}`,
              //   position: "insideTopRight",
              //   fontSize: 10,
              //   fill: "hsl(var(--chart-2))",
              // }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-muted" />
            <span>Typical range</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-[2px] bg-primary" />
            <span>Price forecast</span>
          </div>
          <div className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            <span>Based on typical patterns</span>
          </div>
        </div>

        {/* Filter info */}
        {filterRange && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            <Info className="h-3 w-3" />
            <span>
              Showing flights between {formatPrice(filterRange.min)} -{" "}
              {formatPrice(filterRange.max)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
