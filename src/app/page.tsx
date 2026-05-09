import { TerminalLogs } from "@/components/TerminalLogs";
import { PNLCounter } from "@/components/PNLCounter";
import { MonteCarloSim } from "@/components/MonteCarloSim";
import { SystemFeatures } from "@/components/SystemFeatures";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ForecastGrid } from "@/components/ForecastGrid";
import { LiveMarketTable } from "@/components/LiveMarketTable";
import { ArrowRight, ChevronRight, Cpu, Database, Globe, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen selection:bg-terminal-green selection:text-black">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b terminal-border bg-background/80 backdrop-blur-md px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-terminal-green flex items-center justify-center">
            <span className="text-black font-bold text-[10px]">QT</span>
          </div>
          <span className="font-bold uppercase tracking-tighter text-sm">Quant_Terminal_v4.7</span>
        </div>
        <ThemeToggle />
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-12 md:py-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-2 py-1 border terminal-border text-[10px] uppercase tracking-[0.2em] opacity-60">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terminal-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-terminal-green"></span>
            </span>
            System_Status: Operational
          </div>
          
          <h1 className="text-4xl md:text-7xl font-bold uppercase tracking-tighter leading-[0.9]">
            AI IS TURNING <br />
            <span className="text-terminal-green text-glow">RETAIL TRADERS</span> <br />
            INTO QUANTS
          </h1>

          <ul className="space-y-4 text-sm md:text-base opacity-80 max-w-xl">
            <li className="flex gap-3">
              <ChevronRight className="text-terminal-green shrink-0" size={20} />
              <span>This BTC bot runs 10,000 Monte Carlo simulations before every trade.</span>
            </li>
            <li className="flex gap-3">
              <ChevronRight className="text-terminal-green shrink-0" size={20} />
              <span>Claude handles strategy logic while simulations stress-test possible outcomes.</span>
            </li>
          </ul>

          <div className="pt-4 flex flex-wrap gap-4">
            <button className="px-8 py-4 bg-terminal-green text-black font-bold uppercase text-xs tracking-widest hover:brightness-110 transition-all flex items-center gap-3">
              <span>&gt; INITIALIZE_DEPLOY.SH</span>
              <ArrowRight size={14} />
            </button>
            <button className="px-8 py-4 border terminal-border font-bold uppercase text-xs tracking-widest hover:bg-foreground hover:text-background transition-all">
              View_Live_Data
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <TerminalLogs />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border terminal-border bg-black/5 dark:bg-black/20">
              <PNLCounter />
            </div>
            <div className="p-4 border terminal-border bg-black/5 dark:bg-black/20 overflow-hidden">
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-2">Matrix_Realtime_Feeds</div>
              <LiveMarketTable />
            </div>
          </div>
        </div>
      </section>

      {/* The Engine Section */}
      <section className="border-y terminal-border bg-foreground/5 py-24">
        <div className="px-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="aspect-square border terminal-border relative p-8">
              <MonteCarloSim />
              <div className="absolute top-0 right-0 p-4 font-mono text-[10px] opacity-40">
                SIM_ID: MC_10K_BTC_RUN
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter">
                Powered by <span className="text-terminal-green">Claude & MiroFish</span>
              </h2>
              <div className="h-px w-24 bg-terminal-green" />
              <p className="text-sm md:text-lg leading-relaxed opacity-80 uppercase font-bold">
                Some traders are using Claude and simulation engines to build AI-driven BTC trading systems.
              </p>
              <p className="text-sm md:text-base opacity-60 leading-relaxed">
                The setups combine Monte Carlo style simulations, market data feeds, and thousands of scenario tests to identify high probability trading opportunities. It's no longer about guessing; it's about statistical dominance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Forecast Section */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col gap-2">
            <span className="text-terminal-green text-[10px] uppercase tracking-[0.3em] font-bold">Intelligence_Matrix</span>
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter">Global Forecast Network</h2>
            <p className="max-w-2xl opacity-60 text-sm">
              Our system aggregates atmospheric and market sentiment data from 20 global hubs, running parallel simulations across the entire network every 300 seconds.
            </p>
          </div>
          <ForecastGrid />
        </div>
      </section>

      {/* Case Study Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-6xl font-bold uppercase tracking-tighter">
              The $87k Polymarket Weather Bot
            </h2>
            <p className="text-terminal-green text-sm uppercase tracking-widest font-bold">Strategy Case Study: #METEO-01</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 p-8 border terminal-border bg-black/5 dark:bg-black/20 space-y-6">
              <p className="text-lg md:text-2xl font-bold uppercase leading-tight italic">
                "A 33-year-old IT engineer got hooked on meteorology - and with Claude, this hobby turned into $87,000 profit."
              </p>
              <p className="opacity-70 leading-relaxed">
                Claude as the algorithm’s brain + MiroFish simulation engine allowed him to earn $5,000-$6,000 per month. Completely passive. The system scans weather anomalies and maps them against betting odds with 99.8% execution accuracy.
              </p>
              
              <div className="flex flex-wrap gap-8 pt-6 border-t terminal-border opacity-60">
                <div>
                  <div className="text-[10px] uppercase">Net_Profit</div>
                  <div className="text-2xl font-bold text-terminal-green">$87,412.00</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase">Monthly_Avg</div>
                  <div className="text-2xl font-bold">$5,820.00</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase">Status</div>
                  <div className="text-2xl font-bold">PASSIVE</div>
                </div>
              </div>
            </div>

            <div className="p-8 border terminal-border flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-terminal-green/20 border terminal-border flex items-center justify-center">
                  <Cpu className="text-terminal-green" size={32} />
                </div>
                <div>
                  <div className="font-bold">@automatedaitradingbot</div>
                  <Link href="http://polymarket.com/@automatedaitradingbot?via=cvxv666" target="_blank" className="text-[10px] text-terminal-green hover:underline">
                    polymarket.com/profile
                  </Link>
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-[10px] uppercase opacity-40">Profile_Bio</div>
                <p className="text-sm">"Meteorologist. IT engineer. Automated bot testing. Building systems that out-simulate the market."</p>
              </div>
              <div className="mt-auto">
                <div className="w-full bg-terminal-green h-1 mt-2" />
                <div className="flex justify-between text-[8px] uppercase mt-1 opacity-40">
                  <span>Verified_Quant</span>
                  <span>lvl_99</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-foreground text-background">
        <div className="px-4 max-w-7xl mx-auto space-y-16">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter">System_Data_Flow</h2>
            <div className="h-1 w-32 bg-background" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="text-4xl font-bold opacity-20">01</div>
              <div className="w-12 h-12 border border-background flex items-center justify-center">
                <Database size={24} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-sm">Data Extraction</h3>
              <p className="text-xs opacity-70 leading-relaxed">
                Every 5 minutes, the bot pulls fresh atmospheric and market data from the Open-Meteo API and global exchange order books.
              </p>
            </div>
            <div className="space-y-6">
              <div className="text-4xl font-bold opacity-20">02</div>
              <div className="w-12 h-12 border border-background flex items-center justify-center">
                <Cpu size={24} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-sm">Simulation Engine</h3>
              <p className="text-xs opacity-70 leading-relaxed">
                Data is fed into Mirofish. It runs 10k parallel scenarios to determine the 'True Probability' of an event.
              </p>
            </div>
            <div className="space-y-6">
              <div className="text-4xl font-bold opacity-20">03</div>
              <div className="w-12 h-12 border border-background flex items-center justify-center">
                <Zap size={24} />
              </div>
              <h3 className="font-bold uppercase tracking-widest text-sm">Execution</h3>
              <p className="text-xs opacity-70 leading-relaxed">
                Compares simulation results with current Polymarket odds. Any delta &gt; 1.5% triggers an immediate, passive-income generating trade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* System Features */}
      <section className="py-24 px-4 max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-bold uppercase tracking-widest italic flex items-center gap-2">
            <Globe size={20} className="text-terminal-green" />
            Core_Matrix_Specs
          </h2>
          <span className="text-[10px] opacity-40 uppercase">Architecture: Terminal-7-v3</span>
        </div>
        <SystemFeatures />
      </section>

      {/* Footer / CTA */}
      <footer className="border-t terminal-border py-24 px-4 bg-background">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <p className="text-lg md:text-3xl font-bold uppercase tracking-tighter max-w-2xl mx-auto leading-tight">
              End result? This <span className="text-terminal-green">Claude + Mirofish</span> setup prints over $100k/year on autopilot.
            </p>
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">Ready to initiate system deployment?</p>
          </div>
          
          <div className="flex flex-col items-center gap-6">
            <button className="group relative px-12 py-6 bg-terminal-green text-black font-black uppercase text-sm tracking-[0.2em] hover:scale-105 transition-all">
              <span className="relative z-10">&gt; DEPLOY_YOUR_OWN_BOT.EXE</span>
              <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </button>
            <div className="font-mono text-[10px] opacity-40 animate-pulse">
              WAITING FOR USER COMMAND... _
            </div>
          </div>

          <div className="pt-24 flex flex-col md:flex-row justify-between items-center gap-8 border-t terminal-border/10 opacity-30 text-[9px] uppercase tracking-widest">
            <span>© 2026 QUANT_TERMINAL_SYSTEMS</span>
            <div className="flex gap-8">
              <span>Security: AES-256</span>
              <span>Uptime: 99.998%</span>
              <span>Latency: 4ms</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
