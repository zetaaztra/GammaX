import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpCircle } from "lucide-react";
import { DataQualityBadge } from "../DataQualityBadge";
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { DataQuality, RollingData } from "@shared/schema";
import { cn } from "@/lib/utils";
import { getRollingAverageInsight } from "@/lib/chartInsights";

interface BarWithRollingProps {
  title: string;
  data: RollingData[];
  quality?: DataQuality;
  isLoading?: boolean;
  onHelpClick?: () => void;
  onClick?: () => void;
  testId?: string;
}

export function BarWithRolling({
  title,
  data,
  quality = "GOOD",
  isLoading = false,
  onHelpClick,
  onClick,
  testId,
}: BarWithRollingProps) {
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
          <ComposedChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
              formatter={(value: number) => value.toFixed(2)}
            />
            <Bar
              dataKey="value"
              fill="hsl(var(--muted))"
              opacity={0.5}
              radius={[2, 2, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="ma5"
              stroke="hsl(var(--chart-1))"
              strokeWidth={1.5}
              dot={false}
              name="MA5"
            />
            <Line
              type="monotone"
              dataKey="ma20"
              stroke="hsl(var(--chart-2))"
              strokeWidth={1.5}
              dot={false}
              name="MA20"
            />
            <Line
              type="monotone"
              dataKey="ma50"
              stroke="hsl(var(--chart-3))"
              strokeWidth={1.5}
              dot={false}
              name="MA50"
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-chart-1" />
            <span className="text-muted-foreground">MA5</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-chart-2" />
            <span className="text-muted-foreground">MA20</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-chart-3" />
            <span className="text-muted-foreground">MA50</span>
          </div>
        </div>
      </CardContent>
      <div className="px-3 sm:px-4 pb-2 sm:pb-3 border-t mt-auto">
        <p className="text-xs text-muted-foreground">
          {getRollingAverageInsight(data)}
        </p>
      </div>
    </Card>
  );
}
