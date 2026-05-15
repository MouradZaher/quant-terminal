"use client";

import { useMemo } from "react";
import { useMarketStore } from "@/store/marketStore";

export function OrderBookHeatmap() {
  const book = useMarketStore((state) => state.book);

  const bidItems = useMemo(
    () => book.bids.slice().reverse(),
    [book.bids]
  );

  const askItems = useMemo(
    () => book.asks,
    [book.asks]
  );

  return (
    <div className="border terminal-border bg-black/20 p-4 min-h-[300px]">
      <div className="flex items-center justify-between pb-3 mb-3 border-b terminal-border text-[10px] uppercase opacity-70">
        <div className="font-bold uppercase">Order Book Heatmap</div>
        <div className="text-[10px] opacity-60">BTC / USD</div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-[10px] uppercase">
        <div className="space-y-2">
          <div className="flex justify-between opacity-60">
            <span>Bids</span>
            <span>Size</span>
          </div>
          {bidItems.map((item) => (
            <div key={item.price} className="flex items-center gap-2">
              <div className="min-w-[54px] text-terminal-green">{item.price.toFixed(2)}</div>
              <div className="h-2 flex-1 rounded-sm bg-terminal-green/10 overflow-hidden">
                <div className="h-full bg-terminal-green" style={{ width: `${Math.min(item.ratio * 100, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between opacity-60">
            <span>Asks</span>
            <span>Size</span>
          </div>
          {askItems.map((item) => (
            <div key={item.price} className="flex items-center gap-2">
              <div className="min-w-[54px] text-terminal-red">{item.price.toFixed(2)}</div>
              <div className="h-2 flex-1 rounded-sm bg-terminal-red/10 overflow-hidden">
                <div className="h-full bg-terminal-red" style={{ width: `${Math.min(item.ratio * 100, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
