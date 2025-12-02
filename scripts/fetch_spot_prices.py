"""
Lightweight script to fetch ONLY current spot prices and India VIX.
This runs every 30 minutes during market hours for real-time dashboard updates.
Does NOT update historical CSV files.
"""
import yfinance as yf
import json
import os
from datetime import datetime

def get_spot_price(ticker: str) -> dict:
    """Fetch current spot price for a ticker."""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        
        # Get current price (try multiple fields as yfinance can be inconsistent)
        current_price = (
            info.get('currentPrice') or 
            info.get('regularMarketPrice') or 
            info.get('previousClose') or 
            0.0
        )
        
        # Get change percentage
        change_pct = info.get('regularMarketChangePercent', 0.0)
        
        return {
            "ticker": ticker,
            "spot_price": round(current_price, 2),
            "change_percent": round(change_pct, 2),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error fetching {ticker}: {e}")
        return {
            "ticker": ticker,
            "spot_price": 0.0,
            "change_percent": 0.0,
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }

def get_india_vix() -> dict:
    """Fetch India VIX (volatility index)."""
    try:
        vix = yf.Ticker("^INDIAVIX")
        info = vix.info
        current_vix = info.get('regularMarketPrice', 15.0)  # Default to 15 if not available
        
        return {
            "vix": round(current_vix, 2),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error fetching India VIX: {e}")
        return {
            "vix": 15.0,
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }

def fetch_all_spot_prices(tickers_file: str = "scripts/nifty500.txt"):
    """Fetch spot prices for all tickers and India VIX."""
    print("Fetching live spot prices...")
    
    # Read tickers
    if os.path.exists(tickers_file):
        with open(tickers_file, 'r') as f:
            tickers = [line.strip() for line in f if line.strip()]
    else:
        tickers = ["^NSEI", "^NSEBANK"]  # Fallback to indices only
    
    # Fetch India VIX
    vix_data = get_india_vix()
    
    # Fetch spot prices for all tickers
    spot_prices = {}
    for ticker in tickers:
        print(f"Fetching {ticker}...")
        spot_prices[ticker] = get_spot_price(ticker)
    
    # Combine data
    live_data = {
        "last_updated": datetime.now().isoformat(),
        "india_vix": vix_data,
        "spot_prices": spot_prices
    }
    
    # Save to JSON
    output_dir = "public/data/live"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "spot_prices.json")
    
    with open(output_path, 'w') as f:
        json.dump(live_data, f, indent=2)
    
    print(f"✅ Saved live spot prices to {output_path}")
    print(f"   India VIX: {vix_data['vix']}")
    print(f"   Updated {len(spot_prices)} tickers")

if __name__ == "__main__":
    fetch_all_spot_prices()
