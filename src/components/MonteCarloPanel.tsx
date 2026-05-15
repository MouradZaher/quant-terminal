"use client";

import { useMarketStore } from "@/store/marketStore";
import { motion } from "framer-motion";

export function MonteCarloPanel() {
  const simulation = useMarketStore((state) => state.simulation);
  const isSimulating = useMarketStore((state) => state.isSimulating);

  if (!simulation && !isSimulating) {
    return (
      <div className="border terminal-border bg-black/20 p-4 min-h-[420px] flex items-center justify-center">
        <div className="text-center space-y-2 opacity-50">
          <div className="text-[12px] uppercase tracking-[0.2em]">No simulation running</div>
          <div className="text-[10px] opacity-60">awaiting signal...</div>
        </div>
      </div>
    );
  }

  if (isSimulating) {
    return (
      <div className="border terminal-border bg-black/20 p-4 min-h-[420px]">
        <div className="pb-3 mb-3 border-b terminal-border text-[10px] uppercase opacity-70 flex justify-between items-center">
          <div className="font-bold uppercase">Monte Carlo Sim</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
            <div className="text-terminal-green text-xs">RUNNING</div>
          </div>
        </div>
        <div className="h-80 flex items-center justify-center relative">
          <div className="space-y-6 text-center w-full">
            <div className="text-[11px] uppercase opacity-60">Generating 10,000 Monte Carlo paths...</div>
            <div className="w-full bg-foreground/10 h-1 overflow-hidden rounded-sm">
              <motion.div
                className="h-full bg-terminal-green"
                animate={{ width: ["20%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border terminal-border bg-black/20 p-4 min-h-[420px]">
      <div className="pb-3 mb-3 border-b terminal-border text-[10px] uppercase opacity-70 flex justify-between items-center">
        <div className="font-bold uppercase">Monte Carlo Sim</div>
        <div className="text-terminal-green text-xs">{simulation.pathCount} Paths</div>
      </div>

      <div className="grid gap-3 text-[11px] mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="border terminal-border/5 bg-black/10 p-2 rounded-sm">
            <div className="text-[10px] opacity-60 uppercase">Expected Return</div>
            <div className={`text-lg font-bold ${simulation.expectedValue > 0 ? "text-terminal-green" : "text-terminal-red"}`}>
              {simulation.expectedValue > 0 ? "+" : ""}{simulation.expectedValue.toFixed(2)}%
            </div>
          </div>
          <div className="border terminal-border/5 bg-black/10 p-2 rounded-sm">
            <div className="text-[10px] opacity-60 uppercase">Win Rate</div>
            <div className="text-lg font-bold text-terminal-green">{simulation.winRate.toFixed(1)}%</div>
          </div>
          <div className="border terminal-border/5 bg-black/10 p-2 rounded-sm">
            <div className="text-[10px] opacity-60 uppercase">Max Drawdown</div>
            <div className="text-lg font-bold text-terminal-red">{simulation.maxDrawdown.toFixed(2)}%</div>
          </div>
          <div className="border terminal-border/5 bg-black/10 p-2 rounded-sm">
            <div className="text-[10px] opacity-60 uppercase">Sharpe Ratio</div>
            <div className="text-lg font-bold">{simulation.sharpeRatio.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-[10px]">
        <div className="text-[10px] uppercase opacity-60 border-b terminal-border/5 pb-2">Price Distribution</div>
        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <span className="opacity-60">5th %ile</span>
            <span className="font-bold">${simulation.percentile5.toFixed(0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="opacity-60">25th %ile</span>
            <span className="font-bold">${simulation.percentile25.toFixed(0)}</span>
          </div>
          <div className="flex justify-between items-center bg-black/20 px-2 py-1">
            <span className="opacity-60">Median</span>
            <span className="font-bold text-terminal-green">${simulation.percentile50.toFixed(0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="opacity-60">75th %ile</span>
            <span className="font-bold">${simulation.percentile75.toFixed(0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="opacity-60">95th %ile</span>
            <span className="font-bold">${simulation.percentile95.toFixed(0)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-[9px] opacity-40 text-right">{simulation.timestamp}</div>
    </div>
  );
}
