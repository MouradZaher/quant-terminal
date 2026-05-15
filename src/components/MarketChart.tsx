"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, CrosshairMode, type CandlestickData, type ISeriesApi } from "lightweight-charts";
import { useMarketStore } from "@/store/marketStore";

function transformKlines(raw: unknown[]): CandlestickData[] {
  return raw.map((item) => {
    const row = item as unknown[];
    return {
      time: Number(row[0]) / 1000,
      open: Number(row[1]),
      high: Number(row[2]),
      low: Number(row[3]),
      close: Number(row[4]),
    };
  });
}

export function MarketChart() {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [loading, setLoading] = useState(true);
  const candles = useMarketStore((state) => state.candles);
  const setCandles = useMarketStore((state) => state.setCandles);

  useEffect(() => {
    const container = chartRef.current;
    if (!container) return;

    const chart = createChart(container, {
      layout: {
        background: { type: "solid", color: "#070d09" },
        textColor: "#8cff97",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(140, 255, 151, 0.08)" },
        horzLines: { color: "rgba(140, 255, 151, 0.08)" },
      },
      rightPriceScale: {
        borderColor: "rgba(140, 255, 151, 0.16)",
      },
      timeScale: {
        borderColor: "rgba(140, 255, 151, 0.16)",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#00ff7f",
      downColor: "#ff3f3f",
      borderVisible: false,
      wickUpColor: "#9fffab",
      wickDownColor: "#ff9f9f",
    });

    candleSeriesRef.current = candleSeries;
    const updateSize = () => {
      if (!container) return;
      chart.applyOptions({ width: container.clientWidth, height: 360 });
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!candles.length) return;
    const chartSeries = candleSeriesRef.current as any;
    if (chartSeries && typeof chartSeries.setData === "function") {
      chartSeries.setData(candles as CandlestickData[]);
    }
  }, [candles]);

  useEffect(() => {
    let canceled = false;

    const fetchCandles = async () => {
      try {
        const response = await fetch("/api/binance?type=klines&symbol=BTCUSDT&interval=1m&limit=50");
        const raw = (await response.json()) as unknown[];
        if (canceled || !Array.isArray(raw)) return;
        const nextCandles = transformKlines(raw);
        setCandles(nextCandles);
      } finally {
        setLoading(false);
      }
    };

    fetchCandles();
    const interval = window.setInterval(fetchCandles, 15000);
    return () => {
      canceled = true;
      window.clearInterval(interval);
    };
  }, [setCandles]);

  return (
    <div className="relative border terminal-border bg-black/20 p-4 min-h-[420px]">
      <div className="flex items-center justify-between pb-3 mb-3 border-b terminal-border text-[10px] uppercase opacity-70">
        <div>
          <div className="font-bold uppercase">BTC / USD</div>
          <div className="text-[10px] opacity-50">1m Candles · Live Feed</div>
        </div>
        <div className="text-terminal-green font-bold text-xs">Live Market Chart</div>
      </div>
      <div ref={chartRef} className="w-full h-[360px]" />
      {loading && <div className="absolute inset-0 grid place-items-center bg-black/50 text-[12px] uppercase text-terminal-green">Loading market candles...</div>}
    </div>
  );
}
