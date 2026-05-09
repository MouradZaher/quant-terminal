"use client";

import { motion } from "framer-motion";

export function MonteCarloSim() {
  const points = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
  }));

  return (
    <div className="relative w-full h-full border terminal-border overflow-hidden bg-black/5 dark:bg-black/40">
      <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-10">
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className="border-[0.5px] border-current" />
        ))}
      </div>
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {points.map((p) => (
          <motion.circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={p.size / 10}
            fill="currentColor"
            className="text-terminal-green dark:text-terminal-green"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        {/* Connection lines */}
        {points.slice(0, 15).map((p, i) => (
          <motion.line
            key={`line-${i}`}
            x1={p.x}
            y1={p.y}
            x2={points[(i + 5) % points.length].x}
            y2={points[(i + 5) % points.length].y}
            stroke="currentColor"
            strokeWidth="0.1"
            className="text-terminal-green/30"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        ))}
      </svg>
      <div className="absolute bottom-2 right-2 text-[8px] uppercase opacity-40">
        Sim_Node_Matrix: 4.7.0-Opus
      </div>
    </div>
  );
}
