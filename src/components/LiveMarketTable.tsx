"use client";

import { useEffect, useState } from "react";
import { useMarketStore } from "@/store/marketStore";

export function LiveMarketTable() {
  const [mounted, setMounted] = useState(false);
  const rows = useMarketStore((state) => state.rows);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-32 w-full bg-foreground/5 animate-pulse" />;

  return (
    <div className="w-full overflow-x-auto border terminal-border bg-black/5 dark:bg-black/20">
      <table className="w-full text-left font-mono text-[10px] uppercase">
        <thead>
          <tr className="border-b terminal-border bg-foreground/5">
            <th className="p-2 opacity-40">Asset_Pair</th>
            <th className="p-2 opacity-40">Live_Index</th>
            <th className="p-2 opacity-40">Delta_24h</th>
            <th className="p-2 opacity-40">Matrix_Stat</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.pair} className="border-b terminal-border/5 hover:bg-foreground/5 transition-colors">
              <td className="p-2 font-bold">{row.pair}</td>
              <td className="p-2 text-terminal-green">
                {row.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className={`p-2 ${row.change.startsWith("+") ? "text-terminal-green" : "text-terminal-red"}`}>
                {row.change}
              </td>
              <td className="p-2">
                <span className="px-1 border terminal-border opacity-60">{row.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
