import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpCircle } from "lucide-react";
import { DataQualityBadge } from "../DataQualityBadge";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ZAxis } from "recharts";
import type { DataQuality, SlippageSample } from "@shared/schema";
import { cn } from "@/lib/utils";
import { getScatterInsight } from "@/lib/chartInsights";

interface ScatterSlippageProps {
  title: string;
  data: SlippageSample[];
  quality?: DataQuality;
  isLoading?: boolean;
  onHelpClick?: () => void;
  onClick?: () => void;
  onRunSimulation?: () => void;
  testId?: string;
}

export function ScatterSlippage({
  title,
  data,
  quality = "GOOD",
  isLoading = false,
  onHelpClick,
  onClick,
  onRunSimulation,
  testId,
}: ScatterSlippageProps) {
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

  const chartData = data.map((d) => ({
    volume: d.volume,
    slippage: Math.abs(d.slippage),
    isPositive: d.slippage >= 0,
  }));

  const hasData = data.length > 0;

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
        {hasData ? (
          <ResponsiveContainer width="100%" height={160}>
            <ScatterChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis
                dataKey="volume"
                type="number"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                stroke="hsl(var(--muted-foreground))"
                name="Volume"
              />
              <YAxis
                dataKey="slippage"
                type="number"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `${v.toFixed(2)}%`}
                stroke="hsl(var(--muted-foreground))"
                name="Slippage"
              />
              <ZAxis range={[20, 200]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => [
                  name === "slippage" ? `${value.toFixed(3)}%` : value.toLocaleString(),
                  name === "slippage" ? "Slippage" : "Volume",
                ]}
              />
              <Scatter
                data={chartData.filter((d) => d.isPositive)}
                fill="hsl(var(--success))"
                fillOpacity={0.6}
              />
              <Scatter
                data={chartData.filter((d) => !d.isPositive)}
                fill="hsl(var(--danger))"
                fillOpacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-muted-foreground text-sm mb-3">
              Insufficient slippage data available
            </p>
            {onRunSimulation && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onRunSimulation();
                }}
                data-testid="button-run-simulation"
              >
                Run Simulation
              </Button>
            )}
          </div>
        )}
      </CardContent>
      <div className="px-3 sm:px-4 pb-2 sm:pb-3 border-t mt-auto">
        <p className="text-xs text-muted-foreground">
          {getScatterInsight(data)}
        </p>
      </div>
    </Card>
  );
}
