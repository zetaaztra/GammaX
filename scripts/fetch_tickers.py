import requests
import pandas as pd
from io import StringIO
import os

def get_nifty_symbols():
    print("Fetching Nifty 500 symbols...")
    sources = [
        "https://www.niftyindices.com/IndexConstituent/ind_nifty500list.csv",
        "https://archives.nseindia.com/content/indices/ind_nifty500list.csv",
    ]
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    }
    
    symbols = []
    for url in sources:
        try:
            print(f"Fetching from: {url}")
            response = requests.get(url, headers=headers, timeout=20)
            if response.status_code == 200:
                df = pd.read_csv(StringIO(response.text))
                if 'Symbol' in df.columns:
                    symbols = [f"{s.strip()}.NS" for s in df['Symbol'] if pd.notna(s)]
                    print(f"Successfully fetched {len(symbols)} symbols.")
                    break
        except Exception as e:
            print(f"Failed to fetch from {url}: {e}")
            continue
    
    if not symbols:
        print("Using fallback list...")
        # Fallback list (truncated for brevity, but better than nothing)
        symbols = [
            "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "ICICIBANK.NS", "INFY.NS",
            "HINDUNILVR.NS", "ITC.NS", "SBIN.NS", "BHARTIARTL.NS", "KOTAKBANK.NS",
            "BAJFINANCE.NS", "LICI.NS", "LT.NS", "HCLTECH.NS", "ASIANPAINT.NS",
            "AXISBANK.NS", "MARUTI.NS", "TITAN.NS", "SUNPHARMA.NS", "WIPRO.NS",
            "ULTRACEMCO.NS", "TECHM.NS", "NESTLEIND.NS", "TATAMOTORS.NS", "NTPC.NS",
            "POWERGRID.NS", "ONGC.NS", "COALINDIA.NS", "JSWSTEEL.NS", "TATASTEEL.NS",
            "HINDALCO.NS", "BPCL.NS", "IOC.NS", "GRASIM.NS", "ADANIENT.NS",
            "ADANIPORTS.NS", "DRREDDY.NS", "CIPLA.NS", "DIVISLAB.NS", "APOLLOHOSP.NS",
            "EICHERMOT.NS", "BAJAJ-AUTO.NS", "HEROMOTOCO.NS", "M&M.NS", "TATACONSUM.NS",
            "BRITANNIA.NS", "GODREJCP.NS", "DABUR.NS", "MARICO.NS", "INDUSINDBK.NS"
        ]
    
    # Add Indices
    indices = ["^NSEI", "^NSEBANK"]
    all_tickers = indices + symbols
    
    # Remove duplicates
    all_tickers = list(dict.fromkeys(all_tickers))
    
    return all_tickers

def save_tickers(tickers, filename="scripts/nifty500.txt"):
    with open(filename, "w") as f:
        for t in tickers:
            f.write(f"{t}\n")
    print(f"Saved {len(tickers)} tickers to {filename}")

if __name__ == "__main__":
    tickers = get_nifty_symbols()
    save_tickers(tickers)
