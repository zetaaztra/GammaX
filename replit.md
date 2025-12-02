# Tradyxa Aztryx Dashboard

## Overview

Tradyxa Aztryx is a production-grade financial analytics dashboard for Indian market analysis. The application provides 12 analytical tiles plus a Verdict tile that aggregates directional trading signals with confidence levels. It features a React/TypeScript frontend with Tailwind CSS and a Node.js/Express backend that generates synthetic market data for demonstration purposes.

The dashboard enables users to analyze Indian market tickers (NIFTY, BANKNIFTY, and Nifty-500 stocks) across multiple dimensions including spot price, volatility (India VIX), slippage expectations, volume profiles, orderbook depth, candlestick patterns with Bollinger Bands, rolling averages, and timeline events.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18.2 with TypeScript 5.3, using Vite as the build tool and development server.

**UI Component System**: shadcn/ui components built on Radix UI primitives, providing accessible, customizable components with consistent styling through Tailwind CSS utility classes.

**State Management**: 
- TanStack Query (React Query) for server state management with built-in caching (1-minute TTL)
- React hooks for local component state
- Context API for theme management (dark/light mode with localStorage persistence)

**Data Visualization**: Recharts library for all chart components including candlesticks, scatter plots, area charts, bar charts, and custom gauge visualizations.

**Routing**: Wouter for lightweight client-side routing (currently single-page dashboard).

**Styling System**:
- Tailwind CSS for utility-first styling
- Custom CSS variables for theme tokens
- Design system inspired by Bloomberg Terminal and TradingView
- Typography: Inter (UI text) and JetBrains Mono (numeric data, code)
- Dark/light theme support with automatic system preference detection

**Layout Strategy**:
- Responsive grid: 3-column desktop, 2-column tablet, 1-column mobile
- Fixed left sidebar (w-72) for ticker selection and controls
- Main content area with tile grid layout
- Inspector panel (Sheet component) for drill-down details

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js.

**Data Layer**: In-memory storage using synthetic data generation (no actual database). Data is generated on-demand using seeded pseudo-random generators for consistency.

**API Design**:
- RESTful endpoints: `/api/ticker/:ticker` (basic data), `/api/ticker/:ticker/full` (complete dataset with charts)
- Response caching: In-memory Map with 1-minute TTL to reduce computation
- Synthetic data generation mimics real market data patterns with configurable base prices for known tickers

**Data Generation Strategy**:
- Seeded random number generation for reproducible results per ticker
- Pre-defined base prices for major indices (NIFTY: 24850.75, BANKNIFTY: 52340.50, etc.)
- Verdict calculation combines multiple weighted components (momentum, volatility, volume, technical indicators)
- Full dataset includes OHLCV candles, Bollinger Bands, volume profiles, orderbook levels, slippage samples, timeline events, and heatmaps

**Build System**: 
- esbuild for server-side bundling with selective dependency bundling (allowlist for faster cold starts)
- Vite for client-side bundling and HMR
- Production build outputs to `dist/` directory

### Modal and User Flow Architecture

**Onboarding Flow**:
1. Disclaimer Modal (48-hour expiry, blocking, localStorage-persisted)
2. Cookie Consent Modal (analytics/ads toggles, localStorage-persisted)

**Interactive Components**:
- Per-tile Help modals explaining thresholds and trading actions
- Inspector Panel for raw JSON data, suggested actions, and detailed explanations
- Collapsible "How To" guide tile

### Data Schema Design

**Type Safety**: Zod schemas define all data structures in `shared/schema.ts`, ensuring type safety between frontend and backend.

**Core Types**:
- `Verdict`: Directional signal (BULLISH/BEARISH/NEUTRAL) with confidence, points, error range, and component waterfall
- `TickerData`: Basic ticker info with verdict
- `TickerFullData`: Complete dataset with all chart data arrays
- Chart-specific types: `Candle`, `VolumeBucket`, `OrderbookLevel`, `SlippageSample`, `TimelineEvent`, etc.

## External Dependencies

### Third-Party UI Libraries
- **Radix UI**: Headless UI primitives (@radix-ui/react-*) for accessible components
- **Recharts**: Chart visualization library
- **Framer Motion**: Animation library (imported but minimal usage in current codebase)
- **cmdk**: Command palette component
- **Wouter**: Lightweight routing

### Development Tools
- **Vite**: Frontend build tool with HMR
- **esbuild**: Backend bundling
- **TypeScript**: Type safety across full stack
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing with Autoprefixer

### Database Configuration
- **Drizzle ORM**: Configured but not actively used (drizzle.config.ts references PostgreSQL via DATABASE_URL)
- **@neondatabase/serverless**: PostgreSQL driver dependency (currently unused, all data is synthetic)
- **Note**: The application is designed to support PostgreSQL integration in the future, but currently operates entirely on synthetic in-memory data

### Data Sources (Simulated)
- **yfinance**: Referenced in Python scripts for potential real data fetching
- Current implementation uses synthetic data generation
- Real integration would require Python backend scripts from `scripts/sample_data_generator.py`

### Future Integration Points
- PostgreSQL database for persistent storage
- Real market data APIs (NSE India, Yahoo Finance)
- Python backend microservices for data processing and ML models