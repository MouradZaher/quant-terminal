# QUANT TERMINAL - Setup & Deployment

## Quick Start (Local Development)

### 1. Install Dependencies
```bash
cd "d:\OneDrive - CI Capital\Desktop\proj"
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## Development Build
```bash
npm run build
npm start
```

## Features Implemented

### Phase 1: Terminal UI & Real Market Data
- ✅ Live market data feed (BTC, ETH, SOL)
- ✅ Binance API proxy endpoint
- ✅ Market chart with lightweight-charts library
- ✅ Order book heatmap with depth visualization
- ✅ System status panel
- ✅ Execution history log
- ✅ Terminal theme (dark/light mode)

### Phase 2: Strategy & Signal Generation
- ✅ AI-style signal feed (BUY/SELL/HOLD)
- ✅ Strategy panel with live rules
- ✅ Signal confidence scoring (72-96%)
- ✅ Strategy status tracking (ACTIVE/PAUSED)
- ✅ Live signal mutation on market data updates

### Phase 3: Monte Carlo Simulation Engine
- ✅ Geometric Brownian Motion (GBM) path generator
- ✅ 10,000 path Monte Carlo simulations
- ✅ Price distribution percentiles (5th-95th)
- ✅ Expected return & win rate calculation
- ✅ Sharpe ratio & max drawdown tracking
- ✅ Monte Carlo panel with metric dashboard
- ✅ Animated simulation progress indicator

### Phase 4: Backtesting Engine
- ✅ Historical trade simulation (January 2025)
- ✅ Trade entry/exit tracking
- ✅ Win/loss metrics & profit factor
- ✅ Equity curve & drawdown calculation
- ✅ Backtest results panel
- ✅ Automated backtest on signal generation

## Architecture

### Frontend Stack
- **Framework:** Next.js 14.2.3 + React 18.3.1
- **Styling:** Tailwind CSS + custom terminal theme
- **Charts:** lightweight-charts (candlestick & order book)
- **State:** Zustand (market data, signals, strategies, simulations, backtests)
- **Animations:** Framer Motion
- **Icons:** lucide-react

### Backend Services (Ready for Extension)
- **Node.js API Gateway** (`/api/binance`) - Proxy Binance WebSocket
- **Python** - Simulation & feature engineering (TBD)
- **Rust** - High-performance computations (TBD)

### Database Architecture (Ready for Extension)
- **Supabase** - User accounts, strategies, trades
- **TimescaleDB** - Time-series candles & ticks
- **Redis** - Pub/Sub market data distribution

## Upcoming Phases

### Phase 5: Paper Trading
- Mock trade execution with real market prices
- Portfolio tracking and PnL simulation
- Risk management (position sizing, stop loss)

### Phase 6: Auto Trading Bots
- Strategy scheduler
- Real-time order placement
- Trade monitoring & alerts

### Phase 7: Reinforcement Learning
- PyTorch integration
- Model training on historical data
- Adaptive strategy generation

## Deployment Options

### Vercel (Recommended for Frontend)
```bash
npm install -g vercel
vercel login
vercel deploy
```

### Railway / Fly.io (Backend Services)
- Node.js API Gateway
- Python simulation worker
- Supabase PostgreSQL + Edge Functions

## API Routes

### `/api/binance?type=ticker&symbols=BTCUSDT,ETHUSDT,SOLUSDT`
Fetches current 24h ticker data from Binance

### `/api/binance?type=klines&symbol=BTCUSDT&interval=1m&limit=50`
Fetches 1-minute candlestick data

## Keyboard Shortcuts (Coming in Phase 5+)
- `Ctrl+Shift+S` - Start live trading
- `Ctrl+Shift+B` - Run backtest
- `Ctrl+Shift+M` - Run Monte Carlo
- `Ctrl+K` - Command palette

## Support
For issues or feature requests, refer to the system architecture document included in the project root.

---

**System Status:** OPERATIONAL
**Version:** 4.7.0-Opus
**Last Updated:** May 10, 2026
