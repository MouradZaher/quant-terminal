"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CITIES = [
  "London", "New York", "Tokyo", "Singapore", "Hong Kong",
  "Dubai", "Paris", "Frankfurt", "Sydney", "Toronto",
  "Chicago", "Shanghai", "Mumbai", "Sao Paulo", "Zurich",
  "Amsterdam", "Seoul", "Milano", "Madrid", "Mexico City"
];

export function ForecastGrid() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 opacity-0" />;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {CITIES.map((city, i) => (
        <div key={city} className="border terminal-border p-2 bg-black/5 dark:bg-black/20 flex flex-col gap-1">
          <div className="flex justify-between items-center text-[8px] opacity-40 uppercase">
            <span>City_Node_{i + 1}</span>
            <div className="w-1 h-1 rounded-full bg-terminal-green animate-pulse" />
          </div>
          <div className="text-[10px] font-bold uppercase truncate">{city}</div>
          <div className="flex justify-between items-end mt-1">
            <div className="h-4 w-full bg-foreground/5 relative overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-terminal-green/20"
                initial={{ width: "0%" }}
                animate={{ width: `${Math.random() * 60 + 40}%` }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              />
            </div>
            <span className="text-[8px] font-mono ml-2 opacity-60">{(Math.random() * 0.5 + 0.5).toFixed(2)}s</span>
          </div>
        </div>
      ))}
    </div>
  );
}
