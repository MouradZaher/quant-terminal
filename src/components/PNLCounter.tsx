"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export function PNLCounter() {
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState(361860);

  useEffect(() => {
    setMounted(true);
  }, []);

  const springValue = useSpring(value, {
    stiffness: 10,
    damping: 10,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setValue((prev) => prev + Math.floor(Math.random() * 100) - 20);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const displayValue = useTransform(springValue, (v) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)
  );

  if (!mounted) return <div className="h-16 w-48 bg-foreground/5 animate-pulse" />;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.2em] opacity-60">All-Time PNL_Cumulative</span>
      <motion.div 
        className="text-4xl md:text-6xl font-bold tracking-tighter text-terminal-green text-glow"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        <AnimatedNumber value={displayValue} />
      </motion.div>
    </div>
  );
}

function AnimatedNumber({ value }: { value: any }) {
  const [display, setDisplay] = useState("$361,860.00");
  
  useEffect(() => {
    return value.on("change", (latest: string) => {
      setDisplay(latest);
    });
  }, [value]);

  return <span>{display}</span>;
}
