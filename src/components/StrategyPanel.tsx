"use client";

import { useMarketStore } from "@/store/marketStore";

export function StrategyPanel() {
  const strategies = useMarketStore((state) => state.strategies);

  return (
    <div className="border terminal-border bg-black/20 p-4 min-h-[320px]">
      <div className="flex items-center justify-between pb-3 mb-3 border-b terminal-border text-[10px] uppercase opacity-70">
        <div className="font-bold uppercase">Strategy Panel</div>
        <div className="text-terminal-green text-xs">Live Rules</div>
      </div>
      <div className="space-y-3 text-[11px]">
        {strategies.map((strategy) => (
          <div key={strategy.id} className="rounded-sm border terminal-border/5 bg-black/10 p-3">
            <div className="flex justify-between items-center gap-3">
              <div>
                <div className="font-bold uppercase text-sm">{strategy.name}</div>
                <div className="text-[10px] opacity-60 uppercase tracking-[0.2em]">{strategy.asset}</div>
              </div>
              <div className={`text-[10px] font-bold ${strategy.status === "ACTIVE" ? "text-terminal-green" : "text-terminal-red"}`}>
                {strategy.status}
              </div>
            </div>
            <div className="mt-2 text-[11px] opacity-75">{strategy.description}</div>
            <div className="mt-3 grid gap-1 text-[10px] opacity-70">
              {strategy.rules.map((rule, index) => (
                <div key={`${strategy.id}-rule-${index}`} className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-terminal-green" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
