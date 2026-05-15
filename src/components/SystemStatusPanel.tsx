"use client";

import { useMarketStore } from "@/store/marketStore";

export function SystemStatusPanel() {
  const status = useMarketStore((state) => state.status);

  return (
    <div className="border terminal-border bg-black/20 p-4 min-h-[220px]">
      <div className="flex items-center justify-between pb-3 mb-3 border-b terminal-border text-[10px] uppercase opacity-70">
        <div className="font-bold uppercase">System Status</div>
        <div className={status.connection === "ONLINE" ? "text-terminal-green" : "text-terminal-red"}>
          {status.connection}
        </div>
      </div>

      <div className="grid gap-3 text-[12px] leading-snug">
        <div className="flex justify-between">
          <span className="opacity-70">Data Latency</span>
          <span>{status.latency} ms</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Active Bots</span>
          <span>{status.activeBots}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Streams</span>
          <span>{status.dataStreams}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Portfolio PnL</span>
          <span className="text-terminal-green">${status.pnl.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Risk Exposure</span>
          <span>{status.riskExposure}</span>
        </div>
      </div>
    </div>
  );
}
