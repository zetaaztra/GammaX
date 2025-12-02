import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpCircle } from "lucide-react";
import { DataQualityBadge } from "../DataQualityBadge";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { DataQuality, OrderbookLevel } from "@shared/schema";
import { cn } from "@/lib/utils";
import { getOrderbookInsight } from "@/lib/chartInsights";

interface OrderbookDepthProps {
  title: string;
  data: OrderbookLevel[];
  midPrice?: number;
  quality?: DataQuality;
  isLoading?: boolean;
  onHelpClick?: () => void;
  onClick?: () => void;
  testId?: string;
}

export function OrderbookDepth({
  title,
  data,
  midPrice,
  quality = "GOOD",
  isLoading = false,
  onHelpClick,
  onClick,
  testId,
}: OrderbookDepthProps) {
  if (isLoading) {
    return (
      <Card className="hover-elevate cursor-pointer min-h-[240px]">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-16" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  const sortedData = [...data].sort((a, b) => a.price - b.price);

  let cumulativeBid = 0;
  let cumulativeAsk = 0;

  const chartData = sortedData.map((level) => {
    cumulativeBid += level.bidQty;
    cumulativeAsk += level.askQty;
    return {
      ...level,
      cumulativeBid,
      cumulativeAsk,
    };
  });

  return (
    <Card
      className={cn(
        "hover-elevate cursor-pointer transition-colors min-h-[240px] flex flex-col",
        onClick && "active-elevate-2"
      )}
      onClick={onClick}
      data-testid={testId}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <DataQualityBadge quality={quality} />
          {onHelpClick && (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onHelpClick();
              }}
              aria-label={`Help for ${title}`}
            >
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="bidDepth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.5} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="askDepth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--danger))" stopOpacity={0.5} />
                <stop offset="95%" stopColor="hsl(var(--danger))" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="price"
              type="number"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => v.toFixed(0)}
              stroke="hsl(var(--muted-foreground))"
              domain={["auto", "auto"]}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [
                value.toLocaleString(),
                name.includes("Bid") ? "Bid Depth" : "Ask Depth",
              ]}
              labelFormatter={(label) => `Price: ${Number(label).toFixed(2)}`}
            />
            <Area
              type="stepAfter"
              dataKey="cumulativeBid"
              stroke="hsl(var(--success))"
              fill="url(#bidDepth)"
              name="Cumulative Bid"
            />
            <Area
              type="stepAfter"
              dataKey="cumulativeAsk"
              stroke="hsl(var(--danger))"
              fill="url(#askDepth)"
              name="Cumulative Ask"
            />
            {midPrice && (
              <ReferenceLine
                x={midPrice}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                strokeDasharray="3 3"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-success/50" />
            <span className="text-muted-foreground">Bids</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-danger/50" />
            <span className="text-muted-foreground">Asks</span>
          </div>
        </div>
      </CardContent>
      <div className="px-3 sm:px-4 pb-2 sm:pb-3 border-t mt-auto">
        <p className="text-xs text-muted-foreground">
          {getOrderbookInsight(data)}
        </p>
      </div>
    </Card>
  );
}
