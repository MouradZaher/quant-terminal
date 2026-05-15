"use client";

import { useMarketStore } from "@/store/marketStore";

export function SignalPanel() {
  const signals = useMarketStore((state) => state.signals);

  return (
    <div className="border terminal-border bg-black/20 p-4 min-h-[280px]">
      <div className="flex items-center justify-between pb-3 mb-3 border-b terminal-border text-[10px] uppercase opacity-70">
        <div className="font-bold uppercase">Signal Feed</div>
        <div className="text-terminal-green text-xs">AI / Quant Signals</div>
      </div>
      <div className="space-y-3 text-[11px]">
        {signals.map((signal) => (
          <div key={signal.id} className="rounded-sm border terminal-border/5 bg-black/10 p-3">
            <div className="flex justify-between items-center gap-2">
              <div className="font-bold uppercase">{signal.asset}</div>
              <div className={`px-2 py-0.5 rounded text-[10px] ${signal.type === "BUY" ? "bg-terminal-green/15 text-terminal-green" : signal.type === "SELL" ? "bg-terminal-red/15 text-terminal-red" : "bg-foreground/10 text-foreground"}`}>
                {signal.type}
              </div>
            </div>
            <div className="mt-1 text-[10px] opacity-70">{signal.reason}</div>
            <div className="mt-2 flex items-center justify-between text-[10px] opacity-60">
              <span>Score: {signal.score}%</span>
              <span>{signal.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
