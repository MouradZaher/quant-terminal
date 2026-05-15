"use client";

export type BacktestResult = {
  id: string;
  strategyId: string;
  asset: string;
  startDate: string;
  endDate: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalReturn: number;
  cumulativePnL: number;
  maxDrawdown: number;
  sharpeRatio: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  trades: BacktestTrade[];
  equity: EquityCurve[];
  status: "idle" | "running" | "complete";
};

export type BacktestTrade = {
  id: string;
  entryTime: string;
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  size: number;
  pnl: number;
  pnlPercent: number;
  type: "long" | "short";
};

export type EquityCurve = {
  timestamp: string;
  equity: number;
  drawdown: number;
};

function generateBacktestTrades(
  asset: string,
  dayCount: number
): BacktestTrade[] {
  const trades: BacktestTrade[] = [];
  let tradeCount = Math.max(5, Math.floor(dayCount / 3));

  for (let i = 0; i < tradeCount; i++) {
    const entryDay = Math.floor(Math.random() * (dayCount - 2));
    const exitDay = entryDay + Math.floor(Math.random() * 3) + 1;
    const entryPrice = 64000 + Math.random() * 2000;
    const returnPercent = (Math.random() - 0.35) * 0.08;
    const exitPrice = entryPrice * (1 + returnPercent);

    trades.push({
      id: `trade-${i}`,
      entryTime: `2025-01-${String(entryDay + 1).padStart(2, "0")} 09:30`,
      exitTime: `2025-01-${String(exitDay + 1).padStart(2, "0")} 16:00`,
      entryPrice,
      exitPrice,
      size: 0.1,
      pnl: (exitPrice - entryPrice) * 0.1,
      pnlPercent: returnPercent * 100,
      type: Math.random() > 0.5 ? "long" : "short",
    });
  }

  return trades.sort((a, b) =>
    a.entryTime.localeCompare(b.entryTime)
  );
}

function generateEquityCurve(
  trades: BacktestTrade[],
  initialEquity: number = 100000
): EquityCurve[] {
  const curve: EquityCurve[] = [];
  let equity = initialEquity;
  let peak = initialEquity;
  let day = 1;

  for (const trade of trades) {
    equity += trade.pnl;
    peak = Math.max(peak, equity);
    const drawdown = ((peak - equity) / peak) * 100;
    curve.push({
      timestamp: trade.exitTime,
      equity,
      drawdown,
    });
  }

  return curve;
}

export function runBacktest(
  strategyId: string,
  asset: string,
  startDate: string,
  endDate: string
): BacktestResult {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayCount = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  const trades = generateBacktestTrades(asset, dayCount);
  const equity = generateEquityCurve(trades);

  const winningTrades = trades.filter((t) => t.pnl > 0);
  const losingTrades = trades.filter((t) => t.pnl < 0);

  const totalReturn = trades.reduce((sum, t) => sum + t.pnlPercent, 0);
  const cumulativePnL = trades.reduce((sum, t) => sum + t.pnl, 0);
  const maxDD = Math.max(...equity.map((e) => e.drawdown), 0);

  const avgWin =
    winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length
      : 0;
  const avgLoss =
    losingTrades.length > 0
      ? losingTrades.reduce((sum, t) => sum + Math.abs(t.pnl), 0) /
        losingTrades.length
      : 0;

  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;
  const winRate = (winningTrades.length / trades.length) * 100;
  const sharpeRatio = totalReturn / Math.max(5, Math.sqrt(dayCount));

  return {
    id: `backtest-${Date.now()}`,
    strategyId,
    asset,
    startDate,
    endDate,
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate,
    totalReturn,
    cumulativePnL,
    maxDrawdown: maxDD,
    sharpeRatio,
    profitFactor,
    avgWin,
    avgLoss,
    trades,
    equity,
    status: "complete",
  };
}
