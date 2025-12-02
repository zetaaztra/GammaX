# Tradyxa Aztryx - ML Training & Data Flow Architecture

## Overview

The system uses **BULK/GLOBAL training** (one model for all stocks) rather than individual per-stock models.

---

## Complete Data Flow Diagram

```mermaid
flowchart TB
    subgraph Data["📊 DATA COLLECTION (Individual - 503 Stocks)"]
        A1[NIFTY 50] --> B1[Fetch 5 Years OHLCV]
        A2[BANKNIFTY] --> B2[Fetch 5 Years OHLCV]
        A3[NIFTY 500<br/>Individual Stocks] --> B3[Fetch 5 Years OHLCV]
        
        B1 --> C1[CSV: NSEI.csv]
        B2 --> C2[CSV: NSEBANK.csv]
        B3 --> C3[CSV: 500+ individual<br/>stock files]
        
        C1 --> D[Feature Engineering]
        C2 --> D
        C3 --> D
        
        D --> E1[JSON: ^NSEI.json<br/>with features]
        D --> E2[JSON: ^NSEBANK.json<br/>with features]
        D --> E3[JSON: 500+ individual<br/>stock JSONs with features]
    end
    
    subgraph Training["🧠 ML TRAINING (BULK - Single Global Model)"]
        E1 --> F[Combine ALL<br/>503 JSONs]
        E2 --> F
        E3 --> F
        
        F --> G[Extract ~230k rows<br/>of feature data<br/>from all stocks]
        
        G --> H1[Train Regime<br/>Classifier Model<br/>RandomForest]
        G --> H2[Train Slippage<br/>Q50 Model<br/>GradientBoosting]
        G --> H3[Train Slippage<br/>Q90 Model<br/>GradientBoosting]
        
        H1 --> I1[Save:<br/>rf_execution_regime.joblib]
        H2 --> I2[Save:<br/>qr_slippage_q50.joblib]
        H3 --> I3[Save:<br/>qr_slippage_q90.joblib]
    end
    
    subgraph Inference["🔮 MODEL APPLICATION (Individual - 503 Stocks)"]
        I1 --> J[Load Global Models]
        I2 --> J
        I3 --> J
        
        E1 --> K1[Read latest features<br/>for ^NSEI]
        E2 --> K2[Read latest features<br/>for ^NSEBANK]
        E3 --> K3[Read latest features<br/>for each stock]
        
        K1 --> L1[Apply Models to<br/>^NSEI features]
        K2 --> L2[Apply Models to<br/>^NSEBANK features]
        K3 --> L3[Apply Models to<br/>each stock's features]
        
        J --> L1
        J --> L2
        J --> L3
        
        L1 --> M1[Update ^NSEI.json<br/>with predictions]
        L2 --> M2[Update ^NSEBANK.json<br/>with predictions]
        L3 --> M3[Update 500+ JSONs<br/>with predictions]
    end
    
    subgraph Dashboard["🎯 DASHBOARD (Frontend)"]
        M1 --> N[React Dashboard]
        M2 --> N
        M3 --> N
        
        N --> O1[Display Ticker<br/>Selector]
        N --> O2[Show Predictions<br/>& Metrics]
        N --> O3[Render Verdict<br/>& Guidance]
    end
    
    style Data fill:#e1f5ff
    style Training fill:#fff3e0
    style Inference fill:#f3e5f5
    style Dashboard fill:#e8f5e9
```

---

## Key Points

### 1. **Data Collection: INDIVIDUAL** ✅
- Each of the 503 stocks is processed separately
- 5 years of OHLCV data fetched per stock
- Features computed individually for each stock
- Stored in separate JSON files

### 2. **ML Training: BULK/GLOBAL** ✅
- **All 503 stocks' data is COMBINED**
- Creates one large dataset (~230,000 rows from all stocks)
- Trains **3 global models** that learn patterns across *all* stocks:
  - 1 Regime Classifier
  - 2 Slippage models (Q50 & Q90)
- These models understand market behavior from ALL stocks collectively

### 3. **Model Application: INDIVIDUAL** ✅
- The trained global models are applied to **each stock separately**
- Each stock gets predictions based on its own latest features
- Updates happen to individual JSON files

### 4. **Dashboard: USER SELECTION** ✅
- Frontend reads individual stock JSONs
- User selects which ticker to view
- Dashboard displays predictions for that specific stock

---

## Why Global Models?

1. **Market patterns are universal**: Slippage and regime behaviors are similar across stocks
2. **Better generalization**: Learning from 500+ stocks makes models more robust
3. **Efficiency**: 3 models instead of 1,509 models (3 per stock × 503)
4. **Shared knowledge**: Low-volume stocks benefit from patterns in high-volume stocks

---

## Training vs Inference Timeline

| Stage | Frequency | Scope |
|-------|-----------|-------|
| Data Collection | Daily | Individual (503 stocks) |
| ML Training | Weekly | Bulk (all stocks combined) |
| Model Application | Daily (after training) | Individual (503 stocks) |
| Dashboard Display | Real-time | Per user selection |
