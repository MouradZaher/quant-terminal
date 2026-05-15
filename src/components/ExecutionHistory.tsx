"use client";

import { useMarketStore } from "@/store/marketStore";

export function ExecutionHistory() {
  const history = useMarketStore((state) => state.history);

  return (
    <div className="border terminal-border bg-black/20 p-4 min-h-[260px]">
      <div className="pb-3 mb-3 border-b terminal-border text-[10px] uppercase opacity-70 flex justify-between items-center">
        <div className="font-bold uppercase">Execution History</div>
        <div className="text-terminal-green text-xs">Live Log</div>
      </div>
      <div className="space-y-3 text-[11px]">
        {history.map((item) => (
          <div key={item.id} className="rounded-sm border terminal-border/5 bg-black/10 p-3">
            <div className="flex justify-between items-center gap-3">
              <div className="font-bold uppercase text-[10px] opacity-80">{item.action}</div>
              <div className="text-[10px] opacity-60">{item.timestamp}</div>
            </div>
            <div className="mt-1 text-[11px] opacity-80">{item.instrument}</div>
            <div className="mt-2 text-[11px] opacity-70">{item.details}</div>
            <div className="mt-2 text-terminal-green font-bold">{item.pnl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
