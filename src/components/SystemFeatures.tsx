import { cn } from "@/lib/utils";

const FEATURES = [
  { title: "Kelly Criterion Sizing", desc: "Dynamic position sizing based on probabilistic edge.", code: "KELLY_S = (bp - q) / b" },
  { title: "Expected Value Scoring", desc: "Every trade must meet minimum +1.5% EV threshold.", code: "EV = (Pw * W) - (Pl * L)" },
  { title: "3 Forecast Sources", desc: "Aggregated intelligence across 20 global cities.", code: "SRC_AGGR: [METEO, MIRO, CLAUDE]" },
  { title: "Self-Calibrating & Alerts", desc: "Real-time adjustment to market volatility.", code: "TG_ALERT: STATUS_OK" },
  { title: "Claude Opus 4.7 Brain", desc: "Next-gen LLM integration for strategy logic.", code: "MODEL: CLAUDE_4.7_OPUS" },
];

export function SystemFeatures() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-px bg-foreground/10 border terminal-border">
      {FEATURES.map((f, i) => (
        <div key={i} className="bg-background p-4 flex flex-col gap-4 group hover:bg-foreground hover:text-background transition-colors duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[10px] opacity-40">BLOCK_{i+1}</span>
            <div className="w-1.5 h-1.5 bg-terminal-green" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest">{f.title}</h3>
          <p className="text-[10px] leading-relaxed opacity-70 group-hover:opacity-100">{f.desc}</p>
          <div className="mt-auto pt-4 border-t border-current/10 font-mono text-[9px] opacity-40 group-hover:opacity-100 italic">
            {f.code}
          </div>
        </div>
      ))}
    </div>
  );
}
