#!/usr/bin/env python3
"""
====================================================================
TRADYXA AZTRYX - COMPLETE PYTHON BACKEND PIPELINE
====================================================================
"""

from __future__ import annotations
import os
import json
import time
import math
import random
import logging
import argparse
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple

import numpy as np
import pandas as pd
from scipy import stats
import concurrent.futures
from tqdm import tqdm

# Import data manager
try:
    import data_manager
except ImportError:
    import sys
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    import data_manager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s"
)
log = logging.getLogger("tradyxa_pipeline")

# Output directories
DATA_DIR = os.path.join("public", "data", "ticker")
os.makedirs(DATA_DIR, exist_ok=True)

# Default parameters
NOTIONAL_SIZES = [100_000, 250_000, 500_000, 1_000_000]

# Ticker mapping for indexes
INDEX_TICKER_MAP = {
    "NIFTY": "^NSEI",
    "BANKNIFTY": "^NSEBANK"
}

def now_iso():
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"

def safe_mkdir(path: str):
    if not os.path.exists(path):
        os.makedirs(path, exist_ok=True)

def write_json_atomic(path: str, obj: Any):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf8") as f:
        json.dump(obj, f, indent=2, default=_json_default)
    os.replace(tmp, path)

def _json_default(o):
    if isinstance(o, (np.integer,)):
        return int(o)
    if isinstance(o, (np.floating,)):
        return float(o)
    if isinstance(o, (np.ndarray,)):
        return o.tolist()
    if isinstance(o, pd.Timestamp):
        return o.isoformat()
    raise TypeError(f"Type not serializable: {type(o)}")

def get_ticker_symbol(ticker: str) -> str:
    """Map friendly name to yfinance symbol"""
    if ticker in INDEX_TICKER_MAP:
        return INDEX_TICKER_MAP[ticker]
    if not ticker.endswith(".NS") and not ticker.startswith("^"):
        return f"{ticker}.NS"
    return ticker

def fetch_ohlcv(ticker: str) -> Optional[pd.DataFrame]:
    """Fetch OHLCV using data_manager (CSV cache + incremental update)"""
    yft = get_ticker_symbol(ticker)
    try:
        # Use data_manager to fetch/update
        df = data_manager.fetch_and_update_data(yft)
        if df.empty:
            log.warning(f"No data found for {ticker} ({yft})")
            return None
        return df
    except Exception as e:
        log.error(f"Error fetching data for {ticker}: {e}")
        return None

def synthetic_ohlcv(ticker: str, minutes: int = 78*30, 
                   seed: Optional[int] = None, 
                   start_price: float = 20000.0) -> pd.DataFrame:
    """Deterministic synthetic OHLCV generator"""
    if seed is None:
        seed = abs(hash(ticker)) % (2**32)
    rnd = np.random.RandomState(seed)

    interval_minutes = 5
    end = datetime.utcnow().replace(second=0, microsecond=0)
    periods = minutes
    idx = pd.date_range(end=end, periods=periods, freq=f"{interval_minutes}T")
    
    # Drift and volatility
    drift = rnd.normal(loc=0.00001, scale=0.0002, size=periods)
    vol = 0.0015
    shocks = rnd.normal(loc=0.0, scale=vol, size=periods)
    returns = drift + shocks
    prices = start_price * np.cumprod(1 + returns)
    
    # OHLC
    highs = prices * (1 + np.abs(rnd.normal(scale=0.0008, size=periods)))
    lows = prices * (1 - np.abs(rnd.normal(scale=0.0008, size=periods)))
    opens = np.concatenate([[prices[0]], prices[:-1]])
    closes = prices
    
    # Volume shape
    hours = np.array([ts.hour + ts.minute/60.0 for ts in idx])
    vol_profile = np.exp(-((hours - 13.0)**2) / (2 * 3.0**2))
    base_vol = 1_000_000
    volumes = (base_vol * vol_profile * (0.5 + rnd.rand(periods))).astype(int)
    
    df = pd.DataFrame({
        "Open": opens, "High": highs, "Low": lows, 
        "Close": closes, "Volume": volumes
    }, index=idx)
    
    return df

def compute_amihud_daily(df_ohlcv: pd.DataFrame) -> pd.Series:
    """Compute Amihud illiquidity"""
    close = df_ohlcv["Close"]
    ret = close.pct_change(fill_method=None).abs()
    dollar_vol = df_ohlcv["Close"] * df_ohlcv["Volume"]
    illiq = ret / (dollar_vol.replace(0, np.nan))
    illiq = illiq.fillna(0.0)
    return illiq

def rolling_lambda(df_ohlcv: pd.DataFrame, window: int = 20) -> pd.Series:
    """Rolling price-impact proxy lambda"""
    dp = df_ohlcv["Close"].diff().fillna(0.0)
    vol = df_ohlcv["Volume"].astype(float).fillna(0.0)
    lam = pd.Series(index=df_ohlcv.index, dtype=float)
    
    for i in range(len(df_ohlcv)):
        if i < window:
            lam.iloc[i] = 0.0
        else:
            dv = dp.iloc[i-window+1:i+1]
            vv = vol.iloc[i-window+1:i+1]
            vvar = vv.var()
            if vvar <= 0:
                lam.iloc[i] = 0.0
            else:
                lam.iloc[i] = np.cov(dv, vv, bias=True)[0,1] / vvar
    
    lam = lam.fillna(0.0)
    return lam

def compute_mfc(df_ohlcv: pd.DataFrame, window: int = 20) -> pd.Series:
    """Market Friction Coefficient"""
    dp = df_ohlcv["Close"].diff().abs().fillna(0.0)
    vol = df_ohlcv["Volume"].replace(0, np.nan).fillna(method='ffill').fillna(1.0)
    ratio = dp / vol
    mfc = ratio.rolling(window=window, min_periods=1).mean() * math.sqrt(window)
    return mfc.fillna(0.0)

def normalize_to_01(s: pd.Series) -> pd.Series:
    """Robust 0..1 normalization"""
    if s.empty:
        return s
    mn = s.min()
    mx = s.max()
    if mx - mn < 1e-12:
        return pd.Series(0.0, index=s.index)
    return (s - mn) / (mx - mn)

def compute_volume_zscore(df_ohlcv: pd.DataFrame, window: int = 20) -> pd.Series:
    vol = df_ohlcv["Volume"].astype(float)
    z = (vol - vol.rolling(window).mean()) / (vol.rolling(window).std().replace(0, np.nan))
    return z.fillna(0.0)

def compute_coordinated_flow(df_ohlcv: pd.DataFrame, window: int = 20) -> pd.Series:
    """Coordinated Flow Index"""
    ret = df_ohlcv["Close"].pct_change(fill_method=None).fillna(0.0)
    vol_z = compute_volume_zscore(df_ohlcv, window=window)
    signed = np.sign(ret) * vol_z
    cflow = pd.Series(signed).rolling(window=window, min_periods=1).mean()
    return cflow.fillna(0.0)

def compute_features_for_df(df_ohlcv: pd.DataFrame) -> pd.DataFrame:
    """Compute all required features"""
    df = df_ohlcv.copy()
    df["amihud"] = compute_amihud_daily(df)
    df["lambda"] = rolling_lambda(df, window=20)
    df["mfc"] = compute_mfc(df, window=20)
    df["vol_zscore"] = compute_volume_zscore(df, window=20)
    df["volatility"] = df["Close"].pct_change(fill_method=None).rolling(window=20, min_periods=1).std().fillna(0.0)
    df["coordinated_flow"] = compute_coordinated_flow(df, window=20)
    df["ret"] = df["Close"].pct_change(fill_method=None).fillna(0.0)
    df["hlc_ratio"] = ((df["High"] - df["Low"]) / df["Close"]).fillna(0.0)
    df["tod"] = df.index.hour + df.index.minute / 60.0  # time of day
    return df

def deterministic_slippage_simulation(df: pd.DataFrame, notional: float, 
                                     tick_size: float = 0.05) -> Dict[str, Any]:
    """Deterministic slippage simulation"""
    results = []
    dollar_vol = df["Close"] * df["Volume"]
    avg_dv = dollar_vol.replace(0, np.nan).dropna().mean()
    
    if pd.isna(avg_dv) or avg_dv <= 0:
        avg_dv = 1e6

    k = 0.8
    alpha = 0.9
    
    for idx, row in df.iterrows():
        iv_dv = float(row["Close"] * row["Volume"])
        if iv_dv <= 0:
            iv_dv = avg_dv
        
        rel = notional / max(iv_dv, 1.0)
        impact_pct = k * (rel ** alpha)
        
        vol = float(row.get("volatility", 0.001))
        noise = np.random.RandomState(int(abs(hash(str(idx))) % (2**32))).normal(scale=vol*0.5)
        impact_pct = max(0.0, impact_pct + noise)
        
        results.append(impact_pct)
    
    if len(results) == 0:
        results = [0.02] * 10
    
    arr = np.array(results)
    summary = {
        "median": float(np.median(arr)),
        "p90": float(np.percentile(arr, 90)),
        "p10": float(np.percentile(arr, 10)),
        "sample": arr.tolist(),
        "low_data": False if len(arr) >= 10 else True
    }
    
    if notional > 10 * avg_dv:
        summary["low_data"] = True
    
    return summary

def monte_carlo_slippage(df: pd.DataFrame, notional: float, 
                        n_sim: int = 400, 
                        alpha_dist: Tuple[float,float]=(0.05,0.6)) -> Dict[str,Any]:
    """Monte Carlo slippage simulation"""
    rnd = np.random.RandomState(abs(hash(str(notional))) % (2**32))
    N = len(df)
    dist = []
    
    if N == 0:
        dist = [0.02] * n_sim
    else:
        for i in range(n_sim):
            idx = rnd.randint(0, max(1, N-1))
            alpha = rnd.uniform(alpha_dist[0], alpha_dist[1])
            row = df.iloc[idx]
            iv_dv = float(row["Close"] * row["Volume"])
            
            if iv_dv <= 0:
                iv_dv = float(df["Close"].mean() * max(1, df["Volume"].mean()))
            
            exec_val = min(notional, alpha * iv_dv)
            k = 0.9
            alpha_pow = 0.9
            rel = exec_val / max(iv_dv, 1.0)
            impact_pct = k * (rel ** alpha_pow)
            
            noise = rnd.normal(scale=0.5 * row.get("volatility", 0.001))
            impact_pct = max(0.0, impact_pct + noise)
            dist.append(impact_pct)
    
    arr = np.array(dist)
    summary = {
        "median": float(np.median(arr)),
        "p90": float(np.percentile(arr,90)),
        "p10": float(np.percentile(arr,10)),
        "dist_sample": arr.tolist(),
        "low_data": False if len(arr) >= 50 else True
    }
    return summary

def compute_verdict(metrics: Dict[str,Any], features: pd.DataFrame, 
                   slippage_summary: Dict[str,Any]) -> Dict[str,Any]:
    """Conservative verdict aggregator with ML enhancement hooks"""
    params = {
        "wM": 0.45, "wF": 0.25, "wL": 0.15, "wC": 0.15,
        "flow_scale": 2.0, "base_pts_scale": 1.0, "confidence_alpha": 3.0
    }

    now = now_iso()
    
    try:
        # Momentum
        if features is None or features.empty or "Close" not in features.columns:
            recent_return = 0.0
            last_close = metrics.get("spot_price", 1000.0)
        else:
            closes = features["Close"].dropna()
            n = min(5, len(closes)-1) if len(closes) > 1 else 0
            recent_return = float((closes.iloc[-1] / closes.iloc[-1-n] - 1.0) if n>0 else 0.0)
            last_close = float(closes.iloc[-1])

        vol_proxy = metrics.get("volatility_latest", 0.001) or 0.001
        m_z = recent_return / (vol_proxy + 1e-9)
        M_norm = max(-1.0, min(1.0, m_z / 3.0))

        # Flow
        F_raw = metrics.get("coordinated_flow", 0.0) or 0.0
        F_norm = float(np.tanh(F_raw / params["flow_scale"]))

        # Liquidity
        mfc = float(metrics.get("mfc_latest", 0.5) or 0.5)
        ldp = float(metrics.get("liquidity_depth_proxy", 0.5) or 0.5)
        L_raw = (1.0 - mfc) * (1.0 - ldp)
        L_norm = float(max(-1.0, min(1.0, (L_raw*2.0)-1.0)))

        # Impact/cost
        slip_med = None
        try:
            slip_med = float(slippage_summary.get(str(NOTIONAL_SIZES[0]), {}).get("median", np.nan))
            if np.isnan(slip_med):
                slip_med = None
        except Exception:
            slip_med = None
        
        if slip_med is None:
            C_norm = 0.0
        else:
            scaled = slip_med * 100.0
            penal = 1.0 / (1.0 + math.exp(-((scaled - 0.5) * 4.0)))
            C_norm = - float(max(0.0, min(1.0, penal)))

        # ML enhancement hooks
        ml_regime_contrib = 0.0
        ml_slip_contrib = 0.0
        ml_enhanced = False
        
        if "ml_regime_label" in metrics:
            ml_enhanced = True
            regime_label = int(metrics.get("ml_regime_label", 1))
            # regime: 0=LOW, 1=NORMAL, 2=HIGH, 3=SEVERE
            # penalize higher regimes
            regime_penalty = {0: 0.1, 1: 0.0, 2: -0.15, 3: -0.25}
            ml_regime_contrib = regime_penalty.get(regime_label, 0.0)
        
        if "predicted_slippage_median" in slippage_summary.get(str(NOTIONAL_SIZES[0]), {}):
            ml_enhanced = True
            pred_slip = float(slippage_summary[str(NOTIONAL_SIZES[0])]["predicted_slippage_median"])
            # lower predicted slippage = positive contribution
            ml_slip_contrib = -pred_slip * 5.0  # scale factor

        # Composite score with ML
        S = (params["wM"] * M_norm + 
             params["wF"] * F_norm + 
             params["wL"] * L_norm + 
             params["wC"] * C_norm +
             0.1 * ml_regime_contrib +
             0.05 * ml_slip_contrib)

        vix = float(metrics.get("vix_latest", 12.0) or 12.0)
        vol_scale = max(0.2, min(3.0, vix / 20.0))

        realized_vol = float(metrics.get("volatility_latest", 0.005) or 0.005)
        approx_atr = last_close * realized_vol * 1.0
        base_pts_scale = max(1.0, approx_atr) * params["base_pts_scale"]

        points = float(np.sign(S) * abs(S) * base_pts_scale * vol_scale)

        strength_conf = 1.0 / (1.0 + math.exp(-abs(S) * params["confidence_alpha"]))
        
        # Data quality
        sample_arr = slippage_summary.get(str(NOTIONAL_SIZES[0]), {}).get("sample", [])
        count_slip = len(sample_arr) if hasattr(sample_arr, "__len__") else 0
        
        if count_slip >= 50:
            data_conf = 1.0
            dq = "GOOD"
        elif 10 <= count_slip < 50:
            data_conf = 0.7
            dq = "LOW"
        else:
            data_conf = 0.4
            dq = "INSUFFICIENT"

        comps = [M_norm, F_norm, L_norm, C_norm]
        agrees = sum(1 for c in comps if np.sign(c) == np.sign(S) or abs(S) < 1e-6)
        consistency_conf = float(agrees) / float(len(comps))

        confidence = float(max(0.0, min(1.0, strength_conf * data_conf * consistency_conf)))

        min_err = max(1.0, approx_atr * 0.5)
        if confidence > 0:
            error = float(max(min_err, abs(points) * (1.0 / (confidence + 1e-6) * 0.5)))
        else:
            error = float(max(2.0, abs(points) * 1.5))

        if abs(S) < 0.05:
            direction = "NEUTRAL"
        else:
            direction = "UP" if S > 0 else "DOWN"

        # Round points if low confidence
        if confidence < 0.4:
            points = round(points / 5) * 5  # nearest 5

        # Explanation text
        regime_text = ""
        if ml_enhanced and "ml_regime_label" in metrics:
            regime_map = {0: "LOW", 1: "NORMAL", 2: "HIGH", 3: "SEVERE"}
            regime_text = f" ML regime: {regime_map.get(metrics['ml_regime_label'], 'UNKNOWN')}."
        
        slippage_text = ""
        if "predicted_slippage_median" in slippage_summary.get(str(NOTIONAL_SIZES[0]), {}):
            pred = slippage_summary[str(NOTIONAL_SIZES[0])]["predicted_slippage_median"]
            slippage_text = f" Predicted slippage: {pred*100:.2f}%."

        verdict = {
            "timestamp": now_iso(),
            "direction": direction,
            "points": round(abs(points), 2),
            "error": round(error,2),
            "confidence": round(confidence, 2),
            "score": round(S, 4),
            "components": {
                "momentum": round(float(M_norm),4),
                "flow": round(float(F_norm),4),
                "liquidity": round(float(L_norm),4),
                "impact_cost": round(float(C_norm),4),
                "volatility_scale": round(float(vol_scale),4),
                "ml_regime_contribution": round(float(ml_regime_contrib),4),
                "ml_slippage_contribution": round(float(ml_slip_contrib),4)
            },
            "explanation": (
                f"Aggregated momentum + flow produce a "
                f"{'mild' if abs(S)<0.2 else 'moderate' if abs(S)<0.5 else 'strong'} "
                f"{direction.lower()} bias.{regime_text}{slippage_text} "
                f"Recommended: {'slice into 3 TWAPs' if confidence > 0.5 else 'reduce size and wait for better conditions'}."
            ),
            "data_quality": dq,
            "n_samples": {
                "slippage": count_slip,
                "monte": len(slippage_summary.get(str(NOTIONAL_SIZES[0]), {}).get("sample", [])),
                "features": len(features) if features is not None else 0
            },
            "ml_enhanced": ml_enhanced,
            "version": "verdict_v1",
            "params": {"weights": params}
        }
        
        return verdict
        
    except Exception as e:
        log.exception("Verdict computation error: %s", e)
        return {
            "timestamp": now_iso(),
            "direction": "NEUTRAL",
            "points": 0.0,
            "error": 0.0,
            "confidence": 0.0,
            "score": 0.0,
            "components": {},
            "explanation": "verdict computation error",
            "data_quality": "INSUFFICIENT",
            "n_samples": {"slippage": 0, "monte":0, "features":0},
            "ml_enhanced": False,
            "version": "verdict_v1",
            "params": {"weights": {}}
        }

def save_ticker_json(ticker: str, meta: Dict[str,Any], 
                    metrics: Dict[str,Any], features_head: pd.DataFrame):
    """Write ticker JSON"""
    safe_mkdir(DATA_DIR)
    features_count = min(500, len(features_head))
    fh = features_head.iloc[-features_count:].copy()
    
    features_dict = {
        ts.isoformat(): {
            "Open": float(row["Open"]), 
            "High": float(row["High"]), 
            "Low": float(row["Low"]),
            "Close": float(row["Close"]), 
            "Volume": int(row["Volume"]),
            "amihud": float(row.get("amihud", 0.0)),
            "lambda": float(row.get("lambda", 0.0)),
            "mfc": float(row.get("mfc", 0.0)),
            "vol_zscore": float(row.get("vol_zscore", 0.0)),
            "volatility": float(row.get("volatility", 0.0)),
            "ret": float(row.get("ret", 0.0)),
            "hlc_ratio": float(row.get("hlc_ratio", 0.0)),
            "tod": float(row.get("tod", 0.0))
        } for ts, row in fh.iterrows()
    }
    
    json_obj = {
        "meta": meta,
        "metrics": metrics,
        "features_head": features_dict
    }
    
    path = os.path.join(DATA_DIR, f"{ticker}.json")
    write_json_atomic(path, json_obj)
    log.info("Wrote ticker JSON: %s", path)

def write_slippage_files(ticker: str, slippage_map: Dict[int, Dict[str,Any]], 
                        monte_map: Dict[int, Dict[str,Any]]):
    safe_mkdir(DATA_DIR)
    
    path = os.path.join(DATA_DIR, f"{ticker}_slippage.json")
    write_json_atomic(path, slippage_map)
    
    path2 = os.path.join(DATA_DIR, f"{ticker}_monte_slippage.json")
    write_json_atomic(path2, monte_map)

def run_pipeline_for_ticker(ticker: str, use_yf: bool = True):
    """Complete end-to-end pipeline for a single ticker"""
    log.info("Starting pipeline for %s", ticker)
    
    # Fetch OHLCV
    df = None
    if use_yf:
        df = fetch_ohlcv(ticker)
    
    if df is None or df.empty:
        log.warning("Using synthetic data for %s", ticker)
        df = synthetic_ohlcv(ticker)
        data_source = "synthetic"
    else:
        data_source = "yfinance"
    
    # Feature Engineering
    df_features = compute_features_for_df(df)
    
    # Metrics
    last_row = df_features.iloc[-1]
    metrics = {
        "spot_price": float(last_row["Close"]),
        "vix_latest": 15.0, # Placeholder or fetch real VIX if available
        "amihud_latest": float(last_row.get("amihud", 0.0)),
        "lambda_latest": float(last_row.get("lambda", 0.0)),
        "mfc_latest": float(last_row.get("mfc", 0.0)),
        "vol_zscore_latest": float(last_row.get("vol_zscore", 0.0)),
        "volatility_latest": float(last_row.get("volatility", 0.0)),
        "liquidity_depth_proxy": float(normalize_to_01(df_features["lambda"]).iloc[-1]),
        "trade_sizing_multiplier": float(1.0 - normalize_to_01(df_features["mfc"]).iloc[-1]),
        "coordinated_flow": float(last_row.get("coordinated_flow", 0.0))
    }
    
    # Slippage Simulation
    slippage_map = {}
    monte_map = {}
    
    for size in NOTIONAL_SIZES:
        slippage_map[str(size)] = deterministic_slippage_simulation(df_features, size)
        monte_map[str(size)] = monte_carlo_slippage(df_features, size)
    
    # Verdict
    verdict = compute_verdict(metrics, df_features, slippage_map)
    metrics["verdict"] = verdict
    
    # Meta
    meta = {
        "ticker": ticker,
        "last_updated": now_iso(),
        "data_source": data_source
    }
    
    # Save
    save_ticker_json(ticker, meta, metrics, df_features)
    write_slippage_files(ticker, slippage_map, monte_map)

def batch_run(tickers_file: str, max_workers: int = 4):
    if not os.path.exists(tickers_file):
        log.error("Tickers file not found: %s", tickers_file)
        return
        
    with open(tickers_file, "r") as f:
        tickers = [line.strip() for line in f if line.strip()]
        
    log.info("Batch processing %d tickers with %d workers", len(tickers), max_workers)
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(run_pipeline_for_ticker, t): t for t in tickers}
        for future in tqdm(concurrent.futures.as_completed(futures), total=len(tickers)):
            t = futures[future]
            try:
                future.result()
            except Exception as e:
                log.error("Error processing %s: %s", t, e)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["run_all", "batch_run", "sample_data"], required=True)
    parser.add_argument("--ticker", help="Ticker symbol for run_all/sample_data")
    parser.add_argument("--tickers-file", help="Path to tickers file for batch_run")
    parser.add_argument("--max-workers", type=int, default=4)
    parser.add_argument("--use-yf", action="store_true", default=True)
    
    args = parser.parse_args()
    
    if args.mode == "run_all":
        if not args.ticker:
            print("Error: --ticker required for run_all")
        else:
            run_pipeline_for_ticker(args.ticker, args.use_yf)
            
    elif args.mode == "sample_data":
        if not args.ticker:
            print("Error: --ticker required for sample_data")
        else:
            run_pipeline_for_ticker(args.ticker, use_yf=False)
            
    elif args.mode == "batch_run":
        if not args.tickers_file:
            print("Error: --tickers-file required for batch_run")
        else:
            batch_run(args.tickers_file, args.max_workers)
