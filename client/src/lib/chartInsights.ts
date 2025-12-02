import type { 
  SlippageSample, 
  VolumeBucket, 
  OrderbookLevel, 
  HeatmapCell,
  AbsorptionData,
  BollingerData,
  RollingData 
} from "@shared/schema";

export function getSlippageInsight(data: Record<string, any>): string {
  if (!data) return "No data yet";
  const median = data.median || 0;
  if (median < 0.02) return "✓ Easy to buy/sell - Good!";
  if (median < 0.05) return "✓ Pretty easy - OK!";
  if (median < 0.10) return "⚠ A bit hard to buy/sell";
  return "⚠ Very hard to buy/sell - Be careful!";
}

export function getVolumeProfileInsight(data: VolumeBucket[]): string {
  if (!data || data.length === 0) return "No volume data";
  
  const withMaxVolume = data.reduce((max, curr) => 
    curr.volume > max.volume ? curr : max
  );
  const peakPrice = withMaxVolume.price;
  
  const abovePrice = data.filter(d => d.price > peakPrice).reduce((sum, d) => sum + d.volume, 0);
  const belowPrice = data.filter(d => d.price < peakPrice).reduce((sum, d) => sum + d.volume, 0);
  
  if (abovePrice > belowPrice * 1.2) return `📉 People sold LOWER prices before - Market moved UP since then`;
  if (belowPrice > abovePrice * 1.2) return `📈 People bought LOWER prices - Price climbed UP from there`;
  return `➡ People divided on direction - Market stable`;
}

export function getOrderbookInsight(data: OrderbookLevel[]): string {
  if (!data || data.length === 0) return "No orderbook data";
  
  const totalBid = data.reduce((sum, d) => sum + d.bidQty, 0);
  const totalAsk = data.reduce((sum, d) => sum + d.askQty, 0);
  const bidAskRatio = totalBid / Math.max(totalAsk, 1);
  
  if (bidAskRatio > 1.3) return "🟢 More buyers than sellers - Might go UP!";
  if (bidAskRatio < 0.7) return "🔴 More sellers than buyers - Might go DOWN!";
  return "🟡 Equal buyers & sellers - No clear direction";
}

export function getBollingerInsight(data: BollingerData[]): string {
  if (!data || data.length === 0) return "No data";
  
  const latest = data[data.length - 1];
  if (!latest) return "No data";
  
  const position = (latest.close - latest.lower) / (latest.upper - latest.lower);
  
  if (position > 0.8) return "⬆⬆ Price is HIGH - May come down soon";
  if (position < 0.2) return "⬇⬇ Price is LOW - May go up soon";
  if (position > 0.5) return "⬆ Price is higher - Might keep going up";
  return "⬇ Price is lower - Might keep going down";
}

export function getRollingAverageInsight(data: RollingData[]): string {
  if (!data || data.length === 0) return "No data";
  
  const latest = data[data.length - 1];
  if (!latest) return "No data";
  
  if (latest.ma5 > latest.ma20 && latest.ma20 > latest.ma50) 
    return "🟢 GOOD - Everything shows price going UP";
  if (latest.ma5 < latest.ma20 && latest.ma20 < latest.ma50) 
    return "🔴 BAD - Everything shows price going DOWN";
  return "🟡 MIXED - Signs are confused";
}

export function getScatterInsight(data: SlippageSample[]): string {
  if (!data || data.length === 0) return "No data";
  
  const avgVolume = data.reduce((sum, d) => sum + d.volume, 0) / data.length;
  const avgSlippage = data.reduce((sum, d) => sum + Math.abs(d.slippage), 0) / data.length;
  
  if (avgSlippage < 0.03) return `✓ Easy to trade - Low cost`;
  if (avgSlippage < 0.07) return `⚠ Normal - Medium cost`;
  return `❌ Hard to trade - High cost`;
}

export function getHeatmapInsight(data: HeatmapCell[]): string {
  if (!data || data.length === 0) return "No data";
  
  const peakCell = data.reduce((max, curr) => 
    curr.value > max.value ? curr : max
  );
  
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const dayName = days[peakCell.dayOfWeek] || "Unknown";
  const hour = peakCell.hour;
  
  return `🔥 Most active: ${dayName} at ${hour}:00 - Busiest time!`;
}

export function getAbsorptionInsight(data: AbsorptionData[]): string {
  if (!data || data.length === 0) return "No data";
  
  const latest = data[data.length - 1];
  const totalBuyFlow = data.reduce((sum, d) => sum + d.buyFlow, 0);
  const totalSellFlow = data.reduce((sum, d) => sum + d.sellFlow, 0);
  const netFlow = totalBuyFlow - totalSellFlow;
  
  if (netFlow > 0) return `🟢 More people BUYING - Price might go UP`;
  return `🔴 More people SELLING - Price might go DOWN`;
}

export function getHistogramInsight(data: any[]): string {
  if (!data || data.length === 0) return "No data";
  
  const maxBin = data.reduce((max, curr) => 
    curr.count > max.count ? curr : max
  );
  
  if (Math.abs(maxBin.bin) < 0.5) return "➡ Price moving SIDEWAYS - No clear direction";
  if (maxBin.bin > 1) return "⬆ Prices going UP more often - Good signal!";
  if (maxBin.bin < -1) return "⬇ Prices going DOWN more often - Bad signal!";
  return "🎯 Price stable - Small moves";
}
