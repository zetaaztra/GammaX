# Tradyxa Aztryx Dashboard

A production-grade financial analytics dashboard for Indian market analysis featuring 12 analytical tiles plus a Verdict tile, built with React/TypeScript frontend and Node.js/Express backend with synthetic data fallback.

## Features

- **12 Analytical Tiles**: Spot Price, India VIX, Slippage Expectation, Volume Profile, Orderbook Depth, Candles with Bollinger Bands, Price with Rolling Averages, Slippage vs Volume Scatter, Timeline Events, Activity Heatmap, Order Flow Absorption, Returns Distribution Histogram
- **Verdict Tile**: Aggregated directional signal with confidence level, points ± error, and contributor waterfall
- **Dark/Light Theme**: Matching color schemes with localStorage persistence (`aztryx_theme`)
- **Responsive Layout**: 3-column desktop (lg), 2-column tablet (md), 1-column mobile
- **Real-time Refresh**: Hard refresh with cache clearing
- **Modals**: Blocking Disclaimer (48h expiry), Cookie Consent with Adsterra toggle, Per-tile Explain modals
- **Inspector Panel**: Drill-down JSON, actions, and explanations for each tile
- **Synthetic Data Fallback**: Ensures all tiles render with non-empty values

## Tech Stack

### Frontend
- React 18.2 + TypeScript 5.3
- Tailwind CSS 3.4 with custom theme variables
- Recharts for visualizations
- TanStack Query for data fetching
- shadcn/ui components
- wouter for routing

### Backend
- Node.js with Express
- In-memory data caching (1 minute TTL)
- Synthetic data generator with seeded random for consistent demo data
- Optional Python scripts for offline data generation

## Run Instructions

### Quick Start (Replit)
```bash
# Start the development server - this is all you need!
npm run dev
```

The app will be available at port 5000.

### Alternative: Generate Offline Data (Optional)
```bash
# Only if you want pre-generated JSON files
python3 scripts/sample_data_generator.py --ticker NIFTY
python3 scripts/sample_data_generator.py --ticker BANKNIFTY
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ticker/:ticker` | GET | Basic ticker metrics and verdict |
| `/api/ticker/:ticker/full` | GET | Full ticker data with all charts |
| `/api/run_simulation` | POST | Run slippage simulation (clears cache) |

## Data Sources

- **NSE India, Yahoo Finance** (synthetic fallback for demo)
- Analytics powered by **Tradyxa Analytics Engine v1.0.0**

## localStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `aztryx_disclaimer_accepted_at` | ISO string | Disclaimer acceptance timestamp (48h expiry) |
| `aztryx_cookie_choices` | JSON | Cookie preferences with analytics, ads, accepted_at |
| `aztryx_theme` | "dark" \| "light" | Theme preference |

## Modal Behavior

### Disclaimer Modal (48h Expiry)
- **First Visit**: Blocking modal appears (no close X button, no escape key)
- **Acceptance**: User must click "I Understand" to proceed
- **Expiry**: Reappears after 48 hours (calculated from `aztryx_disclaimer_accepted_at`)
- **Storage**: Saves ISO timestamp to localStorage

### Cookie Consent Modal
- **First Visit**: Appears after disclaimer acceptance
- **Options**: Essential (required), Analytics (optional), Advertising/Adsterra (optional)
- **Buttons**: Accept All, Reject All, Save Choices
- **Storage**: Saves JSON object to localStorage

## Testing Checklist

### Manual Testing Steps

1. **Fresh Load Test**
   - [ ] Clear localStorage or use incognito mode
   - [ ] Load the dashboard at http://localhost:5000
   - [ ] Verify Disclaimer modal appears with "Important Disclaimer" title
   - [ ] Verify "I Understand" button is visible
   - [ ] Verify clicking outside modal does NOT close it
   - [ ] Click "I Understand" to dismiss

2. **Cookie Consent Test**
   - [ ] Verify Cookie consent modal appears after disclaimer
   - [ ] Toggle Analytics switch on/off
   - [ ] Toggle Advertising switch on/off
   - [ ] Click "Accept All" (or Reject All / Save Choices)
   - [ ] Verify modal closes

3. **Dashboard Load Test**
   - [ ] Verify left rail shows "NIFTY" as selected ticker
   - [ ] Verify Verdict tile shows direction (BULLISH/BEARISH/NEUTRAL)
   - [ ] Verify Verdict tile shows non-zero points value
   - [ ] Verify Spot Price tile shows value starting with "₹"
   - [ ] Verify India VIX tile shows gauge with value between 12-27
   - [ ] Verify Slippage Expectation shows percentage
   - [ ] Verify all 12 chart tiles render with data

4. **Interactive Features Test**
   - [ ] Click on any tile to open Inspector panel
   - [ ] Verify JSON data is displayed in Inspector
   - [ ] Close Inspector panel
   - [ ] Click "?" icon on any tile to open Explain modal
   - [ ] Verify threshold descriptions are shown
   - [ ] Close Explain modal

5. **Refresh Test**
   - [ ] Click Refresh button in header
   - [ ] Verify loading states appear briefly
   - [ ] Verify data refreshes (values may change slightly)

6. **Theme Toggle Test**
   - [ ] Click theme toggle button (sun/moon icon)
   - [ ] Verify theme switches between dark and light
   - [ ] Refresh page
   - [ ] Verify theme preference persists

7. **Ticker Selection Test**
   - [ ] Click ticker dropdown in left rail
   - [ ] Select "BANKNIFTY"
   - [ ] Verify header shows "BANKNIFTY"
   - [ ] Verify spot price changes (~52,340)
   - [ ] Verify all tiles update with new data

8. **Responsive Layout Test**
   - [ ] Desktop (>1024px): Verify 3-column grid
   - [ ] Tablet (768-1024px): Verify 2-column grid
   - [ ] Mobile (<768px): Verify 1-column grid
   - [ ] Mobile: Verify hamburger menu appears
   - [ ] Mobile: Click hamburger to show left rail

9. **How To Section Test**
   - [ ] Scroll to bottom of dashboard
   - [ ] Click "How to Use This Dashboard" collapsible
   - [ ] Verify 6 steps are visible
   - [ ] Click "Learn More" links to open Explain modals

10. **Persistence Test**
    - [ ] Accept disclaimer and cookies
    - [ ] Set theme to light mode
    - [ ] Refresh page
    - [ ] Verify disclaimer does NOT reappear (within 48h)
    - [ ] Verify cookie consent does NOT reappear
    - [ ] Verify theme remains light

## Legal/Footer

```
Data Sources: NSE India, Yahoo Finance
Analytics powered by Tradyxa Analytics Engine v1.0.0
Market data © respective owners. Tradyxa Quant Dashboard is unaffiliated with NSE or Yahoo.
Market data may be delayed up to 30 minutes. For educational use only.
Operated by Zeta Aztra Technologies (Individual Proprietorship, India)
© 2025 Zeta Aztra Technologies. All Rights Reserved.
```

## Project Structure

```
/client
  /src
    /components
      /charts        - Chart tile components (10 files)
      /ui            - shadcn/ui components
      ThemeProvider.tsx
      VerdictTile.tsx
      NumericCard.tsx
      LeftRail.tsx
      DisclaimerModal.tsx
      CookieConsentModal.tsx
      ExplainModal.tsx
      InspectorPanel.tsx
      HowToTile.tsx
      Footer.tsx
    /pages
      Dashboard.tsx  - Main dashboard page
    /hooks
    /lib
/server
  routes.ts          - API routes
  syntheticData.ts   - Synthetic data generator
  storage.ts         - Storage interface
/shared
  schema.ts          - TypeScript schemas/types
/scripts
  sample_data_generator.py
  nifty500.txt
```

## Expected Data Values (Synthetic)

| Ticker | Spot Price | VIX Range |
|--------|------------|-----------|
| NIFTY | ~24,850 | 12-27 |
| BANKNIFTY | ~52,340 | 12-27 |
| RELIANCE | ~2,945 | 12-27 |
| TCS | ~4,125 | 12-27 |

## License

© 2025 Zeta Aztra Technologies. All Rights Reserved.
