import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpCircle } from "lucide-react";
import { DataQualityBadge } from "../DataQualityBadge";
import type { DataQuality, HeatmapCell } from "@shared/schema";
import { cn } from "@/lib/utils";
import { getHeatmapInsight } from "@/lib/chartInsights";

interface HeatmapTileProps {
  title: string;
  data: HeatmapCell[];
  quality?: DataQuality;
  isLoading?: boolean;
  onHelpClick?: () => void;
  onClick?: () => void;
  testId?: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const HOURS = Array.from({ length: 9 }, (_, i) => i + 9);

export function HeatmapTile({
  title,
  data,
  quality = "GOOD",
  isLoading = false,
  onHelpClick,
  onClick,
  testId,
}: HeatmapTileProps) {
  if (isLoading) {
    return (
      <Card className="hover-elevate cursor-pointer min-h-[240px]">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-6 w-16" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = Math.min(...data.map((d) => d.value), 0);

  const getCell = (day: number, hour: number) => {
    return data.find((d) => d.dayOfWeek === day && d.hour === hour);
  };

  const getColor = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue);
    if (normalized < 0.2) return "bg-primary/10";
    if (normalized < 0.4) return "bg-primary/30";
    if (normalized < 0.6) return "bg-primary/50";
    if (normalized < 0.8) return "bg-primary/70";
    return "bg-primary";
  };

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
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="p-1 text-left text-muted-foreground"></th>
                {HOURS.map((hour) => (
                  <th key={hour} className="p-1 text-center text-muted-foreground font-normal">
                    {hour}:00
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, dayIdx) => (
                <tr key={day}>
                  <td className="p-1 text-muted-foreground font-medium">{day}</td>
                  {HOURS.map((hour) => {
                    const cell = getCell(dayIdx, hour);
                    return (
                      <td key={hour} className="p-0.5">
                        <div
                          className={cn(
                            "w-full h-6 rounded-sm transition-colors",
                            cell ? getColor(cell.value) : "bg-muted/30"
                          )}
                          title={cell ? `Value: ${cell.value.toFixed(2)}` : "No data"}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end gap-2 mt-2 text-xs text-muted-foreground">
          <span>Low</span>
          <div className="flex gap-0.5">
            {[10, 30, 50, 70, 100].map((opacity) => (
              <div
                key={opacity}
                className={`w-4 h-3 rounded-sm bg-primary/${opacity}`}
              />
            ))}
          </div>
          <span>High</span>
        </div>
      </CardContent>
      <div className="px-3 sm:px-4 pb-2 sm:pb-3 border-t mt-auto">
        <p className="text-xs text-muted-foreground">
          {getHeatmapInsight(data)}
        </p>
      </div>
    </Card>
  );
}
