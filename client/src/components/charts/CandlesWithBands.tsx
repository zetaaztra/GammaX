import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpCircle } from "lucide-react";
import { DataQualityBadge } from "../DataQualityBadge";
import { ComposedChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { DataQuality, BollingerData } from "@shared/schema";
import { cn } from "@/lib/utils";
import { getBollingerInsight } from "@/lib/chartInsights";

interface CandlesWithBandsProps {
  title: string;
  data: BollingerData[];
  quality?: DataQuality;
  isLoading?: boolean;
  onHelpClick?: () => void;
  onClick?: () => void;
  testId?: string;
}

export function CandlesWithBands({
  title,
  data,
  quality = "GOOD",
  isLoading = false,
  onHelpClick,
  onClick,
  testId,
}: CandlesWithBandsProps) {
  if (isLoading) {
    return (
      <Card className="hover-elevate cursor-pointer min-h-[240px]">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 px-3 sm:px-4 py-2 sm:py-3">
          <Skeleton className="h-4 sm:h-5 w-28 sm:w-32" />
          <Skeleton className="h-5 sm:h-6 w-14 sm:w-16" />
        </CardHeader>
        <CardContent className="px-2 sm:px-4 pb-3 sm:pb-4">
          <Skeleton className="h-32 sm:h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    band: [d.lower, d.upper],
  }));

  return (
    <Card
      className={cn(
        "hover-elevate cursor-pointer transition-colors min-h-[240px] flex flex-col",
        onClick && "active-elevate-2"
      )}
      onClick={onClick}
      data-testid={testId}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 px-3 sm:px-4 py-2 sm:py-3">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-1 sm:gap-2">
          <DataQualityBadge quality={quality} />
          {onHelpClick && (
            <Button
              size="icon"
              variant="ghost"
              className="h-5 w-5 sm:h-6 sm:w-6"
              onClick={(e) => {
                e.stopPropagation();
                onHelpClick();
              }}
              aria-label={`Help for ${title}`}
            >
              <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-4 pb-3 sm:pb-4">
        <ResponsiveContainer width="100%" height={160}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              hide
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [
                value.toFixed(2),
                name === "close" ? "Price" : name,
              ]}
            />
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="url(#bandGradient)"
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="hsl(var(--background))"
            />
            <Line
              type="monotone"
              dataKey="upper"
              stroke="hsl(var(--primary))"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="middle"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="lower"
              stroke="hsl(var(--primary))"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="close"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
      <div className="px-3 sm:px-4 pb-2 sm:pb-3 border-t mt-auto">
        <p className="text-xs text-muted-foreground">
          {getBollingerInsight(data)}
        </p>
      </div>
    </Card>
  );
}
