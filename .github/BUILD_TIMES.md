# GitHub Actions Build Time Estimates

## Overview
This document provides estimated build times for GitHub Actions workflows in the Tradyxa Aztryx project.

---

## **Daily Data Update Workflow**
**File**: `.github/workflows/daily_update.yml`  
**Schedule**: After market close (3:45 PM IST / 10:15 AM UTC), Monday-Friday  
**Trigger**: Automatic (cron) or manual

### Build Steps Breakdown

| Step | Description | Estimated Time |
|------|-------------|----------------|
| 1. Checkout | Clone repository | ~10 seconds |
| 2. Setup Python | Install Python 3.11 + cache | ~20 seconds |
| 3. Install Dependencies | `pip install` | ~30 seconds |
| 4. Fetch NIFTY + BankNifty | Priority indices | ~15 seconds |
| 5. **Batch Process 500+ Stocks** | Parallel fetch (2 workers) | **25-35 minutes** |
| 6. Apply ML Models | Update predictions | ~2 minutes |
| 7. Commit & Push | Git operations | ~30 seconds |

### **Total Estimated Time: 30-40 minutes**

---

## **Weekly ML Training Workflow**
**File**: `.github/workflows/train.yml`  
**Schedule**: Sunday at midnight UTC  
**Trigger**: Automatic (cron) or manual

### Build Steps Breakdown

| Step | Description | Estimated Time |
|------|-------------|----------------|
| 1. Checkout | Clone repository | ~10 seconds |
| 2. Setup Python | Install Python 3.11 + cache | ~20 seconds |
| 3. Install Dependencies | `pip install` | ~30 seconds |
| 4. **Fetch All Data** | Batch process (4 workers) | **15-20 minutes** |
| 5. Train Regime Classifier | RF on ~230k rows | ~1 minute |
| 6. Train Slippage Models | 2x GradientBoosting | ~2 minutes |
| 7. Commit & Push | Git operations | ~30 seconds |

### **Total Estimated Time: 20-25 minutes**

**Note**: Training does **NOT** trigger Cloudflare deployment (uses `[skip ci]` flag)

---

## **Cloudflare Pages Deployment**
**Trigger**: Git push to `main` branch (from Daily Data Update)  
**Build Command**: `npm run build` (frontend only)  
**Estimated Time**: 2-3 minutes

### **Total End-to-End Time (Data Update + Deploy)**
- GitHub Actions: 30-40 minutes
- Cloudflare Build: 2-3 minutes
- **Total**: **35-45 minutes** from market close to live deployment

---

## **Time Factors**

### Variables Affecting Build Time:
1. **Number of stocks**: Currently 503 (NIFTY + BANKNIFTY + 500 stocks)
2. **Worker count**: 
   - Daily: 2 workers (conservative for API limits)
   - Training: 4 workers (faster, runs off-hours)
3. **Network speed**: yfinance API response time
4. **GitHub Actions runner load**: Varies by GitHub availability

### Optimization Notes:
- **Cache enabled**: Python dependencies cached between runs (~80% faster installs)
- **Incremental updates**: Only fetches new data since last run (not full 5 years daily)
- **Parallel processing**: Multi-worker execution for stock data fetching
- **Timeout protection**: 60-minute timeout prevents runaway builds

---

## **Cost Considerations (GitHub Private Repo)**

GitHub Actions free tier for private repositories:
- **2,000 minutes/month** included
- Additional: **$0.008/minute**

### Monthly Usage Estimate:
- **Daily Updates**: 22 weekdays × 35 minutes = **770 minutes**
- **Weekly Training**: 4 Sundays × 20 minutes = **80 minutes**
- **Total**: **~850 minutes/month**

✅ **Within free tier** (with buffer for manual runs)

---

## **Repository Size Warning**

Current data size: ~240 MB (503 stocks × 3 files each)

**Recommendation**: Consider using Git LFS for data files if size exceeds 1 GB
