import os
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

DATA_DIR = os.path.join("public", "data", "raw")
os.makedirs(DATA_DIR, exist_ok=True)

def get_csv_path(ticker: str) -> str:
    # Sanitize ticker for filename
    safe_ticker = ticker.replace("^", "").replace(".", "_")
    return os.path.join(DATA_DIR, f"{safe_ticker}.csv")

def load_data(ticker: str) -> pd.DataFrame:
    """Load data from local CSV if exists, else return empty DataFrame."""
    csv_path = get_csv_path(ticker)
    if os.path.exists(csv_path):
        try:
            df = pd.read_csv(csv_path, index_col=0)
            # Ensure index is DatetimeIndex
            df.index = pd.to_datetime(df.index)
            return df
        except Exception as e:
            logger.error(f"Error reading CSV for {ticker}: {e}")
            return pd.DataFrame()
    return pd.DataFrame()

def save_data(ticker: str, df: pd.DataFrame):
    """Save DataFrame to local CSV."""
    csv_path = get_csv_path(ticker)
    df.to_csv(csv_path)
    logger.info(f"Saved data for {ticker} to {csv_path}")

def fetch_and_update_data(ticker: str, period: str = "5y", interval: str = "1d") -> pd.DataFrame:
    """
    Fetch data for ticker. 
    If CSV exists, fetch only new data since last date and append.
    If CSV doesn't exist, fetch full history (default 5y).
    """
    csv_path = get_csv_path(ticker)
    existing_df = load_data(ticker)
    
    if not existing_df.empty:
        last_date = existing_df.index[-1]
        # Ensure last_date is timezone-naive for comparison
        if hasattr(last_date, 'tzinfo') and last_date.tzinfo is not None:
            last_date = last_date.tz_convert(None)
            
        start_date = last_date + timedelta(days=1)
        if start_date >= datetime.now():
            logger.info(f"{ticker} is up to date (Last: {last_date.date()})")
            return existing_df
            
        logger.info(f"Fetching update for {ticker} from {start_date.date()}")
        try:
            new_df = yf.download(ticker, start=start_date, interval=interval, progress=False, threads=False)
            if not new_df.empty:
                # Handle MultiIndex columns from yfinance
                if isinstance(new_df.columns, pd.MultiIndex):
                    try:
                        if 'Close' in new_df.columns.get_level_values(0):
                            new_df.columns = new_df.columns.get_level_values(0)
                        elif 'Close' in new_df.columns.get_level_values(1):
                            new_df.columns = new_df.columns.get_level_values(1)
                    except Exception:
                        pass

                # Standardize columns
                required_cols = ["Open", "High", "Low", "Close", "Volume"]
                available_cols = [c for c in required_cols if c in new_df.columns]
                
                if len(available_cols) < 5:
                    return existing_df

                new_df = new_df[available_cols]
                if new_df.index.tz is not None:
                    new_df.index = new_df.index.tz_convert(None)
                
                # Combine and deduplicate
                combined_df = pd.concat([existing_df, new_df])
                combined_df = combined_df[~combined_df.index.duplicated(keep='last')]
                combined_df.sort_index(inplace=True)
                save_data(ticker, combined_df)
                return combined_df
        except Exception as e:
            logger.error(f"Failed to update {ticker}: {e}")
            return existing_df
    
    # Full fetch if no data or update failed/empty
    logger.info(f"Fetching full history ({period}) for {ticker}")
    try:
        df = yf.download(ticker, period=period, interval=interval, progress=False, threads=False)
        if not df.empty:
            # Handle MultiIndex columns from yfinance
            if isinstance(df.columns, pd.MultiIndex):
                try:
                    # Try to get the level that contains OHLCV
                    if 'Close' in df.columns.get_level_values(0):
                        df.columns = df.columns.get_level_values(0)
                    elif 'Close' in df.columns.get_level_values(1):
                        df.columns = df.columns.get_level_values(1)
                except Exception:
                    pass

            # Ensure columns exist
            required_cols = ["Open", "High", "Low", "Close", "Volume"]
            available_cols = [c for c in required_cols if c in df.columns]
            
            if len(available_cols) < 5:
                logger.warning(f"Missing columns for {ticker}: {df.columns}")
                return existing_df
                
            df = df[available_cols]
            if df.index.tz is not None:
                df.index = df.index.tz_convert(None)
            save_data(ticker, df)
            return df
    except Exception as e:
        logger.error(f"Failed to fetch initial data for {ticker}: {e}")
    
    return existing_df

if __name__ == "__main__":
    # Test with NIFTY
    fetch_and_update_data("^NSEI")
