import type { 
  TickerData, 
  TickerFullData, 
  Verdict, 
  VerdictComponent,
  Candle,
  VolumeBucket,
  OrderbookLevel,
  SlippageSample,
  TimelineEvent,
  HeatmapCell,
  MonteCarloResult,
  BollingerData,
  RollingData,
  AbsorptionData,
} from "@shared/schema";

// Seed-based pseudo-random generator for consistent data
function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return function() {
    hash = Math.sin(hash) * 10000;
    return hash - Math.floor(hash);
  };
}

function generateBasePrice(ticker: string): number {
  const prices: Record<string, number> = {
    "NIFTY": 24850.75,
    "BANKNIFTY": 52340.50,
    "RELIANCE": 2945.30,
    "TCS": 4125.80,
    "HDFCBANK": 1685.45,
    "INFY": 1890.25,
    "ICICIBANK": 1245.60,
  };
  return prices[ticker] || 1000 + Math.random() * 4000;
}

function generateVerdict(ticker: string, random: () => number): Verdict {
  const directions = ["BULLISH", "BEARISH", "NEUTRAL"] as const;
  const directionIndex = Math.floor(random() * 3);
  const direction = directions[directionIndex];
  
  const confidence = 0.45 + random() * 0.45; // 0.45 to 0.90
  const points = direction === "NEUTRAL" ? 0 : (random() * 150 + 20) * (direction === "BULLISH" ? 1 : -1);
  const error = points * 0.15 + random() * 10;

  const componentNames = [
    "Momentum Score",
    "Volume Trend",
    "VIX Signal",
    "Orderflow Bias",
    "MA Crossover",
    "RSI Level",
    "MACD Signal",
  ];

  const components: VerdictComponent[] = componentNames.slice(0, 5).map((name, i) => ({
    name,
    weight: 0.1 + random() * 0.3,
    value: random() * 100 - 50,
    contribution: (random() * 40 - 20) * (direction === "BULLISH" ? 1 : direction === "BEARISH" ? -1 : 0.5),
  }));

  const explanations: Record<string, string> = {
    BULLISH: `${ticker} shows strong bullish momentum with positive order flow and improving volume patterns. Technical indicators suggest potential upside.`,
    BEARISH: `${ticker} displays bearish pressure with negative order flow and declining volume. Technical signals indicate potential downside risk.`,
    NEUTRAL: `${ticker} is in a consolidation phase with mixed signals. Volume patterns and order flow suggest waiting for a clearer directional signal.`,
  };

  return {
    timestamp: new Date().toISOString(),
    direction,
    points: Math.round(points * 10) / 10,
    error: Math.round(error * 10) / 10,
    confidence: Math.round(confidence * 100) / 100,
    components,
    explanation: explanations[direction],
    data_quality: random() > 0.3 ? "GOOD" : random() > 0.5 ? "LOW" : "INSUFFICIENT",
    n_samples: Math.floor(random() * 500 + 100),
    params: { lookback: 20, smoothing: 0.8 },
  };
}

export function generateSyntheticData(ticker: string): TickerData {
  const random = seededRandom(ticker + new Date().toDateString());
  const basePrice = generateBasePrice(ticker);
  const change = (random() - 0.5) * basePrice * 0.02;
  const changePercent = (change / basePrice) * 100;

  return {
    meta: {
      ticker,
      name: getTickerName(ticker),
      exchange: "NSE",
      currency: "INR",
      lastUpdated: new Date().toISOString(),
      dataQuality: random() > 0.2 ? "GOOD" : "LOW",
    },
    metrics: {
      spotPrice: Math.round(basePrice * 100) / 100,
      spotChange: Math.round(change * 100) / 100,
      spotChangePercent: Math.round(changePercent * 100) / 100,
      vix: 12 + random() * 15,
      vixChange: (random() - 0.5) * 2,
      slippageExpectation: 0.02 + random() * 0.08,
      slippageStd: 0.01 + random() * 0.03,
      avgVolume: 1000000 + random() * 5000000,
      volumeChange: (random() - 0.5) * 30,
      openInterest: 500000 + random() * 2000000,
      oiChange: (random() - 0.5) * 15,
      impliedVolatility: 15 + random() * 20,
      historicalVolatility: 12 + random() * 18,
      verdict: generateVerdict(ticker, random),
    },
  };
}

export function generateFullSyntheticData(ticker: string): TickerFullData {
  const basicData = generateSyntheticData(ticker);
  const random = seededRandom(ticker + "full" + new Date().toDateString());
  const basePrice = basicData.metrics.spotPrice;

  // Generate candles (last 60 days)
  const candles: Candle[] = [];
  let currentPrice = basePrice * (1 - 0.1 + random() * 0.2);
  for (let i = 59; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayChange = (random() - 0.5) * currentPrice * 0.03;
    const open = currentPrice;
    const close = currentPrice + dayChange;
    const high = Math.max(open, close) * (1 + random() * 0.01);
    const low = Math.min(open, close) * (1 - random() * 0.01);
    const volume = 500000 + random() * 2000000;
    
    candles.push({
      date: date.toISOString().split("T")[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.round(volume),
    });
    currentPrice = close;
  }

  // Generate volume profile
  const volumeProfile: VolumeBucket[] = [];
  const priceStep = basePrice * 0.01;
  for (let i = -10; i <= 10; i++) {
    const price = basePrice + i * priceStep;
    const normalizedDist = Math.exp(-0.5 * Math.pow(i / 5, 2));
    const volume = normalizedDist * 1000000 * (0.5 + random());
    const buyRatio = 0.4 + random() * 0.2;
    
    volumeProfile.push({
      price: Math.round(price * 100) / 100,
      volume: Math.round(volume),
      buyVolume: Math.round(volume * buyRatio),
      sellVolume: Math.round(volume * (1 - buyRatio)),
    });
  }

  // Generate orderbook
  const orderbook: OrderbookLevel[] = [];
  for (let i = -15; i <= 15; i++) {
    if (i === 0) continue;
    const price = basePrice + i * priceStep * 0.5;
    const qty = Math.floor(random() * 5000 + 500);
    
    orderbook.push({
      price: Math.round(price * 100) / 100,
      bidQty: i < 0 ? qty : 0,
      askQty: i > 0 ? qty : 0,
    });
  }

  // Generate slippage samples
  const slippageSamples: SlippageSample[] = [];
  for (let i = 0; i < 50; i++) {
    const volume = 10000 + random() * 200000;
    const slippageBase = 0.01 + (volume / 200000) * 0.1;
    const slippage = slippageBase * (0.5 + random());
    
    slippageSamples.push({
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      expected: basePrice,
      actual: basePrice * (1 + slippage / 100 * (random() > 0.5 ? 1 : -1)),
      slippage: Math.round(slippage * 1000) / 1000,
      volume: Math.round(volume),
    });
  }

  // Generate timeline events
  const eventTypes: TimelineEvent["type"][] = ["earnings", "dividend", "split", "news", "economic"];
  const impacts: TimelineEvent["impact"][] = ["positive", "negative", "neutral"];
  const timelineEvents: TimelineEvent[] = [];
  
  for (let i = 0; i < 8; i++) {
    const daysOffset = Math.floor(random() * 60) - 30;
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + daysOffset);
    
    timelineEvents.push({
      timestamp: eventDate.toISOString(),
      type: eventTypes[Math.floor(random() * eventTypes.length)],
      title: getEventTitle(eventTypes[Math.floor(random() * eventTypes.length)], ticker, random),
      impact: impacts[Math.floor(random() * impacts.length)],
    });
  }
  timelineEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Generate heatmap
  const heatmap: HeatmapCell[] = [];
  for (let day = 0; day < 5; day++) {
    for (let hour = 9; hour <= 15; hour++) {
      heatmap.push({
        hour,
        dayOfWeek: day,
        value: random() * 100,
        count: Math.floor(random() * 1000 + 100),
      });
    }
  }

  // Generate Monte Carlo results
  const monteCarlo: MonteCarloResult[] = [10, 25, 50, 75, 90].map(percentile => ({
    percentile,
    values: Array.from({ length: 30 }, (_, i) => 
      basePrice * (1 + (percentile / 100 - 0.5) * 0.1 + (random() - 0.5) * 0.02 * (i + 1))
    ),
  }));

  // Generate Bollinger bands
  const bollingerBands: BollingerData[] = candles.slice(-30).map((candle, i, arr) => {
    const lookback = Math.min(i + 1, 20);
    const closes = arr.slice(Math.max(0, i - lookback + 1), i + 1).map(c => c.close);
    const middle = closes.reduce((a, b) => a + b, 0) / closes.length;
    const std = Math.sqrt(closes.reduce((sum, c) => sum + Math.pow(c - middle, 2), 0) / closes.length);
    
    return {
      date: candle.date,
      close: candle.close,
      upper: Math.round((middle + 2 * std) * 100) / 100,
      middle: Math.round(middle * 100) / 100,
      lower: Math.round((middle - 2 * std) * 100) / 100,
    };
  });

  // Generate rolling averages
  const rollingAverages: RollingData[] = candles.slice(-30).map((candle, i, arr) => {
    const calcMA = (period: number) => {
      const start = Math.max(0, i - period + 1);
      const slice = arr.slice(start, i + 1);
      return slice.reduce((sum, c) => sum + c.close, 0) / slice.length;
    };
    
    return {
      date: candle.date,
      value: candle.close,
      ma5: Math.round(calcMA(5) * 100) / 100,
      ma20: Math.round(calcMA(20) * 100) / 100,
      ma50: Math.round(calcMA(Math.min(i + 1, 50)) * 100) / 100,
    };
  });

  // Generate absorption flow
  const absorptionFlow: AbsorptionData[] = candles.slice(-30).map(candle => {
    const buyFlow = 500000 + random() * 2000000;
    const sellFlow = 500000 + random() * 2000000;
    return {
      date: candle.date,
      buyFlow: Math.round(buyFlow),
      sellFlow: Math.round(sellFlow),
      netFlow: Math.round(buyFlow - sellFlow),
    };
  });

  // Generate histogram
  const histogram = [];
  for (let bin = -3; bin <= 3; bin += 0.5) {
    const normalDist = Math.exp(-0.5 * Math.pow(bin, 2));
    const count = Math.round(normalDist * 100 * (0.5 + random()));
    histogram.push({
      bin,
      count,
      cumulative: 0, // Will calculate below
    });
  }
  let cumulative = 0;
  histogram.forEach(h => {
    cumulative += h.count;
    h.cumulative = cumulative;
  });

  return {
    ...basicData,
    candles,
    volumeProfile,
    orderbook,
    slippageSamples,
    timelineEvents,
    heatmap,
    monteCarlo,
    bollingerBands,
    rollingAverages,
    absorptionFlow,
    histogram,
  };
}

function getTickerName(ticker: string): string {
  const names: Record<string, string> = {
    "NIFTY": "Nifty 50 Index",
    "BANKNIFTY": "Nifty Bank Index",
    "RELIANCE": "Reliance Industries Ltd",
    "TCS": "Tata Consultancy Services",
    "HDFCBANK": "HDFC Bank Ltd",
    "INFY": "Infosys Ltd",
    "ICICIBANK": "ICICI Bank Ltd",
    "HINDUNILVR": "Hindustan Unilever Ltd",
    "ITC": "ITC Ltd",
    "SBIN": "State Bank of India",
  };
  return names[ticker] || `${ticker} Ltd`;
}

function getEventTitle(type: TimelineEvent["type"], ticker: string, random: () => number): string {
  const titles: Record<string, string[]> = {
    earnings: [`${ticker} Q3 Results`, `${ticker} Earnings Report`, `${ticker} Annual Results`],
    dividend: [`${ticker} Dividend Declaration`, `${ticker} Interim Dividend`, `${ticker} Final Dividend`],
    split: [`${ticker} Stock Split`, `${ticker} Bonus Issue`, `${ticker} Rights Issue`],
    news: [`${ticker} Partnership Announcement`, `${ticker} Expansion Plans`, `${ticker} Market Update`],
    economic: ["RBI Policy Review", "Budget Announcement", "GDP Data Release", "CPI Data Release"],
  };
  const options = titles[type] || [`${ticker} Event`];
  return options[Math.floor(random() * options.length)];
}
