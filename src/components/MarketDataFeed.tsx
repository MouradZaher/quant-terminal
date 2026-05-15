"use client";

import { useEffect } from "react";
import { buildOrderBookSnapshot, useMarketStore } from "@/store/marketStore";
import { runMonteCarloSimulation } from "@/lib/simulationEngine";
import { runBacktest } from "@/lib/backtestEngine";
import { createPaperPortfolio, openPosition, updatePortfolioEquity } from "@/lib/paperTradingEngine";

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];

function getStatusLabel(change: number) {
  if (change > 2) return "BREAKOUT";
  if (change > 0.5) return "TRENDING";
  if (change >= 0) return "STABLE";
  return "RISK_ADJ";
}

function getPairName(symbol: string) {
  return symbol.replace("USDT", "/USD");
}

export function MarketDataFeed() {
  const setRows = useMarketStore((state) => state.setRows);
  const setBook = useMarketStore((state) => state.setBook);
  const setStatus = useMarketStore((state) => state.setStatus);
  const addHistory = useMarketStore((state) => state.addHistory);
  const addSignal = useMarketStore((state) => state.addSignal);
  const updateStrategy = useMarketStore((state) => state.updateStrategy);
  const setSimulation = useMarketStore((state) => state.setSimulation);
  const setIsSimulating = useMarketStore((state) => state.setIsSimulating);
  const setBacktest = useMarketStore((state) => state.setBacktest);
  const setIsBacktesting = useMarketStore((state) => state.setIsBacktesting);
  const setPaperPortfolio = useMarketStore((state) => state.setPaperPortfolio);
  const paperPortfolio = useMarketStore((state) => state.paperPortfolio);

  useEffect(() => {
    if (!paperPortfolio) {
      setPaperPortfolio(createPaperPortfolio());
    }
  }, [paperPortfolio, setPaperPortfolio]);

  useEffect(() => {
    let isMounted = true;

    const handlePaperTrade = (rows: Array<{ pair: string; price: number }>) => {
      if (!paperPortfolio) return;
      let updatedPortfolio = paperPortfolio;
      
      rows.forEach(row => {
        const newPrices = { [row.pair.split('/')[0] + '/USD']: row.price };
        updatedPortfolio = updatePortfolioEquity(updatedPortfolio, newPrices);
      });
      
      setPaperPortfolio(updatedPortfolio);
    };

    const loadMarketData = async () => {
      try {
        const response = await fetch(`/api/binance?type=ticker&symbols=${SYMBOLS.join(",")}`);
        const data = (await response.json()) as Array<Record<string, unknown>>;
        if (!isMounted || !Array.isArray(data)) return;

        const rows = data.map((item) => {
          const price = Number(item.lastPrice ?? 0);
          const change = Number(item.priceChangePercent ?? 0);
          return {
            pair: getPairName(String(item.symbol ?? "BTCUSDT")) as const,
            price,
            change: `${change.toFixed(2)}%`,
            status: getStatusLabel(change),
          };
        });

        setRows(rows);
        setStatus({ latency: Math.max(8, Math.round(Math.random() * 32)), dataStreams: SYMBOLS.length });
        updateSignals(rows);
        handlePaperTrade(rows);
      } catch (error) {
        setStatus({ connection: "OFFLINE" });
      }
    };

    const updateHistory = () => {
      const instrument = ["BTC/USD", "ETH/USD", "SOL/USD"][Math.floor(Math.random() * 3)];
      addHistory({
        id: `${Date.now()}-${instrument}`,
        timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        action: ["BUY", "SELL", "LONG", "SHORT"][Math.floor(Math.random() * 4)],
        instrument,
        details: ["RSI signal", "VWAP rejection", "Momentum shift", "Orderbook imbalance"][Math.floor(Math.random() * 4)],
        pnl: `${(Math.random() * 2 - 0.4).toFixed(2)}%`,
      });
    };

    const updateSignals = (rows: Array<{ pair: string; price: number; change: string }>) => {
      const asset = rows[Math.floor(Math.random() * rows.length)].pair as "BTC/USD" | "ETH/USD" | "SOL/USD";
      const type = ["BUY", "SELL", "HOLD"][(Math.floor(Math.random() * 3))] as "BUY" | "SELL" | "HOLD";
      const reason = [
        "RSI oversold + VWAP support",
        "Momentum divergence detected",
        "Orderbook imbalance favors buyers",
        "MACD crossover confirms trend",
      ][Math.floor(Math.random() * 4)];
      addSignal({
        id: `signal-${Date.now()}-${asset}`,
        asset,
        type,
        reason,
        score: Math.round(Math.random() * 24 + 72),
        timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      });

      if (type === "BUY") {
        updateStrategy("strat-btc-mean-reversion", { lastSignal: type });
        if (paperPortfolio) {
          const updated = openPosition(paperPortfolio, "BTC/USD", "long", 64281, 65);
          setPaperPortfolio(updated);
        }
        setIsSimulating(true);
        setTimeout(() => {
          const sim = runMonteCarloSimulation(64281, 0.15, 0.65, 10000, 30);
          setSimulation(sim);
          setIsSimulating(false);
        }, 800);
        setIsBacktesting(true);
        setTimeout(() => {
          const backtest = runBacktest(
            "strat-btc-mean-reversion",
            "BTC/USD",
            "2025-01-01",
            "2025-01-31"
          );
          setBacktest(backtest);
          setIsBacktesting(false);
        }, 2000);
      } else if (type === "SELL") {
        updateStrategy("strat-sol-momentum", { lastSignal: type });
        if (paperPortfolio) {
          const updated = openPosition(paperPortfolio, "SOL/USD", "short", 145.67, 60);
          setPaperPortfolio(updated);
        }
        setIsSimulating(true);
        setTimeout(() => {
          const sim = runMonteCarloSimulation(145.67, 0.12, 0.8, 10000, 30);
          setSimulation(sim);
          setIsSimulating(false);
        }, 800);
        setIsBacktesting(true);
        setTimeout(() => {
          const backtest = runBacktest(
            "strat-sol-momentum",
            "SOL/USD",
            "2025-01-01",
            "2025-01-31"
          );
          setBacktest(backtest);
          setIsBacktesting(false);
        }, 2000);
      }
    };

    loadMarketData();
    updateHistory();

    const tickerInterval = window.setInterval(loadMarketData, 7000);
    const bookInterval = window.setInterval(async () => {
      const lastPrice = Math.max(64000, Math.min(70000, 64280 + (Math.random() - 0.5) * 250));
      setBook(buildOrderBookSnapshot(lastPrice));
    }, 3200);
    const historyInterval = window.setInterval(updateHistory, 12000);

    return () => {
      isMounted = false;
      window.clearInterval(tickerInterval);
      window.clearInterval(bookInterval);
      window.clearInterval(historyInterval);
    };
  }, [addHistory, addSignal, setBook, setRows, setStatus, updateStrategy, setSimulation, setIsSimulating, setBacktest, setIsBacktesting, setPaperPortfolio, paperPortfolio]);

  return null;
}
