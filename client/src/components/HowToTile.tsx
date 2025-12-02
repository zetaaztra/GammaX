import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, BookOpen, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  description: string;
  learnMoreKey?: string;
}

const STEPS: Step[] = [
  {
    title: "Select Ticker",
    description: "Choose a stock or index (NIFTY/BANKNIFTY) from the left sidebar.",
    learnMoreKey: "spotPrice",
  },
  {
    title: "Check Verdict",
    description: "Look at the main Verdict tile for a clear BUY/SELL/WAIT signal.",
    learnMoreKey: "verdict",
  },
  {
    title: "View Details",
    description: "Review the 12 tiles for specific metrics like volume, slippage, and volatility.",
    learnMoreKey: "indiaVix",
  },
  {
    title: "Inspect Data",
    description: "Click any tile to see detailed explanations and raw data.",
  },
  {
    title: "Refresh",
    description: "Use the refresh button to get the latest market data.",
  },
];

interface HowToTileProps {
  onLearnMore?: (tileKey: string) => void;
}

export function HowToTile({ onLearnMore }: HowToTileProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-dashed">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover-elevate py-2 sm:py-3 px-3 sm:px-4">
            <CardTitle className="flex items-center justify-between gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <BookOpen className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">How to Use This Dashboard</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <Badge variant="outline" className="text-xs hidden sm:inline">
                  {STEPS.length} steps
                </Badge>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-3 sm:pb-4 px-3 sm:px-4">
            <ul className="space-y-2 sm:space-y-3">
              {STEPS.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/30"
                >
                  <Badge
                    variant="outline"
                    className="shrink-0 bg-primary/10 text-primary border-primary/30 h-5 w-5 sm:h-6 sm:w-6 p-0 flex items-center justify-center text-xs"
                  >
                    {idx + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-xs sm:text-sm mb-0.5">{step.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                    {step.learnMoreKey && onLearnMore && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 mt-1 text-xs"
                        onClick={() => onLearnMore(step.learnMoreKey!)}
                        data-testid={`link-learn-more-${step.learnMoreKey}`}
                      >
                        Learn More
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
