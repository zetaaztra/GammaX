# 📊 Tradyxa Aztryx - Complete Architecture Guide

> AI-powered trading intelligence platform for Indian stock market analysis (Nifty 50, BankNifty, Nifty 500) with real-time ML predictions and execution guidance.

---

## 🏗️ System Architecture Overview

```mermaid
graph TB
    subgraph DataSources["📈 Data Sources"]
        YAHOO["Yahoo Finance API"]
        CSV["Local CSV Cache"]
        SYNTHETIC["Synthetic Generator"]
    end
    
    subgraph PythonBackend["🐍 Python Backend Pipeline"]
        FETCH["1. Fetch Raw Data<br/>from 500+ stocks"]
        CLEAN["2. Data Cleaning<br/>Normalize OHLCV"]
        FEATURES["3. Feature Engineering<br/>TA, Returns, Vol"]
        TRAIN["4. Train ML Models<br/>Bollinger, MA, Slippage"]
        PREDICT["5. Generate Predictions<br/>Verdict, Confidence"]
        EXPORT["6. Export JSON<br/>to public/data/"]
    end
    
    subgraph NodeBackend["🟢 Node.js Server"]
        EXPRESS["Express Server<br/>Port 5000"]
        CACHE["In-Memory Cache<br/>1min TTL"]
        ROUTES["API Routes<br/>/api/ticker/"]
    end
    
    subgraph Frontend["⚛️ React Dashboard"]
        DASHBOARD["Dashboard.tsx<br/>Main Layout"]
        TILES["12 Analysis Tiles<br/>+ Verdict"]
        MODALS["Modals<br/>Explain/Inspector"]
    end
    
    subgraph Browser["🌐 User Browser"]
        UI["Interactive UI<br/>Real-time Updates"]
    end
    
    DataSources --> PythonBackend
    PythonBackend --> EXPORT
    EXPORT --> NodeBackend
    NodeBackend --> Frontend
    Frontend --> Browser
    NodeBackend -.->|Fallback| SYNTHETIC
    
    style DataSources fill:#1e40af
    style PythonBackend fill:#7c2d12
    style NodeBackend fill:#15803d
    style Frontend fill:#4c1d95
    style Browser fill:#0c4a6e
```

---

## 📥 **Phase 1: Data Collection - From 500+ Stocks**

### 🔄 Data Fetching Pipeline

```mermaid
graph LR
    subgraph Input["INPUT"]
        NIFTY500["Nifty 500<br/>500 Stocks"]
    end
    
    subgraph Fetch["FETCH"]
        YAHOO_API["Yahoo Finance<br/>API Calls"]
        CACHE_CHECK["Check Local<br/>CSV Cache"]
        INCREMENTAL["Fetch Only<br/>New Data"]
    end
    
    subgraph Storage["STORAGE"]
        CSV_FILES["public/data/raw/<br/>*.csv Files<br/>500 Files"]
    end
    
    Input --> Fetch
    Fetch --> CACHE_CHECK
    CACHE_CHECK --> INCREMENTAL
    INCREMENTAL --> Storage
    
    style Input fill:#1e40af
    style Fetch fill:#f59e0b
    style Storage fill:#10b981
```

**How it works:**
1. **Load list** of 500 Nifty stocks from `scripts/nifty500.txt`
2. **Check cache** - if stock data exists in `public/data/raw/*.csv`, load it
3. **Incremental fetch** - only download data since last update (saves 90% bandwidth)
4. **Save to CSV** - store 5 years of OHLCV data locally

**Code location:** `scripts/data_manager.py` → `fetch_and_update_data()`

---

## 🧠 **Phase 2: Feature Engineering & Model Training**

### 📊 Feature Calculation Process

```mermaid
graph TB
    subgraph RawData["RAW DATA"]
        OHLCV["OHLCV<br/>Open, High, Low<br/>Close, Volume"]
    end
    
    subgraph Features["FEATURE ENGINEERING"]
        TA["Technical Analysis<br/>• Bollinger Bands<br/>• Moving Averages<br/>• RSI, MACD"]
        RETURNS["Return Metrics<br/>• Daily Returns<br/>• Log Returns<br/>• Volatility"]
        ABSORPTION["Order Flow<br/>• Buy/Sell Volume<br/>• Flow Ratio<br/>• Net Flow"]
        SLIPPAGE["Slippage Metrics<br/>• Price Impact<br/>• Execution Cost<br/>• Liquidity"]
    end
    
    subgraph Models["ML MODEL TRAINING"]
        BOLLINGER["Bollinger Bands<br/>Model"]
        SLIPPAGE_Q["Quantile Regression<br/>Slippage Q50/Q90"]
        EXECUTION["Execution Regime<br/>Classifier"]
        ROLLING_MA["Rolling Averages<br/>Trend Detection"]
    end
    
    RawData --> TA
    RawData --> RETURNS
    RawData --> ABSORPTION
    RawData --> SLIPPAGE
    
    TA --> BOLLINGER
    RETURNS --> SLIPPAGE_Q
    SLIPPAGE --> SLIPPAGE_Q
    ABSORPTION --> EXECUTION
    RETURNS --> ROLLING_MA
    
    style RawData fill:#3b82f6
    style Features fill:#8b5cf6
    style Models fill:#ec4899
```

**Features Generated Per Stock:**
- **Technical**: Bollinger Bands (upper/lower/middle), 5/20/50-day MAs
- **Returns**: Daily, log returns, rolling volatility
- **Volume**: Buy volume, sell volume, total volume
- **Slippage**: Expected cost, liquidity measures

**Models Trained:**
1. `rf_execution_regime.joblib` - Random Forest for market regime (bullish/bearish/neutral)
2. `qr_slippage_q50.joblib` - Quantile Regression for median slippage
3. `qr_slippage_q90.joblib` - Quantile Regression for 90th percentile slippage

---

## 🔮 **Phase 3: Prediction & Verdict Generation**

### 🎯 Verdict Calculation Engine

```mermaid
graph TB
    subgraph Input["INPUT"]
        TICKER["Select Ticker<br/>e.g., NIFTY"]
        MODELS["Load ML Models<br/>from models/"]
        FEATURES["Current Features<br/>for Ticker"]
    end
    
    subgraph Processing["PROCESSING"]
        EXEC_REGIME["1. Predict Execution<br/>Regime<br/>BULLISH|BEARISH|NEUTRAL"]
        SLIPPAGE_PRED["2. Predict Slippage<br/>Q50 & Q90<br/>Median & High"]
        COMBINE["3. Combine Signals<br/>Weight Contributions"]
        CONFIDENCE["4. Calculate<br/>Confidence Score"]
        POINTS["5. Calculate<br/>Expected Points<br/>+ Error Bounds"]
    end
    
    subgraph Output["OUTPUT"]
        VERDICT["VERDICT<br/>Direction + Points<br/>Confidence %<br/>Components"]
    end
    
    Input --> EXEC_REGIME
    Input --> SLIPPAGE_PRED
    EXEC_REGIME --> COMBINE
    SLIPPAGE_PRED --> COMBINE
    COMBINE --> CONFIDENCE
    CONFIDENCE --> POINTS
    POINTS --> Output
    
    style Input fill:#06b6d4
    style Processing fill:#f97316
    style Output fill:#22c55e
```

**Verdict Contains:**
- **Direction**: BULLISH (+), BEARISH (-), NEUTRAL (→)
- **Points**: Expected price movement with ±error margin
- **Confidence**: 0-100% based on signal alignment
- **Components**: Which indicators voted UP/DOWN (waterfall view)
- **Multiplier**: Trade sizing (0.25 = invest 25% of capital)

---

## 🚀 **Phase 4: Data Export & API Serving**

### 📤 JSON Export Structure

```mermaid
graph LR
    subgraph Generate["GENERATE"]
        PRED["Generate<br/>Predictions"]
        FORMAT["Format as<br/>JSON"]
    end
    
    subgraph Export["EXPORT"]
        METRICS["metrics.json<br/>Verdict, Points,<br/>Confidence"]
        FULL_DATA["full.json<br/>12 Tiles Data<br/>Charts, Orderbook<br/>Heatmap, etc"]
    end
    
    subgraph Location["LOCATION"]
        PATH["public/data/ticker/<br/>NIFTY.json<br/>BANKNIFTY.json<br/>500 Stock.json<br/>..."]
    end
    
    Generate --> FORMAT
    FORMAT --> METRICS
    FORMAT --> FULL_DATA
    METRICS --> PATH
    FULL_DATA --> PATH
    
    style Generate fill:#3b82f6
    style Export fill:#f59e0b
    style Location fill:#10b981
```

**JSON Files Generated:**
```
public/data/ticker/
├── NIFTY.json (metrics: verdict, vix, slippage, trade_sizing_multiplier)
├── NIFTY_full.json (full: 12 tiles data - charts, heatmap, orderbook, etc)
├── BANKNIFTY.json
├── BANKNIFTY_full.json
├── RELIANCE.json
├── RELIANCE_full.json
└── ... (500 stocks total)
```

---

## 🟢 **Phase 5: Node.js Backend Server**

### 🔌 API Serving Pipeline

```mermaid
graph TB
    subgraph Client["CLIENT"]
        BROWSER["Browser Request<br/>GET /api/ticker/NIFTY"]
    end
    
    subgraph Server["EXPRESS SERVER"]
        ROUTE["Route Handler<br/>/api/ticker/:ticker"]
        CACHE["Check Cache<br/>1min TTL"]
        FILE["Read JSON File<br/>from public/data/"]
        FALLBACK["Fallback to<br/>Synthetic Data"]
    end
    
    subgraph Response["RESPONSE"]
        JSON_RESP["Send JSON<br/>with metrics"]
    end
    
    BROWSER --> ROUTE
    ROUTE --> CACHE
    CACHE -->|Hit| JSON_RESP
    CACHE -->|Miss| FILE
    FILE -->|Exists| JSON_RESP
    FILE -->|Missing| FALLBACK
    FALLBACK --> JSON_RESP
    
    style Client fill:#4c1d95
    style Server fill:#15803d
    style Response fill:#1e40af
```

**API Endpoints:**
```
GET /api/ticker/:ticker
  Returns: { metrics, meta, data_quality }
  
GET /api/ticker/:ticker/full
  Returns: { 
    spotPrice, indiaVix, slippageExpectation,
    volumeProfile, orderbook, candles,
    rollingAverages, slippageByVolume, timelineEvents,
    activityHeatmap, orderFlowAbsorption, returnsHistogram,
    verdict
  }
```

---

## ⚛️ **Phase 6: React Frontend Display**

### 🎨 Dashboard Layout & Data Flow

```mermaid
graph TB
    subgraph Fetch["DATA FETCHING"]
        QUERY1["useQuery(/api/ticker)"]
        QUERY2["useQuery(/api/ticker/full)"]
        STATE["TanStack Query<br/>Auto Refresh 30s"]
    end
    
    subgraph Display["UI RENDERING"]
        HEADER["Header<br/>Ticker Selector"]
        LEFTRAIL["Left Rail<br/>Ticker, Timeframe<br/>💰 Money to Invest"]
        VERDICT["Verdict Tile<br/>🎯 Direction<br/>💰 Invest THIS MUCH"]
    end
    
    subgraph Tiles["12 ANALYSIS TILES"]
        NUMERIC["Numeric Tiles<br/>Spot Price, VIX<br/>Slippage"]
        CHARTS["Chart Tiles<br/>Volume Profile<br/>Orderbook, Heatmap<br/>Bollinger, etc"]
        INSIGHT["Insight Footer<br/>Simple Emoji Signal<br/>UP/DOWN/GOOD/BAD"]
    end
    
    subgraph Interaction["USER INTERACTION"]
        HELP["Click ?<br/>See Simple<br/>Explanation"]
        INSPECT["Click Tile<br/>Inspector Panel<br/>JSON & Details"]
        THEME["Theme Toggle<br/>Dark/Light"]
    end
    
    QUERY1 --> STATE
    QUERY2 --> STATE
    STATE --> HEADER
    STATE --> VERDICT
    STATE --> TILES
    
    HEADER --> LEFTRAIL
    VERDICT --> LEFTRAIL
    
    TILES --> NUMERIC
    TILES --> CHARTS
    CHARTS --> INSIGHT
    
    INSIGHT --> INTERACTION
    
    style Fetch fill:#06b6d4
    style Display fill:#8b5cf6
    style Tiles fill:#f97316
    style Interaction fill:#22c55e
```

**12 Analysis Tiles + 1 Verdict:**

| Tile | Type | Insight |
|------|------|---------|
| Spot Price | Numeric | Current market price |
| India VIX | Numeric | Market fear (high=scared) |
| Slippage | Numeric | Trading cost (✓ Good / ⚠ Bad) |
| Volume Profile | Chart | People buying/selling here |
| Orderbook Depth | Chart | Current buy/sell queue |
| Bollinger Bands | Chart | Price at extreme? |
| Rolling Avg | Chart | All trends aligned? |
| Scatter Plot | Chart | Volume vs Slippage |
| Heatmap | Chart | When is market busiest? |
| Absorption | Chart | Buyers or sellers winning? |
| Histogram | Chart | Trending or bouncing? |
| Timeline | Chart | Upcoming events |
| **VERDICT** | **Verdict** | **BUY/SELL/WAIT + $ Amount** |

---

## 🔄 **Complete Data Flow Example: NIFTY Stock**

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Browser as 🌐 Browser
    participant Express as 🟢 Node Server
    participant Cache as 💾 Cache
    participant JSON as 📄 JSON File
    participant Python as 🐍 Python
    participant Yahoo as 📈 Yahoo API
    
    User->>Browser: Select NIFTY
    Browser->>Express: GET /api/ticker/NIFTY
    Express->>Cache: Check cache
    alt Cache Hit
        Cache-->>Express: Return cached data
    else Cache Miss
        Express->>JSON: Read NIFTY.json
        alt File Exists
            JSON-->>Express: Return data
        else File Missing
            Express->>Python: Generate synthetic
            Python-->>Express: Return prediction
        end
    end
    Express-->>Browser: JSON response
    Browser->>Browser: Render 13 tiles
    Browser-->>User: Display verdict + charts
    
    Note over User,Browser: User sees:<br/>✓ Spot Price: ₹25,000<br/>✓ VIX: 15 (calm)<br/>✓ Verdict: BULLISH +250pts (78%)<br/>💰 Invest: ₹7,500 (75%)
```

---

## 📊 **Data Pipeline Command Sequence**

```bash
# Step 1: Fetch raw data from Yahoo Finance (500 stocks)
python3 scripts/fetch_tickers.py
# Output: public/data/raw/*.csv (500 files)

# Step 2: Train ML models on historical data
python3 scripts/train_slippage_quantile.py
python3 scripts/train_regime_classifier.py
# Output: models/*.joblib (ML model files)

# Step 3: Generate predictions for all tickers
python3 scripts/tradyxa_pipeline.py --all
# Output: public/data/ticker/*.json (1000 files - metrics + full)

# Step 4: Start Node server
npm run dev
# Starts on port 5000 → http://localhost:5000

# Step 5: User opens browser
# Browser requests /api/ticker/NIFTY
# Server returns cached/file/synthetic data
# Dashboard renders 13 tiles with insights
```

---

## 🎯 **Key Features in Action**

### 💰 Investment Guidance System

```
User Input:
  "I want to invest ₹1,000,000"
  
System Calculates:
  1. Run verdict on NIFTY
  2. Get trade_sizing_multiplier (e.g., 0.75 = 75%)
  3. Calculate: ₹1,000,000 × 0.75 = ₹750,000
  
Display:
  Left Sidebar: "💰 Invest THIS MUCH: ₹7,50,000 (75%)"
  Verdict Tile: Same amount shown
  All updates in real-time as user changes investment amount
```

### 🔍 Simple Explanations for Non-Technical Users

```
When user clicks "?" on Volume Profile tile:

Modal Shows:
  ✓ Technical Description
  ✓ SIMPLE EXPLANATION:
    "Imagine a restaurant - some prices have 
     MORE customers (high volume).
     • More people want to SELL = Price might go DOWN
     • More people want to BUY = Price might go UP"
  ✓ Green/Amber/Red Thresholds
  ✓ Example Actions to take
```

### 📊 Chart Insights

```
Every chart tile footer shows:
  
  Volume Profile:
  "📉 People sold LOWER prices before - Market moved UP since then"
  
  Orderbook:
  "🟢 More buyers than sellers - Might go UP!"
  
  Bollinger Bands:
  "⬆⬆ Price is HIGH - May come down soon"
  
  Uses: Emoji + direction + simple outcome
  Target: Non-technical traders understand instantly
```

---

## 🏢 **Production Deployment**

### Replit Deployment
```bash
# Just click "Run" in Replit
npm run dev
# Automatically handles everything:
# - Synthetic data generation
# - Express server on port 5000
# - React hot reload on file changes
```

### Self-Hosted (Linux/Mac)
```bash
# 1. Install dependencies
npm install
pip install -r requirements.txt

# 2. Generate data (optional)
python3 scripts/tradyxa_pipeline.py --all

# 3. Start server
npm run dev
```

---

## 📈 **Data Quality Badges**

Each tile shows data quality:
- **GOOD** ✅ - Real data from trained models
- **LOW** ⚠️ - Limited data, increased uncertainty
- **INSUFFICIENT** ❌ - Not enough data yet

---

## 🔒 **Security & Privacy**

- **No backend database** - All data in-memory + JSON files
- **No personal data** - Only financial market data
- **Cookie consent** - Optional analytics toggle
- **Disclaimer** - 48-hour cache, educational use only

---

## 📚 **File Structure**

```
Tradyxa Aztryx/
├── client/                     # React Frontend
│   ├── public/
│   │   ├── data/
│   │   │   ├── raw/           # *.csv from Yahoo Finance
│   │   │   └── ticker/        # *.json generated predictions
│   │   ├── favicon.svg        # Cyan theme icon
│   │   └── og-image.svg       # Social media image
│   ├── src/
│   │   ├── pages/Dashboard.tsx
│   │   ├── components/        # 12 tiles + verdict
│   │   └── lib/chartInsights.ts  # Simple explanations
│   └── index.html
│
├── server/                     # Node.js Express
│   ├── index.ts              # Express app
│   ├── routes.ts             # API endpoints
│   ├── storage.ts            # JSON file loading
│   └── syntheticData.ts      # Fallback data
│
├── scripts/                    # Python Pipeline
│   ├── data_manager.py       # Yahoo Finance fetching
│   ├── tradyxa_pipeline.py   # Main prediction engine
│   ├── train_*.py            # ML model training
│   ├── nifty500.txt          # 500 stock list
│   └── fetch_tickers.py      # Download all data
│
├── models/                     # ML Models (*.joblib)
├── shared/schema.ts          # TypeScript types
├── SIMPLE_EXPLANATIONS.md    # User guide
└── README.md                 # This file
```

---

## 🚀 **Quick Start**

```bash
# Clone / Open in Replit
git clone <repo>
cd "Tradyxa Aztryx"

# Install
npm install

# Run (port 5000)
npm run dev

# Open browser
open http://localhost:5000
```

---

## 📞 **Support**

For issues or questions:
1. Check `SIMPLE_EXPLANATIONS.md` for tile descriptions
2. Click "?" on any tile for help modal
3. Review this architecture guide
4. Check `ARCHITECTURE_DECISION.md` for design choices

---

**Version:** 1.0.0  
**Last Updated:** December 2, 2025  
**Theme:** Cyan-blue on dark/light background  
**Target Users:** Non-technical stock traders, educational use only
