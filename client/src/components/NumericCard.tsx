import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { DataQualityBadge } from "./DataQualityBadge";
import type { DataQuality } from "@shared/schema";
import { cn } from "@/lib/utils";

interface NumericCardProps {
  title: string;
  value: number | string;
  change?: number;
  changePercent?: number;
  suffix?: string;
  prefix?: string;
  quality?: DataQuality;
  isLoading?: boolean;
  onHelpClick?: () => void;
  onClick?: () => void;
  testId?: string;
  insight?: string;
}

export function NumericCard({
  title,
  value,
  change,
  changePercent,
  suffix = "",
  prefix = "",
  quality = "GOOD",
  isLoading = false,
  onHelpClick,
  onClick,
  testId,
  insight,
}: NumericCardProps) {
  const isPositive = change !== undefined ? change > 0 : false;
  const isNegative = change !== undefined ? change < 0 : false;
  const isNeutral = change === 0 || change === undefined;

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  const formatValue = (val: number | string) => {
    if (typeof val === "string") return val;
    if (Math.abs(val) >= 1000000) return `${(val / 1000000).toFixed(2)}M`;
    if (Math.abs(val) >= 1000) return `${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  if (isLoading) {
    return (
      <Card className="hover-elevate cursor-pointer transition-colors min-h-[140px] sm:min-h-[160px]">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 px-3 sm:px-4 py-2 sm:py-3">
          <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
          <Skeleton className="h-5 sm:h-6 w-14 sm:w-16" />
        </CardHeader>
        <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
          <Skeleton className="h-8 sm:h-10 w-28 sm:w-32 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "hover-elevate cursor-pointer transition-colors min-h-[140px] sm:min-h-[160px] flex flex-col",
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
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onHelpClick();
              }}
              aria-label={`Help for ${title}`}
              data-testid={`button-help-${testId}`}
            >
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4 flex-1">
        <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight">
          {prefix}
          {formatValue(value)}
          {suffix && <span className="text-sm sm:text-lg text-muted-foreground ml-1">{suffix}</span>}
        </div>
        {(change !== undefined || changePercent !== undefined) && (
          <div
            className={cn(
              "flex items-center gap-1 mt-2 text-sm font-medium",
              isPositive && "text-success",
              isNegative && "text-danger",
              isNeutral && "text-muted-foreground"
            )}
          >
            <TrendIcon className="h-4 w-4" />
            <span>
              {change !== undefined && (
                <>
                  {isPositive ? "+" : ""}
                  {formatValue(change)}
                </>
              )}
              {changePercent !== undefined && (
                <span className="ml-1">
                  ({isPositive ? "+" : ""}
                  {changePercent.toFixed(2)}%)
                </span>
              )}
            </span>
          </div>
        )}
      </CardContent>
      {insight && (
        <div className="px-3 sm:px-4 pb-2 sm:pb-3 border-t mt-auto">
          <p className="text-xs text-muted-foreground">{insight}</p>
        </div>
      )}
    </Card>
  );
}
