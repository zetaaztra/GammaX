import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpCircle } from "lucide-react";
import { DataQualityBadge } from "../DataQualityBadge";
import type { DataQuality } from "@shared/schema";
import { cn } from "@/lib/utils";

interface GaugeTileProps {
  title: string;
  value: number;
  min?: number;
  max?: number;
  thresholds?: { low: number; high: number };
  suffix?: string;
  quality?: DataQuality;
  isLoading?: boolean;
  onHelpClick?: () => void;
  onClick?: () => void;
  testId?: string;
}

export function GaugeTile({
  title,
  value,
  min = 0,
  max = 100,
  thresholds = { low: 33, high: 66 },
  suffix = "",
  quality = "GOOD",
  isLoading = false,
  onHelpClick,
  onClick,
  testId,
}: GaugeTileProps) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const rotation = (percentage / 100) * 180 - 90;

  const getColor = () => {
    const normalizedValue = (value - min) / (max - min) * 100;
    if (normalizedValue < thresholds.low) return "text-success";
    if (normalizedValue > thresholds.high) return "text-danger";
    return "text-warning";
  };

  if (isLoading) {
    return (
      <Card className="hover-elevate cursor-pointer min-h-[180px] sm:min-h-[200px]">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 px-3 sm:px-4 py-2 sm:py-3">
          <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
          <Skeleton className="h-5 sm:h-6 w-14 sm:w-16" />
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-3 sm:py-4 px-3 sm:px-4">
          <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-full" />
          <Skeleton className="h-5 sm:h-6 w-14 sm:w-16 mt-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "hover-elevate cursor-pointer transition-colors min-h-[180px] sm:min-h-[200px]",
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
      <CardContent className="flex flex-col items-center justify-center py-4">
        <div className="relative w-32 h-16 overflow-hidden">
          <svg viewBox="0 0 100 50" className="w-full h-full">
            <path
              d="M 5 50 A 45 45 0 0 1 95 50"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/30"
            />
            <path
              d="M 5 50 A 45 45 0 0 1 95 50"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${percentage * 1.41} 141.4`}
              className={getColor()}
            />
            <g transform={`rotate(${rotation}, 50, 50)`}>
              <line
                x1="50"
                y1="50"
                x2="50"
                y2="15"
                stroke="currentColor"
                strokeWidth="2"
                className="text-foreground"
              />
              <circle cx="50" cy="50" r="4" fill="currentColor" className="text-foreground" />
            </g>
          </svg>
        </div>
        <div className={cn("text-2xl font-bold font-mono mt-2", getColor())}>
          {value.toFixed(1)}{suffix}
        </div>
        <div className="flex justify-between w-full text-xs text-muted-foreground mt-1 px-4">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </CardContent>
    </Card>
  );
}
