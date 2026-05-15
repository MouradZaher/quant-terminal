"use client";

import create from "zustand";
import { SimulationResult } from "@/lib/simulationEngine";
import { BacktestResult } from "@/lib/backtestEngine";
import { PaperPortfolio } from "@/lib/paperTradingEngine";

export type AssetPair = "BTC/USD" | "ETH/USD" | "SOL/USD";

export type MarketRow = {
  pair: AssetPair;
  price: number;
  change: string;
  status: string;
};

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type DepthPoint = {
  price: number;
  size: number;
  ratio: number;
};

export type OrderBook = {
  bids: DepthPoint[];
  asks: DepthPoint[];
};

export type SystemStatus = {
  latency: number;
  activeBots: number;
  dataStreams: number;
  pnl: number;
  riskExposure: string;
  connection: "ONLINE" | "OFFLINE";
};

export type ExecutionEvent = {
  id: string;
  timestamp: string;
  action: string;
  instrument: string;
  details: string;
  pnl: string;
};

export type SignalType = "BUY" | "SELL" | "HOLD";

export type SignalEvent = {
  id: string;
  asset: AssetPair;
  type: SignalType;
  reason: string;
  score: number;
  timestamp: string;
};

export type StrategyConfig = {
  id: string;
  name: string;
  asset: AssetPair;
  status: "ACTIVE" | "PAUSED";
  description: string;
  rules: string[];
  lastSignal: SignalType;
};

interface MarketState {
  rows: MarketRow[];
  candles: Candle[];
  book: OrderBook;
  status: SystemStatus;
  history: ExecutionEvent[];
  signals: SignalEvent[];
  strategies: StrategyConfig[];
  simulation: SimulationResult | null;
  isSimulating: boolean;
  backtest: BacktestResult | null;
  isBacktesting: boolean;
  paperPortfolio: PaperPortfolio | null;
  setRows: (rows: MarketRow[]) => void;
  setCandles: (candles: Candle[]) => void;
  setBook: (book: OrderBook) => void;
  setStatus: (update: Partial<SystemStatus>) => void;
  setSignals: (signals: SignalEvent[]) => void;
  addSignal: (signal: SignalEvent) => void;
  setStrategies: (strategies: StrategyConfig[]) => void;
  updateStrategy: (id: string, patch: Partial<StrategyConfig>) => void;
  setSimulation: (sim: SimulationResult | null) => void;
  setIsSimulating: (flag: boolean) => void;
  setBacktest: (result: BacktestResult | null) => void;
  setIsBacktesting: (flag: boolean) => void;
  setPaperPortfolio: (portfolio: PaperPortfolio | null) => void;
  addHistory: (event: ExecutionEvent) => void;
}

const initialRows: MarketRow[] = [
  { pair: "BTC/USD", price: 64281.5, change: "+2.4%", status: "OPTIMAL" },
  { pair: "ETH/USD", price: 3452.12, change: "+1.8%", status: "STABLE" },
  { pair: "SOL/USD", price: 145.67, change: "-0.5%", status: "RISK_ADJ" },
];

const initialBook: OrderBook = {
  bids: Array.from({ length: 10 }, (_, index) => ({
    price: 64280 - index * 3,
    size: Math.round(Math.random() * 18 + 12),
    ratio: 0,
  })),
  asks: Array.from({ length: 10 }, (_, index) => ({
    price: 64283 + index * 3,
    size: Math.round(Math.random() * 18 + 10),
    ratio: 0,
  })),
};

const initialStatus: SystemStatus = {
  latency: 28,
  activeBots: 2,
  dataStreams: 3,
  pnl: 361860,
  riskExposure: "LOW",
  connection: "ONLINE",
};

const initialHistory: ExecutionEvent[] = [
  {
    id: "1",
    timestamp: "09:41:22",
    action: "BUY",
    instrument: "BTC/USD",
    details: "MACD crossover | ATR breakout",
    pnl: "+0.82%",
  },
  {
    id: "2",
    timestamp: "09:39:10",
    action: "SELL",
    instrument: "ETH/USD",
    details: "Momentum fade | VWAP rejection",
    pnl: "+1.15%",
  },
  {
    id: "3",
    timestamp: "09:35:04",
    action: "LONG",
    instrument: "SOL/USD",
    details: "RSI oversold | orderbook imbalance",
    pnl: "-0.08%",
  },
];

const initialSignals: SignalEvent[] = [
  {
    id: "signal-1",
    asset: "BTC/USD",
    type: "BUY",
    reason: "RSI oversold + VWAP support",
    score: 92,
    timestamp: "09:41:00",
  },
  {
    id: "signal-2",
    asset: "ETH/USD",
    type: "HOLD",
    reason: "Trend consolidation + low volume",
    score: 68,
    timestamp: "09:40:18",
  },
  {
    id: "signal-3",
    asset: "SOL/USD",
    type: "SELL",
    reason: "Momentum divergence + orderbook shift",
    score: 81,
    timestamp: "09:39:05",
  },
];

const initialStrategies: StrategyConfig[] = [
  {
    id: "strat-btc-mean-reversion",
    name: "BTC Mean Reversion",
    asset: "BTC/USD",
    status: "ACTIVE",
    description: "Enter on RSI oversold and exit after VWAP mean reversion.",
    rules: ["RSI < 35", "Price below 20MA", "Target 0.8% profit"],
    lastSignal: "BUY",
  },
  {
    id: "strat-eth-breakout",
    name: "ETH Volatility Breakout",
    asset: "ETH/USD",
    status: "ACTIVE",
    description: "Capture strong range expansion after 1m ATR build-up.",
    rules: ["ATR rising", "Price > upper Bollinger band", "Max 1.5x exposure"],
    lastSignal: "HOLD",
  },
  {
    id: "strat-sol-momentum",
    name: "SOL Momentum",
    asset: "SOL/USD",
    status: "PAUSED",
    description: "Monitor liquidity imbalance before activating long entries.",
    rules: ["Orderbook imbalance > 12%", "Volume delta positive", "Stop loss set"],
    lastSignal: "SELL",
  },
];

function normalizeDepthPoints(items: DepthPoint[]): DepthPoint[] {
  const max = Math.max(...items.map((item) => item.size), 1);
  return items.map((item) => ({
    ...item,
    ratio: item.size / max,
  }));
}

function randomDepthBook(mid: number): OrderBook {
  const bids = Array.from({ length: 10 }, (_, index) => ({
    price: Number((mid - (index + 1) * 2.5).toFixed(2)),
    size: Math.round(Math.random() * 24 + 8),
    ratio: 0,
  }));
  const asks = Array.from({ length: 10 }, (_, index) => ({
    price: Number((mid + (index + 1) * 2.5).toFixed(2)),
    size: Math.round(Math.random() * 24 + 6),
    ratio: 0,
  }));
  return {
    bids: normalizeDepthPoints(bids),
    asks: normalizeDepthPoints(asks),
  };
}

export function buildOrderBookSnapshot(mid: number): OrderBook {
  return randomDepthBook(mid);
}

export const useMarketStore = create<MarketState>((set) => ({
  rows: initialRows,
  candles: [],
  book: {
    bids: normalizeDepthPoints(initialBook.bids),
    asks: normalizeDepthPoints(initialBook.asks),
  },
  status: initialStatus,
  history: initialHistory,
  signals: initialSignals,
  strategies: initialStrategies,
  simulation: null,
  isSimulating: false,
  backtest: null,
  isBacktesting: false,
  paperPortfolio: null,
  setRows: (rows) => set({ rows }),
  setCandles: (candles) => set({ candles }),
  setBook: (book) => set({ book }),
  setStatus: (update) => set((state) => ({ status: { ...state.status, ...update } })),
  setSignals: (signals) => set({ signals }),
  addSignal: (signal) =>
    set((state) => ({ signals: [signal, ...state.signals].slice(0, 6) })),
  setStrategies: (strategies) => set({ strategies }),
  updateStrategy: (id, patch) =>
    set((state) => ({
      strategies: state.strategies.map((strategy) =>
        strategy.id === id ? { ...strategy, ...patch } : strategy
      ),
    })),
  setSimulation: (sim) => set({ simulation: sim }),
  setIsSimulating: (flag) => set({ isSimulating: flag }),
  setBacktest: (result) => set({ backtest: result }),
  setIsBacktesting: (flag) => set({ isBacktesting: flag }),
  setPaperPortfolio: (portfolio) => set({ paperPortfolio: portfolio }),
  addHistory: (event) =>
    set((state) => ({ history: [event, ...state.history].slice(0, 8) })),
}));
