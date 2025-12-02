import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getSlippageInsight } from "@/lib/chartInsights";
import { LeftRail } from "@/components/LeftRail";
import { RefreshButton } from "@/components/RefreshButton";
import { VerdictTile } from "@/components/VerdictTile";
import { NumericCard } from "@/components/NumericCard";
import { HowToTile } from "@/components/HowToTile";
import { Footer } from "@/components/Footer";
import { InspectorPanel } from "@/components/InspectorPanel";
import { DisclaimerModal, shouldShowDisclaimer } from "@/components/DisclaimerModal";
import { CookieConsentModal, shouldShowCookieConsent } from "@/components/CookieConsentModal";
import { ExplainModal, TILE_EXPLAINS } from "@/components/ExplainModal";
import {
  GaugeTile,
  HistogramTile,
  HeatmapTile,
  CandlesWithBands,
  BarWithRolling,
  ScatterSlippage,
  TimelineEvents,
  StackedAreaAbsorption,
  VolumeProfile,
  OrderbookDepth,
} from "@/components/charts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X, PanelLeft } from "lucide-react";
import type { TickerData, TickerFullData, TileExplain } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [selectedTicker, setSelectedTicker] = useState("NIFTY");
  const [notional, setNotional] = useState(1000000);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorTileId, setInspectorTileId] = useState<string | null>(null);
  const [inspectorData, setInspectorData] = useState<unknown>(null);
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainTile, setExplainTile] = useState<TileExplain | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (shouldShowDisclaimer()) {
      setShowDisclaimer(true);
    } else if (shouldShowCookieConsent()) {
      setShowCookieConsent(true);
    }
  }, []);

  const handleDisclaimerAccept = () => {
    setShowDisclaimer(false);
    if (shouldShowCookieConsent()) {
      setShowCookieConsent(true);
    }
  };

  const { data: tickerData, isLoading: isLoadingTicker, refetch: refetchTicker } = useQuery<TickerData>({
    queryKey: ["/api/ticker", selectedTicker],
    refetchInterval: 30000, // Poll every 30 seconds for live spot prices
  });

  const { data: fullData, isLoading: isLoadingFull, refetch: refetchFull } = useQuery<TickerFullData>({
    queryKey: ["/api/ticker", selectedTicker, "full"],
  });

  const simulationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/run_simulation", { ticker: selectedTicker });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ticker", selectedTicker] });
      queryClient.invalidateQueries({ queryKey: ["/api/ticker", selectedTicker, "full"] });
    },
  });

  const handleRefresh = useCallback(async () => {
    queryClient.invalidateQueries({ queryKey: ["/api/ticker", selectedTicker] });
    queryClient.invalidateQueries({ queryKey: ["/api/ticker", selectedTicker, "full"] });
    await Promise.all([refetchTicker(), refetchFull()]);
  }, [selectedTicker, refetchTicker, refetchFull]);

  const openInspector = (tileId: string, data: unknown) => {
    setInspectorTileId(tileId);
    setInspectorData(data);
    setInspectorOpen(true);
  };

  const openExplain = (tileKey: string) => {
    const tile = TILE_EXPLAINS[tileKey];
    if (tile) {
      setExplainTile(tile);
      setExplainOpen(true);
    }
  };

  const isLoading = isLoadingTicker || isLoadingFull;
  const metrics = tickerData?.metrics;
  const quality = tickerData?.meta?.dataQuality || "GOOD";

  return (
    <div className="flex h-screen bg-background">
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden",
          mobileMenuOpen ? "block" : "hidden"
        )}
        onClick={() => setMobileMenuOpen(false)}
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 overflow-hidden",
          mobileMenuOpen ? "translate-x-0 w-80" : "-translate-x-full lg:translate-x-0",
          sidebarOpen ? "lg:w-80" : "lg:w-0 lg:border-r-0"
        )}
      >
        <div className="w-80 h-full">
          <LeftRail
            selectedTicker={selectedTicker}
            onTickerChange={(ticker) => {
              setSelectedTicker(ticker);
              setMobileMenuOpen(false);
            }}
            notional={notional}
            onNotionalChange={setNotional}
            verdictMultiplier={metrics?.trade_sizing_multiplier || 0}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1">
          <header className="z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title={sidebarOpen ? "Collapse Sidebar" : "Open sidebar to change ticker"}
              >
                <PanelLeft className="h-5 w-5" />
              </Button>
              <div className="flex flex-col">
                <h1 className="font-mono text-xl sm:text-3xl font-bold text-primary tracking-tight">
                  Tradyxa Aztryx
                </h1>
                <div className="hidden md:block">
                  <p className="text-sm sm:text-base font-medium text-muted-foreground">
                    Nifty, BankNifty & Nifty 500 Stocks Intelligence
                  </p>
                  <p className="text-sm text-muted-foreground/80 max-w-2xl">
                    Trained ML models for next-day index moves, slippage forecasting and execution guidance across NIFTY universes.
                    <span
                      className="ml-2 cursor-pointer text-cyan-400 hover:text-cyan-300 transition-colors drop-shadow-[0_0_2px_rgba(34,211,238,0.8)]"
                      onClick={() => setSidebarOpen(true)}
                    >
                      (Click here to Change the Stock Ticker)
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <RefreshButton
                isLoading={isLoading}
                onClick={handleRefresh}
              />
            </div>
          </header>

          <main className="p-2 sm:p-3 md:p-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-6">


              <NumericCard
                title="Spot Price"
                value={metrics?.spotPrice || 0}
                change={metrics?.spotChange}
                changePercent={metrics?.spotChangePercent}
                prefix="₹"
                quality={quality}
                isLoading={isLoadingTicker}
                onHelpClick={() => openExplain("spotPrice")}
                onClick={() => openInspector("spotPrice", { spotPrice: metrics?.spotPrice, spotChange: metrics?.spotChange })}
                testId="tile-spot-price"
              />

              <GaugeTile
                title="India VIX"
                value={metrics?.vix || 0}
                min={0}
                max={50}
                thresholds={{ low: 15, high: 25 }}
                quality={quality}
                isLoading={isLoadingTicker}
                onHelpClick={() => openExplain("indiaVix")}
                onClick={() => openInspector("indiaVix", { vix: metrics?.vix, vixChange: metrics?.vixChange })}
                testId="tile-india-vix"
              />

              <NumericCard
                title="Slippage Expectation"
                value={metrics?.slippageExpectation || 0}
                suffix="%"
                quality={quality}
                isLoading={isLoadingTicker}
                onHelpClick={() => openExplain("slippage")}
                onClick={() => openInspector("slippage", { slippage: metrics?.slippageExpectation, std: metrics?.slippageStd })}
                testId="tile-slippage"
                insight={getSlippageInsight({ median: metrics?.slippageExpectation || 0 })}
              />

              <VolumeProfile
                title="Volume Profile"
                data={fullData?.volumeProfile || []}
                currentPrice={metrics?.spotPrice}
                quality={quality}
                isLoading={isLoadingFull}
                onHelpClick={() => openExplain("volume")}
                onClick={() => openInspector("volume", fullData?.volumeProfile)}
                testId="tile-volume-profile"
              />

              <OrderbookDepth
                title="Orderbook Depth"
                data={fullData?.orderbook || []}
                midPrice={metrics?.spotPrice}
                quality={quality}
                isLoading={isLoadingFull}
                onHelpClick={() => openExplain("orderbook")}
                onClick={() => openInspector("orderbook", fullData?.orderbook)}
                testId="tile-orderbook"
              />

              <CandlesWithBands
                title="Candles with Bollinger Bands"
                data={fullData?.bollingerBands || []}
                quality={quality}
                isLoading={isLoadingFull}
                onHelpClick={() => openExplain("bollinger")}
                onClick={() => openInspector("bollinger", fullData?.bollingerBands)}
                testId="tile-bollinger"
              />

              <BarWithRolling
                title="Price with Rolling Averages"
                data={fullData?.rollingAverages || []}
                quality={quality}
                isLoading={isLoadingFull}
                onHelpClick={() => openExplain("rolling")}
                onClick={() => openInspector("rolling", fullData?.rollingAverages)}
                testId="tile-rolling"
              />

              <ScatterSlippage
                title="Slippage vs Volume"
                data={fullData?.slippageSamples || []}
                quality={quality}
                isLoading={isLoadingFull}
                onHelpClick={() => openExplain("scatter")}
                onClick={() => openInspector("scatter", fullData?.slippageSamples)}
                onRunSimulation={() => simulationMutation.mutate()}
                testId="tile-scatter"
              />

              <TimelineEvents
                title="Timeline Events"
                data={fullData?.timelineEvents || []}
                quality={quality}
                isLoading={isLoadingFull}
                onHelpClick={() => openExplain("timeline")}
                onClick={() => openInspector("timeline", fullData?.timelineEvents)}
                testId="tile-timeline"
              />

              <HeatmapTile
                title="Activity Heatmap"
                data={fullData?.heatmap || []}
                quality={quality}
                isLoading={isLoadingFull}
                onHelpClick={() => openExplain("heatmap")}
                onClick={() => openInspector("heatmap", fullData?.heatmap)}
                testId="tile-heatmap"
              />

              <StackedAreaAbsorption
                title="Order Flow Absorption"
                data={fullData?.absorptionFlow || []}
                quality={quality}
                isLoading={isLoadingFull}
                onHelpClick={() => openExplain("absorption")}
                onClick={() => openInspector("absorption", fullData?.absorptionFlow)}
                testId="tile-absorption"
              />

              <HistogramTile
                title="Returns Distribution"
                data={fullData?.histogram || []}
                quality={quality}
                isLoading={isLoadingFull}
                onHelpClick={() => openExplain("histogram")}
                onClick={() => openInspector("histogram", fullData?.histogram)}
                testId="tile-histogram"
              />
            </div>

            <div className="mt-4 sm:mt-6 mb-4 sm:mb-6">
              <VerdictTile
                ticker={selectedTicker}
                verdict={metrics?.verdict || null}
                notional={notional}
                multiplier={metrics?.trade_sizing_multiplier || 0}
                isLoading={isLoadingTicker}
                onHelpClick={() => openExplain("verdict")}
                onClick={() => openInspector("verdict", metrics?.verdict)}
              />
            </div>

            <div className="mt-4 sm:mt-6">
              <HowToTile onLearnMore={openExplain} />
            </div>
          </main>
          <Footer />
        </ScrollArea>
      </div>

      <InspectorPanel
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        tileId={inspectorTileId}
        data={inspectorData}
        ticker={selectedTicker}
      />

      <DisclaimerModal
        isOpen={showDisclaimer}
        onAccept={handleDisclaimerAccept}
      />

      <CookieConsentModal
        isOpen={showCookieConsent}
        onClose={() => setShowCookieConsent(false)}
      />

      <ExplainModal
        isOpen={explainOpen}
        onClose={() => setExplainOpen(false)}
        tile={explainTile}
      />
    </div>
  );
}
