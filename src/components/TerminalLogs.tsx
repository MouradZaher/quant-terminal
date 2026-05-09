"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const LOG_MESSAGES = [
  "SCANNING BTC/USD DATA FEEDS...",
  "CLAUDE ANALYZING ORDER BOOK DYNAMICS...",
  "MONTE CARLO SIMULATION #4,291 COMPLETE",
  "EXPECTED VALUE: +2.41% | RISK: 0.12%",
  "VALIDATING STRATEGY AGAINST HISTORICAL VOL...",
  "KELLY CRITERION SIZING CALCULATED: 0.05 BTC",
  "EXECUTING FILL AT $64,281.50...",
  "TRADE CONFIRMED. PNL UPDATED.",
];

export function TerminalLogs() {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => [...prev.slice(-10), LOG_MESSAGES[currentIndex]]);
      setCurrentIndex((prev) => (prev + 1) % LOG_MESSAGES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className="bg-black/20 dark:bg-black p-4 border terminal-border h-[250px] overflow-hidden font-mono text-[10px] md:text-xs leading-tight relative">
      <div className="absolute top-0 left-0 w-full h-full scanline pointer-events-none opacity-20" />
      <div className="flex justify-between items-center border-b terminal-border pb-2 mb-2 opacity-60">
        <span>EXECUTION_LOG.SH</span>
        <span className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="w-2 h-2 rounded-full bg-green-500" />
        </span>
      </div>
      <div className="space-y-1">
        {logs.map((log, i) => (
          <motion.div
            key={`${log}-${i}`}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "flex gap-2",
              log.includes("PNL") ? "text-terminal-green font-bold" : "opacity-80"
            )}
          >
            <span className="opacity-40">[{new Date().toLocaleTimeString()}]</span>
            <span>{log}</span>
          </motion.div>
        ))}
        <div className="flex gap-2">
          <span className="opacity-40">[{new Date().toLocaleTimeString()}]</span>
          <span className="animate-blink">_</span>
        </div>
      </div>
    </div>
  );
}
