import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle, Calendar, TrendingUp, TrendingDown, Minus, DollarSign, Newspaper, BarChart3 } from "lucide-react";
import { DataQualityBadge } from "../DataQualityBadge";
import type { DataQuality, TimelineEvent } from "@shared/schema";
import { cn } from "@/lib/utils";

interface TimelineEventsProps {
  title: string;
  data: TimelineEvent[];
  quality?: DataQuality;
  isLoading?: boolean;
  onHelpClick?: () => void;
  onClick?: () => void;
  testId?: string;
}

const EVENT_ICONS: Record<TimelineEvent["type"], typeof Calendar> = {
  earnings: BarChart3,
  dividend: DollarSign,
  split: TrendingUp,
  news: Newspaper,
  economic: Calendar,
};

export function TimelineEvents({
  title,
  data,
  quality = "GOOD",
  isLoading = false,
  onHelpClick,
  onClick,
  testId,
}: TimelineEventsProps) {
  if (isLoading) {
    return (
      <Card className="hover-elevate cursor-pointer min-h-[240px]">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-16" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "hover-elevate cursor-pointer transition-colors min-h-[240px]",
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
        <ScrollArea className="h-40">
          {data.length > 0 ? (
            <div className="space-y-2">
              {data.map((event, idx) => {
                const Icon = EVENT_ICONS[event.type] || Calendar;
                const ImpactIcon = event.impact === "positive" 
                  ? TrendingUp 
                  : event.impact === "negative" 
                    ? TrendingDown 
                    : Minus;

                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-2 rounded-lg bg-muted/30"
                  >
                    <div className={cn(
                      "p-1.5 rounded-md",
                      event.impact === "positive" && "bg-success/20 text-success",
                      event.impact === "negative" && "bg-danger/20 text-danger",
                      event.impact === "neutral" && "bg-muted text-muted-foreground",
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium truncate">
                          {event.title}
                        </span>
                        <ImpactIcon className={cn(
                          "h-3 w-3 shrink-0",
                          event.impact === "positive" && "text-success",
                          event.impact === "negative" && "text-danger",
                          event.impact === "neutral" && "text-muted-foreground",
                        )} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          {event.type}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(event.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              No upcoming events
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
