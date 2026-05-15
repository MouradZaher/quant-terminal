"use client";

import { useMarketStore } from "@/store/marketStore";

export function PaperTradingPanel() {
  const paperPortfolio = useMarketStore((state) => state.paperPortfolio);

  if (!paperPortfolio) {
    return (
      <div className="border terminal-border bg-black/20 p-4 min-h-[300px] flex items-center justify-center">
        <div className="text-center space-y-2 opacity-50">
          <div className="text-[12px] uppercase tracking-[0.2em]">Paper Trading Offline</div>
          <div className="text-[10px] opacity-60">Initialize portfolio...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="border terminal-border bg-black/20 p-4">
      <div className="pb-3 mb-4 border-b terminal-border text-[10px] uppercase opacity-70 flex justify-between items-center">
        <div className="font-bold uppercase">Paper Trading Portfolio</div>
        <div className="text-terminal-green text-xs">{paperPortfolio.openPositions.length} Open</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="border terminal-border/5 bg-black/10 p-2 rounded-sm">
          <div className="text-[10px] opacity-60 uppercase">Equity</div>
          <div className="text-lg font-bold text-terminal-green">${paperPortfolio.equity.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="border terminal-border/5 bg-black/10 p-2 rounded-sm">
          <div className="text-[10px] opacity-60 uppercase">Total PnL</div>
          <div className={`text-lg font-bold ${paperPortfolio.totalPnL > 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
            {paperPortfolio.totalPnL > 0 ? '+' : ''}${paperPortfolio.totalPnL.toFixed(0)}
          </div>
        </div>
        <div className="border terminal-border/5 bg-black/10 p-2 rounded-sm">
          <div className="text-[10px] opacity-60 uppercase">Win Rate</div>
          <div className="text-lg font-bold">{paperPortfolio.winRate.toFixed(1)}%</div>
        </div>
        <div className="border terminal-border/5 bg-black/10 p-2 rounded-sm">
          <div className="text-[10px] opacity-60 uppercase">Trades</div>
          <div className="text-lg font-bold">{paperPortfolio.closedTrades.length}</div>
        </div>
      </div>

      {paperPortfolio.openPositions.length > 0 && (
        <div className="space-y-3 mb-4">
          <div className="text-[10px] uppercase opacity-60 border-b terminal-border/5 pb-2">Open Positions</div>
          {paperPortfolio.openPositions.map((pos) => (
            <div key={pos.id} className="border terminal-border/5 bg-black/10 p-3 rounded-sm text-[11px]">
              <div className="flex justify-between items-center mb-2">
                <div className="font-bold uppercase">{pos.asset}</div>
                <div className={`text-sm font-bold ${pos.pnl > 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
                  {pos.pnl > 0 ? '+' : ''}${pos.pnl.toFixed(0)} ({pos.pnlPercent.toFixed(2)}%)
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] opacity-70">
                <div>Entry: ${pos.entryPrice.toFixed(2)}</div>
                <div>Current: ${pos.currentPrice.toFixed(2)}</div>
                <div>Size: {pos.size.toFixed(3)} {pos.asset.split('/')[0]}</div>
                <div>SL: ${pos.stopLoss.toFixed(2)} TP: ${pos.takeProfit.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <div className="border terminal-border/5 bg-black/10 p-2 rounded-sm">
          <div className="opacity-60 uppercase">Avg Win</div>
          <div className="font-bold text-terminal-green">${paperPortfolio.averageWin.toFixed(0)}</div>
        </div>
        <div className="border terminal-border/5 bg-black/10 p-2 rounded-sm">
          <div className="opacity-60 uppercase">Avg Loss</div>
          <div className="font-bold text-terminal-red">${paperPortfolio.averageLoss.toFixed(0)}</div>
        </div>
        <div className="border terminal-border/5 bg-black/10 p-2 rounded-sm">
          <div className="opacity-60 uppercase">Risk:Reward</div>
          <div className="font-bold">{(paperPortfolio.averageWin / Math.max(paperPortfolio.averageLoss, 1)).toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
