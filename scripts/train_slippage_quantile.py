#!/usr/bin/env python3
"""
train_slippage_quantile.py

Train Quantile Regression Models for Slippage Forecasting
Produces: 
- models/qr_slippage_q50.joblib (Median)
- models/qr_slippage_q90.joblib (Tail Risk)

Usage:
    python scripts/train_slippage_quantile.py
"""

import pandas as pd
import numpy as np
import joblib
import json
import os
import glob
import logging
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)

FEATURES = [
    "amihud",
    "lambda",
    "mfc",
    "vol_zscore",
    "volatility",
    "Volume",
    "ret",
    "hlc_ratio",
    "tod",
]

def load_dataset():
    rows = []
    data_dir = os.path.join("public", "data", "ticker")
    
    if not os.path.exists(data_dir):
        return pd.DataFrame()
    
    json_files = glob.glob(os.path.join(data_dir, "*.json"))
    
    for fp in json_files:
        if "_slippage" in fp or "_monte" in fp:
            continue
            
        try:
            with open(fp, 'r', encoding='utf8') as f:
                data = json.load(f)
            
            features = data.get("features_head", {})
            if not features:
                continue
            
            # Get slippage target (we need per-sample slippage, but we only have summary stats in JSON)
            # Ideally we would have historical execution logs. 
            # Since we are training on *simulated* data, we can use the summary stats as a proxy 
            # OR we should have saved the simulation results per row.
            # The current pipeline computes slippage on the *entire* dataframe and gives one summary.
            # This is a limitation. We will use the summary median/p90 as the target for ALL rows of that ticker.
            # This is "weak supervision" but fits the pipeline structure.
            
            slippage_path = fp.replace(".json", "_slippage.json")
            if os.path.exists(slippage_path):
                with open(slippage_path, 'r') as f:
                    slippage_map = json.load(f)
                    slippage_data = slippage_map.get("100000")
            else:
                slippage_data = data.get("slippage", {}).get("100000")

            if not slippage_data:
                continue
            
            target_median = slippage_data.get("median")
            target_p90 = slippage_data.get("p90")
            
            for ts, row in features.items():
                if "amihud" not in row:
                    continue
                
                feature_row = {f: row.get(f, np.nan) for f in FEATURES}
                feature_row["target_median"] = target_median
                feature_row["target_p90"] = target_p90
                rows.append(feature_row)
        
        except Exception:
            continue
    
    df = pd.DataFrame(rows)
    df = df.replace([np.inf, -np.inf], np.nan).dropna()
    return df

def train_models(df: pd.DataFrame):
    if df.empty:
        log.error("Dataset is empty.")
        return
    
    X = df[FEATURES]
    y_median = df["target_median"]
    y_p90 = df["target_p90"]
    
    X_train, X_test, y_med_train, y_med_test = train_test_split(X, y_median, test_size=0.2, random_state=42)
    _, _, y_p90_train, y_p90_test = train_test_split(X, y_p90, test_size=0.2, random_state=42)
    
    os.makedirs("models", exist_ok=True)
    
    # Train Q50
    log.info("Training Q50 (Median) Model...")
    q50_model = GradientBoostingRegressor(loss='quantile', alpha=0.5, n_estimators=100, max_depth=5, random_state=42)
    q50_model.fit(X_train, y_med_train)
    mae_med = mean_absolute_error(y_med_test, q50_model.predict(X_test))
    log.info(f"Q50 MAE: {mae_med:.6f}")
    joblib.dump(q50_model, "models/qr_slippage_q50.joblib")
    
    # Train Q90
    log.info("Training Q90 (Tail) Model...")
    q90_model = GradientBoostingRegressor(loss='quantile', alpha=0.9, n_estimators=100, max_depth=5, random_state=42)
    q90_model.fit(X_train, y_p90_train)
    mae_p90 = mean_absolute_error(y_p90_test, q90_model.predict(X_test))
    log.info(f"Q90 MAE: {mae_p90:.6f}")
    joblib.dump(q90_model, "models/qr_slippage_q90.joblib")

if __name__ == "__main__":
    df = load_dataset()
    train_models(df)
