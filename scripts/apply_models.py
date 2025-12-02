#!/usr/bin/env python3
"""
apply_models.py

Apply trained ML models to all ticker JSONs.
Updates JSONs with:
- ml_regime_label
- ml_regime_prob
- predicted_median (slippage)
- predicted_p90 (slippage)
"""

import os
import json
import glob
import joblib
import pandas as pd
import numpy as np
import logging

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)

FEATURES = [
    "amihud", "lambda", "mfc", "vol_zscore", "volatility", 
    "Volume", "ret", "hlc_ratio", "tod"
]

def load_models():
    models = {}
    try:
        models["regime"] = joblib.load("models/rf_execution_regime.joblib")
    except:
        log.warning("Regime model not found")
        
    try:
        models["q50"] = joblib.load("models/qr_slippage_q50.joblib")
        models["q90"] = joblib.load("models/qr_slippage_q90.joblib")
    except:
        log.warning("Slippage models not found")
        
    return models

def apply_predictions():
    models = load_models()
    if not models:
        log.error("No models loaded")
        return

    data_dir = os.path.join("public", "data", "ticker")
    json_files = glob.glob(os.path.join(data_dir, "*.json"))
    
    for fp in json_files:
        if "_slippage" in fp or "_monte" in fp:
            continue
            
        try:
            with open(fp, 'r', encoding='utf8') as f:
                data = json.load(f)
            
            features_dict = data.get("features_head", {})
            if not features_dict:
                continue
                
            # Use the latest feature row for prediction
            timestamps = sorted(features_dict.keys())
            last_ts = timestamps[-1]
            last_row = features_dict[last_ts]
            
            # Prepare input vector
            input_data = {f: last_row.get(f, 0.0) for f in FEATURES}
            X = pd.DataFrame([input_data])
            X = X.replace([np.inf, -np.inf], 0.0).fillna(0.0)
            
            # Apply Regime Model
            if "regime" in models:
                label = models["regime"].predict(X)[0]
                probs = models["regime"].predict_proba(X)[0].tolist()
                
                data["metrics"]["ml_regime_label"] = int(label)
                data["metrics"]["ml_regime_prob"] = probs
            
            # Apply Slippage Models
            if "q50" in models and "q90" in models:
                pred_med = models["q50"].predict(X)[0]
                pred_p90 = models["q90"].predict(X)[0]
                
                # Update slippage section
                # Note: This updates the 100k slice as default
                if "slippage" not in data:
                    data["slippage"] = {}
                if "100000" not in data["slippage"]:
                    data["slippage"]["100000"] = {}
                    
                data["slippage"]["100000"]["predicted_median"] = float(pred_med)
                data["slippage"]["100000"]["predicted_p90"] = float(pred_p90)
                
                # Also update verdict if present
                if "verdict" in data["metrics"]:
                    # Re-inject ML info into verdict explanation if needed
                    # (This is handled by tradyxa_pipeline.compute_verdict usually, 
                    # but we can patch it here if we want to update without re-running pipeline)
                    pass

            # Save updated JSON
            tmp = fp + ".tmp"
            with open(tmp, 'w', encoding='utf8') as f:
                json.dump(data, f, indent=2)
            os.replace(tmp, fp)
            log.info(f"Updated {os.path.basename(fp)}")
            
        except Exception as e:
            log.error(f"Error updating {fp}: {e}")

if __name__ == "__main__":
    apply_predictions()
