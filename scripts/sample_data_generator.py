#!/usr/bin/env python3
"""
Sample Data Generator for Tradyxa Aztryx Dashboard
Generates synthetic market data when yfinance fails or for demo purposes.
"""

import json
import os
import argparse
import random
import math
from datetime import datetime, timedelta
from typing import Dict, Any, List

def seeded_random(seed: str) -> random.Random:
    """Create a seeded random generator for consistent data."""
    hash_val = sum(ord(c) for c in seed)
    return random.Random(hash_val)

def generate_base_price(ticker: str) -> float:
    """Get base price for known tickers or generate random."""
    prices = {
        "NIFTY": 24850.75,
        "BANKNIFTY": 52340.50,
        "RELIANCE": 2945.30,
        "TCS": 4125.80,
        "HDFCBANK": 1685.45,
        "INFY": 1890.25,
        "ICICIBANK": 1245.60,
    }
    return prices.get(ticker, 1000 + random.random() * 4000)

def get_ticker_name(ticker: str) -> str:
    """Get full name for a ticker."""
    names = {
        "NIFTY": "Nifty 50 Index",
        "BANKNIFTY": "Nifty Bank Index",
        "RELIANCE": "Reliance Industries Ltd",
        "TCS": "Tata Consultancy Services",
        "HDFCBANK": "HDFC Bank Ltd",
        "INFY": "Infosys Ltd",
        "ICICIBANK": "ICICI Bank Ltd",
    }
    return names.get(ticker, f"{ticker} Ltd")

def generate_verdict(ticker: str, rng: random.Random) -> Dict[str, Any]:
    """Generate verdict data."""
    directions = ["BULLISH", "BEARISH", "NEUTRAL"]
    direction = rng.choice(directions)
    
    confidence = 0.45 + rng.random() * 0.45
    points = 0 if direction == "NEUTRAL" else (rng.random() * 150 + 20) * (1 if direction == "BULLISH" else -1)
    error = abs(points) * 0.15 + rng.random() * 10
    
    components = []
    for name in ["Momentum Score", "Volume Trend", "VIX Signal", "Orderflow Bias", "MA Crossover"]:
        components.append({
            "name": name,
            "weight": 0.1 + rng.random() * 0.3,
            "value": rng.random() * 100 - 50,
            "contribution": (rng.random() * 40 - 20) * (1 if direction == "BULLISH" else -1 if direction == "BEARISH" else 0.5)
        })
    
    explanations = {
        "BULLISH": f"{ticker} shows strong bullish momentum with positive order flow and improving volume patterns.",
        "BEARISH": f"{ticker} displays bearish pressure with negative order flow and declining volume.",
        "NEUTRAL": f"{ticker} is in consolidation with mixed signals. Wait for clearer direction."
    }
    
    return {
        "timestamp": datetime.now().isoformat(),
        "direction": direction,
        "points": round(points, 1),
        "error": round(error, 1),
        "confidence": round(confidence, 2),
        "components": components,
        "explanation": explanations[direction],
        "data_quality": "GOOD" if rng.random() > 0.3 else "LOW",
        "n_samples": int(rng.random() * 500 + 100),
        "params": {"lookback": 20, "smoothing": 0.8}
    }

def generate_candles(base_price: float, days: int, rng: random.Random) -> List[Dict[str, Any]]:
    """Generate OHLCV candle data."""
    candles = []
    current_price = base_price * (1 - 0.1 + rng.random() * 0.2)
    
    for i in range(days - 1, -1, -1):
        date = datetime.now() - timedelta(days=i)
        day_change = (rng.random() - 0.5) * current_price * 0.03
        open_price = current_price
        close_price = current_price + day_change
        high_price = max(open_price, close_price) * (1 + rng.random() * 0.01)
        low_price = min(open_price, close_price) * (1 - rng.random() * 0.01)
        volume = int(500000 + rng.random() * 2000000)
        
        candles.append({
            "date": date.strftime("%Y-%m-%d"),
            "open": round(open_price, 2),
            "high": round(high_price, 2),
            "low": round(low_price, 2),
            "close": round(close_price, 2),
            "volume": volume
        })
        current_price = close_price
    
    return candles

def generate_volume_profile(base_price: float, rng: random.Random) -> List[Dict[str, Any]]:
    """Generate volume profile data."""
    profile = []
    price_step = base_price * 0.01
    
    for i in range(-10, 11):
        price = base_price + i * price_step
        normalized_dist = math.exp(-0.5 * (i / 5) ** 2)
        volume = int(normalized_dist * 1000000 * (0.5 + rng.random()))
        buy_ratio = 0.4 + rng.random() * 0.2
        
        profile.append({
            "price": round(price, 2),
            "volume": volume,
            "buyVolume": int(volume * buy_ratio),
            "sellVolume": int(volume * (1 - buy_ratio))
        })
    
    return profile

def generate_orderbook(base_price: float, rng: random.Random) -> List[Dict[str, Any]]:
    """Generate orderbook depth data."""
    orderbook = []
    price_step = base_price * 0.005
    
    for i in range(-15, 16):
        if i == 0:
            continue
        price = base_price + i * price_step
        qty = int(rng.random() * 5000 + 500)
        
        orderbook.append({
            "price": round(price, 2),
            "bidQty": qty if i < 0 else 0,
            "askQty": qty if i > 0 else 0
        })
    
    return orderbook

def generate_slippage_samples(base_price: float, rng: random.Random, count: int = 50) -> List[Dict[str, Any]]:
    """Generate slippage sample data."""
    samples = []
    
    for i in range(count):
        volume = 10000 + rng.random() * 200000
        slippage_base = 0.01 + (volume / 200000) * 0.1
        slippage = slippage_base * (0.5 + rng.random())
        
        samples.append({
            "timestamp": (datetime.now() - timedelta(hours=i)).isoformat(),
            "expected": base_price,
            "actual": base_price * (1 + slippage / 100 * (1 if rng.random() > 0.5 else -1)),
            "slippage": round(slippage, 3),
            "volume": int(volume)
        })
    
    return samples

def generate_timeline_events(ticker: str, rng: random.Random) -> List[Dict[str, Any]]:
    """Generate timeline event data."""
    event_types = ["earnings", "dividend", "split", "news", "economic"]
    impacts = ["positive", "negative", "neutral"]
    
    events = []
    for _ in range(8):
        days_offset = int(rng.random() * 60) - 30
        event_date = datetime.now() + timedelta(days=days_offset)
        event_type = rng.choice(event_types)
        
        titles = {
            "earnings": [f"{ticker} Q3 Results", f"{ticker} Earnings Report"],
            "dividend": [f"{ticker} Dividend Declaration", f"{ticker} Interim Dividend"],
            "split": [f"{ticker} Stock Split", f"{ticker} Bonus Issue"],
            "news": [f"{ticker} Partnership", f"{ticker} Expansion Plans"],
            "economic": ["RBI Policy Review", "Budget Announcement", "GDP Data"]
        }
        
        events.append({
            "timestamp": event_date.isoformat(),
            "type": event_type,
            "title": rng.choice(titles[event_type]),
            "impact": rng.choice(impacts)
        })
    
    return sorted(events, key=lambda x: x["timestamp"])

def generate_heatmap(rng: random.Random) -> List[Dict[str, Any]]:
    """Generate activity heatmap data."""
    heatmap = []
    for day in range(5):
        for hour in range(9, 16):
            heatmap.append({
                "hour": hour,
                "dayOfWeek": day,
                "value": rng.random() * 100,
                "count": int(rng.random() * 1000 + 100)
            })
    return heatmap

def generate_bollinger_bands(candles: List[Dict], lookback: int = 20) -> List[Dict[str, Any]]:
    """Generate Bollinger bands from candles."""
    bands = []
    for i, candle in enumerate(candles[-30:]):
        closes = [c["close"] for c in candles[max(0, i - lookback + 1):i + 1]]
        if not closes:
            closes = [candle["close"]]
        middle = sum(closes) / len(closes)
        std = (sum((c - middle) ** 2 for c in closes) / len(closes)) ** 0.5 if len(closes) > 1 else 0
        
        bands.append({
            "date": candle["date"],
            "close": candle["close"],
            "upper": round(middle + 2 * std, 2),
            "middle": round(middle, 2),
            "lower": round(middle - 2 * std, 2)
        })
    return bands

def generate_rolling_averages(candles: List[Dict]) -> List[Dict[str, Any]]:
    """Generate rolling average data."""
    averages = []
    for i, candle in enumerate(candles[-30:]):
        def calc_ma(period: int) -> float:
            start = max(0, i - period + 1)
            slice_data = candles[start:i + 1]
            return sum(c["close"] for c in slice_data) / len(slice_data)
        
        averages.append({
            "date": candle["date"],
            "value": candle["close"],
            "ma5": round(calc_ma(5), 2),
            "ma20": round(calc_ma(20), 2),
            "ma50": round(calc_ma(min(i + 1, 50)), 2)
        })
    return averages

def generate_absorption_flow(candles: List[Dict], rng: random.Random) -> List[Dict[str, Any]]:
    """Generate order flow absorption data."""
    flow = []
    for candle in candles[-30:]:
        buy_flow = 500000 + rng.random() * 2000000
        sell_flow = 500000 + rng.random() * 2000000
        flow.append({
            "date": candle["date"],
            "buyFlow": int(buy_flow),
            "sellFlow": int(sell_flow),
            "netFlow": int(buy_flow - sell_flow)
        })
    return flow

def generate_histogram(rng: random.Random) -> List[Dict[str, Any]]:
    """Generate returns distribution histogram."""
    histogram = []
    cumulative = 0
    for bin_val in [x * 0.5 for x in range(-6, 7)]:
        normal_dist = math.exp(-0.5 * bin_val ** 2)
        count = int(normal_dist * 100 * (0.5 + rng.random()))
        cumulative += count
        histogram.append({
            "bin": bin_val,
            "count": count,
            "cumulative": cumulative
        })
    return histogram

def generate_full_data(ticker: str) -> Dict[str, Any]:
    """Generate complete ticker data with all components."""
    rng = seeded_random(ticker + datetime.now().strftime("%Y%m%d"))
    base_price = generate_base_price(ticker)
    change = (rng.random() - 0.5) * base_price * 0.02
    
    candles = generate_candles(base_price, 60, rng)
    
    data = {
        "meta": {
            "ticker": ticker,
            "name": get_ticker_name(ticker),
            "exchange": "NSE",
            "currency": "INR",
            "lastUpdated": datetime.now().isoformat(),
            "dataQuality": "GOOD" if rng.random() > 0.2 else "LOW"
        },
        "metrics": {
            "spotPrice": round(base_price, 2),
            "spotChange": round(change, 2),
            "spotChangePercent": round((change / base_price) * 100, 2),
            "vix": round(12 + rng.random() * 15, 2),
            "vixChange": round((rng.random() - 0.5) * 2, 2),
            "slippageExpectation": round(0.02 + rng.random() * 0.08, 4),
            "slippageStd": round(0.01 + rng.random() * 0.03, 4),
            "avgVolume": int(1000000 + rng.random() * 5000000),
            "volumeChange": round((rng.random() - 0.5) * 30, 2),
            "openInterest": int(500000 + rng.random() * 2000000),
            "oiChange": round((rng.random() - 0.5) * 15, 2),
            "impliedVolatility": round(15 + rng.random() * 20, 2),
            "historicalVolatility": round(12 + rng.random() * 18, 2),
            "verdict": generate_verdict(ticker, rng)
        },
        "candles": candles,
        "volumeProfile": generate_volume_profile(base_price, rng),
        "orderbook": generate_orderbook(base_price, rng),
        "slippageSamples": generate_slippage_samples(base_price, rng),
        "timelineEvents": generate_timeline_events(ticker, rng),
        "heatmap": generate_heatmap(rng),
        "monteCarlo": [
            {"percentile": p, "values": [base_price * (1 + (p/100 - 0.5) * 0.1 + (rng.random() - 0.5) * 0.02 * i) for i in range(30)]}
            for p in [10, 25, 50, 75, 90]
        ],
        "bollingerBands": generate_bollinger_bands(candles),
        "rollingAverages": generate_rolling_averages(candles),
        "absorptionFlow": generate_absorption_flow(candles, rng),
        "histogram": generate_histogram(rng)
    }
    
    return data

def main():
    parser = argparse.ArgumentParser(description="Generate synthetic market data")
    parser.add_argument("--ticker", type=str, default="NIFTY", help="Ticker symbol")
    parser.add_argument("--output", type=str, default=None, help="Output file path")
    args = parser.parse_args()
    
    ticker = args.ticker.upper()
    data = generate_full_data(ticker)
    
    output_path = args.output or f"public/data/ticker/{ticker}.json"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)
    
    print(f"Generated synthetic data for {ticker} -> {output_path}")

if __name__ == "__main__":
    main()
