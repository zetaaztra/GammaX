import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import type { TileExplain } from "@shared/schema";

interface ExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
  tile: TileExplain | null;
  icon?: React.ReactNode;
}

export function ExplainModal({ isOpen, onClose, tile, icon }: ExplainModalProps) {
  if (!tile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {icon}
            {tile.title}
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            {tile.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4 pr-4">
          {tile.simpleExplanation && (
            <section className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-2 text-primary">Simple Explanation</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{tile.simpleExplanation}</p>
            </section>
          )}

          <section>
            <h4 className="font-semibold mb-3">Threshold Interpretation</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <div>
                  <Badge className="bg-success/20 text-success border-success/30 mb-1">
                    Green
                  </Badge>
                  <p className="text-sm text-muted-foreground">{tile.thresholds.green}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <Badge className="bg-warning/20 text-warning border-warning/30 mb-1">
                    Yellow
                  </Badge>
                  <p className="text-sm text-muted-foreground">{tile.thresholds.amber}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20">
                <AlertCircle className="h-5 w-5 text-danger mt-0.5 flex-shrink-0" />
                <div>
                  <Badge className="bg-danger/20 text-danger border-danger/30 mb-1">
                    Red
                  </Badge>
                  <p className="text-sm text-muted-foreground">{tile.thresholds.red}</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h4 className="font-semibold mb-3">Example Actions</h4>
            <ul className="space-y-2">
              {tile.actions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <DialogFooter>
          <Button onClick={onClose} data-testid="button-explain-close">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const TILE_EXPLAINS: Record<string, TileExplain> = {
  spotPrice: {
    title: "Spot Price",
    description: "The current market price of the underlying asset. This is the most recent traded price and serves as the reference for all derivative calculations.",
    simpleExplanation: "This is how much one stock costs RIGHT NOW. That's it!",
    thresholds: {
      green: "Price within expected trading range",
      amber: "Price near support/resistance levels",
      red: "Price breaking key technical levels",
    },
    actions: [
      "Monitor for breakout confirmation above/below key levels",
      "Use as entry point reference for position sizing",
      "Compare with moving averages for trend confirmation",
    ],
  },
  indiaVix: {
    title: "India VIX",
    description: "The volatility index measuring market expectations of near-term volatility. Higher values indicate expected market turbulence, while lower values suggest calm markets.",
    simpleExplanation: "Is the market SCARED or HAPPY?\n• High VIX = Market is SCARED (people worried)\n• Low VIX = Market is CALM (people happy)",
    thresholds: {
      green: "VIX below 15 - Low volatility, stable market",
      amber: "VIX 15-25 - Moderate volatility, normal conditions",
      red: "VIX above 25 - High volatility, expect large moves",
    },
    actions: [
      "Reduce position sizes when VIX is elevated",
      "Consider volatility strategies when VIX is low",
      "Monitor VIX changes for early warning signals",
    ],
  },
  slippage: {
    title: "Slippage Expectation",
    description: "Expected difference between intended and actual execution price. This metric helps estimate trading costs and optimize order timing.",
    simpleExplanation: "You want to buy at ₹50,000, but by the time your order goes through = price jumped to ₹50,050. You lost ₹50! That's SLIPPAGE.\n\n0.45% slippage = Expect to lose 0.45% on every trade",
    thresholds: {
      green: "Slippage < 0.1% - Excellent liquidity",
      amber: "Slippage 0.1-0.3% - Moderate impact",
      red: "Slippage > 0.3% - Consider smaller orders",
    },
    actions: [
      "Use limit orders to control execution price",
      "Split large orders during high slippage periods",
      "Time entries during high liquidity windows",
    ],
  },
  volume: {
    title: "Volume Profile",
    description: "Distribution of trading volume across price levels. Identifies where most trading activity occurs and potential support/resistance zones.",
    simpleExplanation: "Imagine a restaurant - some prices have MORE customers (high volume).\n• More people want to SELL at a price = Price might go DOWN\n• More people want to BUY at a price = Price might go UP",
    thresholds: {
      green: "Strong volume at current price - Good support",
      amber: "Low volume zone - Price may move quickly",
      red: "Very thin volume - High slippage risk",
    },
    actions: [
      "Identify high-volume nodes for entry/exit points",
      "Avoid positions in low-volume zones",
      "Use volume confirmation for breakout trades",
    ],
  },
  orderbook: {
    title: "Orderbook Depth",
    description: "Visualization of pending buy and sell orders at different price levels. Shows market depth and potential support/resistance from pending orders.",
    simpleExplanation: "Imagine a queue at a store.\n• BID = people WAITING to buy (want price to go DOWN so they buy cheap)\n• ASK = people WAITING to sell (want price to go UP so they sell expensive)\n• More people in BUY queue = Price might go UP",
    thresholds: {
      green: "Balanced bid/ask depth - Stable market",
      amber: "Imbalanced depth - Direction bias likely",
      red: "Very thin book - High volatility expected",
    },
    actions: [
      "Look for large orders indicating institutional interest",
      "Identify potential price walls for targets",
      "Monitor changes in depth for momentum signals",
    ],
  },
  bollinger: {
    title: "Candles with Bollinger Bands",
    description: "Price action displayed with Bollinger Bands showing volatility-based support and resistance levels. Bands expand in volatile markets and contract in quiet periods.",
    simpleExplanation: "Imagine a rope with TWO ends (upper band & lower band). Price bounces between them like a ball.\n• If price is at TOP band = price is VERY HIGH (may come DOWN)\n• If price is at BOTTOM band = price is VERY LOW (may go UP)\n• If in MIDDLE = normal, no clear direction",
    thresholds: {
      green: "Price within bands - Normal trading range",
      amber: "Price touching bands - Potential reversal",
      red: "Price outside bands - Extreme move, caution",
    },
    actions: [
      "Look for band squeezes preceding breakouts",
      "Consider mean reversion when price touches outer bands",
      "Use band width as volatility indicator",
    ],
  },
  rolling: {
    title: "Bar with Rolling Average",
    description: "Price bars overlaid with multiple moving averages (5, 20, 50 day) to identify trends and potential crossover signals.",
    simpleExplanation: "Imagine 3 friends watching price movement.\n• Friend 1 watches SHORT term (5 days)\n• Friend 2 watches MEDIUM term (20 days)\n• Friend 3 watches LONG term (50 days)\n• If all 3 say 'PRICE GOING UP' = Strong UP signal!",
    thresholds: {
      green: "Price above all MAs - Strong uptrend",
      amber: "Price between MAs - Consolidation phase",
      red: "Price below all MAs - Strong downtrend",
    },
    actions: [
      "Trade in direction of MA alignment",
      "Watch for golden/death cross signals",
      "Use pullbacks to MA as entry opportunities",
    ],
  },
  scatter: {
    title: "Scatter Slippage",
    description: "Scatter plot showing relationship between order size and slippage. Helps understand execution quality across different trade sizes.",
    simpleExplanation: "When LOTS of people are trading (high volume)...\n• Do you LOSE MORE money (high slippage) or LESS money (low slippage)?\n• If low slippage = GOOD - Easy to trade even when busy\n• If high slippage = BAD - You lose money when lots of people trade",
    thresholds: {
      green: "Linear relationship - Predictable slippage",
      amber: "Increasing slope - Large orders face more slippage",
      red: "Scattered data - Unpredictable execution",
    },
    actions: [
      "Optimize order sizes based on slippage curve",
      "Identify optimal trade size for your strategy",
      "Compare current vs historical slippage patterns",
    ],
  },
  timeline: {
    title: "Timeline Events",
    description: "Calendar of corporate actions, economic events, and news that may impact the asset. Includes earnings, dividends, splits, and macro announcements.",
    thresholds: {
      green: "No major events - Normal trading expected",
      amber: "Event approaching - Consider position adjustment",
      red: "High-impact event imminent - Elevated risk",
    },
    actions: [
      "Reduce exposure before earnings announcements",
      "Monitor economic calendar for macro events",
      "Adjust stops around known event dates",
    ],
  },
  heatmap: {
    title: "Heatmap",
    description: "Shows trading activity patterns by hour and day of week. Identifies when the market is most active and when liquidity may be thin.",
    simpleExplanation: "Which day? Which time? When do people do MOST trading?\n• During busy times = hard to get good prices (more slippage)\n• During quiet times = easy to get good prices (less slippage)\n• Avoid trading at busiest times!",
    thresholds: {
      green: "High activity period - Best execution",
      amber: "Moderate activity - Acceptable trading",
      red: "Low activity - Avoid large orders",
    },
    actions: [
      "Time entries during high activity periods",
      "Avoid trading during low liquidity windows",
      "Use for optimal order scheduling",
    ],
  },
  absorption: {
    title: "Stacked Area Absorption",
    description: "Visualization of buy vs sell flow over time. Shows net order flow and helps identify accumulation or distribution patterns.",
    simpleExplanation: "Who's winning the fight? Buyers or Sellers?\n• More BUYING happening = Price might go UP\n• More SELLING happening = Price might go DOWN",
    thresholds: {
      green: "Strong buy absorption - Bullish pressure",
      amber: "Balanced flow - Neutral market",
      red: "Strong sell absorption - Bearish pressure",
    },
    actions: [
      "Look for divergence between price and flow",
      "Identify accumulation at support levels",
      "Watch for distribution at resistance levels",
    ],
  },
  histogram: {
    title: "Histogram",
    description: "Distribution of returns or price changes. Shows the frequency of different return magnitudes and helps assess risk.",
    simpleExplanation: "Is price moving in ONE direction or BOUNCING SIDEWAYS?\n• If TRENDING = Price moving with clear direction UP or DOWN\n• If BOUNCING = Price stuck in same range, no clear direction",
    thresholds: {
      green: "Normal distribution - Typical risk profile",
      amber: "Fat tails - Higher than normal extreme moves",
      red: "Skewed distribution - Directional risk bias",
    },
    actions: [
      "Use distribution shape for risk assessment",
      "Identify outlier move probabilities",
      "Compare current vs historical distributions",
    ],
  },
  verdict: {
    title: "Verdict",
    description: "Aggregated directional signal combining multiple indicators. Provides a synthesized view with confidence level and expected price movement.",
    simpleExplanation: "Based on ALL the tiles above working together...\n• VERDICT = BUY (BULLISH) or SELL (BEARISH) or WAIT (NEUTRAL)\n• CONFIDENCE % = How sure the system is (80% = pretty sure, 40% = not sure)\n• 💰 INVEST THIS MUCH = Only risk this % of your money",
    thresholds: {
      green: "High confidence (>70%) - Strong signal",
      amber: "Moderate confidence (40-70%) - Proceed with caution",
      red: "Low confidence (<40%) - Signal unreliable",
    },
    actions: [
      "Use as confirmation for independent analysis",
      "Size positions according to confidence level",
      "Monitor component contributions for signal quality",
    ],
  },
};
