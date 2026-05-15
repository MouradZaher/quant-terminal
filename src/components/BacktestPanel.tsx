"use client";

import { useMarketStore } from "@/store/marketStore";
import { motion } from "framer-motion";

export function BacktestPanel() {
  const backtest = useMarketStore((state) => state.backtest);
  const isBacktesting = useMarketStore((state) => state.isBacktesting);

  if (!backtest && !isBacktesting) {
    return (
      <div className="border terminal-border bg-black/20 p-4 min-h-[360px] flex items-center justify-center">
        <div className="text-center space-y-2 opacity-50">
          <div className="text-[12px] uppercase tracking-[0.2em]">No backtest</div>
          <div className="text-[10px] opacity-60 text-terminal-green cursor-pointer hover:underline">
            Run_Backtest.sh
          </div>
        </div>
      </div>
    );
  }

  if (isBacktesting) {
    return (
      <div className="border terminal-border bg-black/20 p-4 min-h-[360px]">
        <div className="pb-3 mb-3 border-b terminal-border text-[10px] uppercase opacity-70 flex justify-between items-center">
          <div className="font-bold uppercase">Backtest Engine</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
            <div className="text-terminal-green text-xs">RUNNING</div>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center relative">
          <div className="space-y-4 text-center w-full px-4">
            <div className="text-[11px] uppercase opacity-60">Replaying historical candles...</div>
            <div className="w-full bg-foreground/10 h-1 overflow-hidden rounded-sm">
              <motion.div
                className="h-full bg-terminal-green"
                animate={{ width: ["0%", "100%"] }}
                transition={{ duration: 3, ease: "linear" }}
              />
            </div>
            <div className="text-[10px] opacity-40">Processing trade signals...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border terminal-border bg-black/20 p-4 min-h-[360px]">
      <div className="pb-3 mb-3 border-b terminal-border text-[10px] uppercase opacity-70 flex justify-between items-center">
        <div className="font-bold uppercase">Backtest Results</div>
        <div className="text-terminal-green text-xs">{backtest.totalTrades} Trades</div>
      </div>

      <div className="grid gap-2 text-[11px] mb-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="border terminal-border/5 bg-black/10 p-2 rounded-sm">
            <div className="text-[10px] opacity-60 uppercase">Win Rate</div>
            <div className="text-lg font-bold text-terminal-green">{backtest.winRate.toFixed(1)}%</div>
          </div>
          <div className="border terminal-border/5 bg-black/10 p-2 rounded-sm">
            <div className="text-[10px] opacity-60 uppercase">Total Return</div>
            <div className={`text-lg font-bold ${backtest.totalReturn > 0 ? "text-terminal-green" : "text-terminal-red"}`}>
              {backtest.totalReturn > 0 ? "+" : ""}{backtest.totalReturn.toFixed(2)}%
            </div>
          </div>
          <div className="border terminal-border/5 bg-black/10 p-2 rounded-sm">
            <div className="text-[10px] opacity-60 uppercase">Max Drawdown</div>
            <div className="text-lg font-bold text-terminal-red">{backtest.maxDrawdown.toFixed(2)}%</div>
          </div>
          <div className="border terminal-border/5 bg-black/10 p-2 rounded-sm">
            <div className="text-[10px] opacity-60 uppercase">Profit Factor</div>
            <div className="text-lg font-bold">{backtest.profitFactor.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-[10px]">
        <div className="flex justify-between border-b terminal-border/5 pb-1">
          <span className="opacity-60">Cumulative PnL</span>
          <span className={`font-bold ${backtest.cumulativePnL > 0 ? "text-terminal-green" : "text-terminal-red"}`}>
            ${backtest.cumulativePnL.toFixed(0)}
          </span>
        </div>
        <div className="flex justify-between border-b terminal-border/5 pb-1">
          <span className="opacity-60">Wins / Losses</span>
          <span className="font-bold">
            <span className="text-terminal-green">{backtest.winningTrades}</span> / <span className="text-terminal-red">{backtest.losingTrades}</span>
          </span>
        </div>
        <div className="flex justify-between border-b terminal-border/5 pb-1">
          <span className="opacity-60">Avg Win / Loss</span>
          <span className="font-bold">
            <span className="text-terminal-green">${backtest.avgWin.toFixed(0)}</span> / <span className="text-terminal-red">${backtest.avgLoss.toFixed(0)}</span>
          </span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-60">Sharpe Ratio</span>
          <span className="font-bold">{backtest.sharpeRatio.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-4 text-[9px] opacity-40 text-right">
        {backtest.startDate} → {backtest.endDate}
      </div>
    </div>
  );
}
