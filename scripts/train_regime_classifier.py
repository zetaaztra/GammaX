#!/usr/bin/env python3
"""
train_regime_classifier.py

Train RandomForest Execution-Regime Classifier
Produces: models/rf_execution_regime.joblib

Regime Labels:
- 0: LOW (very low slippage risk)
- 1: NORMAL (typical conditions)
- 2: HIGH (elevated slippage risk)
- 3: SEVERE (extreme slippage risk)

Usage:
    python scripts/train_regime_classifier.py
"""

import pandas as pd
import numpy as np
import joblib
import json
import os
import glob
import logging
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix
import warnings

warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)

# Feature set
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
    """
    Load dataset from all ticker JSONs.
    Creates pseudo-labels from historical slippage simulations.
    """
    rows = []
    data_dir = os.path.join("public", "data", "ticker")
    
    if not os.path.exists(data_dir):
        log.error("Data directory not found: %s", data_dir)
        log.error("Run tradyxa_pipeline.py first to generate data")
        return pd.DataFrame()
    
    json_files = glob.glob(os.path.join(data_dir, "*.json"))
    log.info("Found %d JSON files", len(json_files))
    
    for fp in json_files:
        if "_slippage" in fp or "_monte" in fp:
            continue
            
        try:
            with open(fp, 'r', encoding='utf8') as f:
                data = json.load(f)
            
            ticker = data.get("meta", {}).get("ticker", "UNKNOWN")
            features = data.get("features_head", {})
            
            if not features:
                continue
            
            # Get slippage data for labeling (from separate file or embedded if modified pipeline)
            # The pipeline I wrote saves slippage in separate files, but also computes it.
            # Let's check if slippage is in the main JSON. 
            # In my pipeline implementation, I didn't embed full slippage stats in the main JSON metrics, 
            # but I did write separate files.
            # However, the prompt's pipeline description implies it might be there or we should read the separate file.
            # Let's try to read the separate slippage file.
            
            slippage_path = fp.replace(".json", "_slippage.json")
            if os.path.exists(slippage_path):
                with open(slippage_path, 'r') as f:
                    slippage_map = json.load(f)
                    slippage_data = slippage_map.get("100000")
            else:
                # Fallback if embedded (as per prompt schema)
                slippage_data = data.get("slippage", {}).get("100000")

            if not slippage_data:
                continue
            
            median_slip = slippage_data.get("median", 0.02)
            p90_slip = slippage_data.get("p90", 0.07)
            
            # Create regime label based on p90 slippage
            if p90_slip < 0.03:
                regime = 0  # LOW
            elif p90_slip < 0.07:
                regime = 1  # NORMAL
            elif p90_slip < 0.15:
                regime = 2  # HIGH
            else:
                regime = 3  # SEVERE
            
            # Extract features from each timestamp
            for ts, row in features.items():
                if "amihud" not in row:
                    continue
                
                feature_row = {f: row.get(f, np.nan) for f in FEATURES}
                feature_row["label"] = regime
                feature_row["ticker"] = ticker
                rows.append(feature_row)
        
        except Exception as e:
            log.warning("Error processing %s: %s", fp, e)
            continue
    
    log.info("Extracted %d feature rows", len(rows))
    df = pd.DataFrame(rows)
    
    # Clean data
    df = df.replace([np.inf, -np.inf], np.nan)
    initial_size = len(df)
    df = df.dropna(subset=FEATURES)
    log.info("Dropped %d rows with NaN, kept %d", initial_size - len(df), len(df))
    
    return df

def train_model(df: pd.DataFrame):
    """Train RandomForest classifier"""
    if df.empty:
        log.error("Dataset is empty. Cannot train.")
        return
    
    log.info("Dataset shape: %s", df.shape)
    log.info("Class distribution:\n%s", df["label"].value_counts().sort_index())
    
    X = df[FEATURES]
    y = df["label"]
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    log.info("Train size: %d, Test size: %d", len(X_train), len(X_test))
    
    # Train RandomForest
    log.info("Training RandomForest classifier...")
    model = RandomForestClassifier(
        n_estimators=100, # Reduced for speed in this env
        max_depth=10,
        min_samples_split=10,
        min_samples_leaf=5,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    
    # Test set evaluation
    y_pred = model.predict(X_test)
    accuracy = (y_pred == y_test).mean()
    log.info("Test Accuracy: %.4f", accuracy)
    
    # Save model
    os.makedirs("models", exist_ok=True)
    model_path = "models/rf_execution_regime.joblib"
    joblib.dump(model, model_path, compress=3)
    log.info("Model saved to: %s", model_path)
    
    # Save metadata
    metadata = {
        "features": FEATURES,
        "regime_labels": {0: "LOW", 1: "NORMAL", 2: "HIGH", 3: "SEVERE"},
        "test_accuracy": float(accuracy),
        "n_train": len(X_train),
        "n_test": len(X_test)
    }
    
    meta_path = "models/rf_execution_regime_metadata.json"
    with open(meta_path, 'w', encoding='utf8') as f:
        json.dump(metadata, f, indent=2)
    log.info("Metadata saved to: %s", meta_path)

def main():
    log.info("=" * 60)
    log.info("TRAINING RANDOMFOREST EXECUTION-REGIME CLASSIFIER")
    log.info("=" * 60)
    
    df = load_dataset()
    
    if df.empty:
        log.error("No data loaded. Exiting.")
        return
    
    train_model(df)
    
    log.info("=" * 60)
    log.info("TRAINING COMPLETE")
    log.info("=" * 60)

if __name__ == "__main__":
    main()
