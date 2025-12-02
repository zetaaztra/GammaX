import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, FileText, HelpCircle, Copy, Check } from "lucide-react";
import { useState } from "react";
import { TILE_EXPLAINS } from "./ExplainModal";
import type { TileExplain } from "@shared/schema";

interface InspectorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  tileId: string | null;
  data: unknown;
  ticker: string;
}

export function InspectorPanel({ isOpen, onClose, tileId, data, ticker }: InspectorPanelProps) {
  const [copied, setCopied] = useState(false);
  const explain = tileId ? TILE_EXPLAINS[tileId] : null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg flex flex-col h-full">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            {explain?.title || "Inspector"}
            {tileId && (
              <Badge variant="outline" className="font-mono text-xs">
                {tileId}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="explain" className="mt-4 flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="explain" className="gap-1.5">
              <HelpCircle className="h-4 w-4" />
              Explain
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-1.5">
              <FileText className="h-4 w-4" />
              Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="actions" className="mt-4 flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              {explain ? (
                <div className="space-y-4 pr-4">
                  <h4 className="font-semibold">Example Actions</h4>
                  <ul className="space-y-3">
                    {explain.actions.map((action, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <Badge variant="outline" className="shrink-0">
                          {idx + 1}
                        </Badge>
                        <span className="text-sm">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No actions available for this tile.
                </p>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="explain" className="mt-4 flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              {explain ? (
                <div className="space-y-6 pr-4">
                  <section>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {explain.description}
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold mb-3">Thresholds</h4>
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                        <Badge className="bg-success/20 text-success border-success/30 mb-1">
                          Green
                        </Badge>
                        <p className="text-sm text-muted-foreground">{explain.thresholds.green}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                        <Badge className="bg-warning/20 text-warning border-warning/30 mb-1">
                          Yellow
                        </Badge>
                        <p className="text-sm text-muted-foreground">{explain.thresholds.amber}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
                        <Badge className="bg-danger/20 text-danger border-danger/30 mb-1">
                          Red
                        </Badge>
                        <p className="text-sm text-muted-foreground">{explain.thresholds.red}</p>
                      </div>
                    </div>
                  </section>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No explanation available for this tile.
                </p>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="pt-4 border-t mt-auto">
          <a
            href={`/api/ticker/${ticker}/full`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Code className="h-3 w-3" />
            View Raw Data (JSON)
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
