import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpCircle } from "lucide-react";
import { DataQualityBadge } from "../DataQualityBadge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import type { DataQuality, VolumeBucket } from "@shared/schema";
import { cn } from "@/lib/utils";
import { getVolumeProfileInsight } from "@/lib/chartInsights";

interface VolumeProfileProps {
  title: string;
  data: VolumeBucket[];
  currentPrice?: number;
  quality?: DataQuality;
  isLoading?: boolean;
  onHelpClick?: () => void;
  onClick?: () => void;
  testId?: string;
}

export function VolumeProfile({
  title,
  data,
  currentPrice,
  quality = "GOOD",
  isLoading = false,
  onHelpClick,
  onClick,
  testId,
}: VolumeProfileProps) {
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

  const maxVolume = Math.max(...data.map((d) => d.volume));

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
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 5, left: 30, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="price"
              type="number"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => v.toFixed(0)}
              stroke="hsl(var(--muted-foreground))"
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
                value.toLocaleString(),
                name === "buyVolume" ? "Buy Vol" : name === "sellVolume" ? "Sell Vol" : "Total",
              ]}
              labelFormatter={(label) => `Price: ${label}`}
            />
            <Bar dataKey="buyVolume" stackId="a" fill="hsl(var(--success))" fillOpacity={0.7} />
            <Bar dataKey="sellVolume" stackId="a" fill="hsl(var(--danger))" fillOpacity={0.7} />
            {currentPrice && (
              <ReferenceLine
                y={currentPrice}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                strokeDasharray="3 3"
              />
            )}
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-success/70" />
            <span className="text-muted-foreground">Buy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-danger/70" />
            <span className="text-muted-foreground">Sell</span>
          </div>
          {currentPrice && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-primary" />
              <span className="text-muted-foreground">Current</span>
            </div>
          )}
        </div>
      </CardContent>
      <div className="px-3 sm:px-4 pb-2 sm:pb-3 border-t mt-auto">
        <p className="text-xs text-muted-foreground">
          {getVolumeProfileInsight(data)}
        </p>
      </div>
    </Card>
  );
}
