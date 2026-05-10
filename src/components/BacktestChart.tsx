'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  createChart,
  IChartApi,
  ISeriesApi,
  LineData,
  CandlestickData,
  CandlestickSeries,
  LineSeries,
  ColorType,
  CrosshairMode,
  PriceScaleMode
} from 'lightweight-charts'

interface Trade {
  entryTime: number
  exitTime: number
  entryPrice: number
  exitPrice: number
  type: 'long' | 'short'
  pnl: number
}

interface BacktestResult {
  strategy: string
  trades: Trade[]
  totalPnL: number
  winRate: number
  maxDrawdown: number
  sharpeRatio: number
  totalTrades: number
  avgTrade: number
  bestTrade: number
  worstTrade: number
}

interface BacktestChartProps {
  data: CandlestickData[]
  backtestResult: BacktestResult | null
}

export default function BacktestChart({ data, backtestResult }: BacktestChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const equitySeriesRef = useRef<ISeriesApi<'Line'> | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0a0a' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#374151',
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    })

    chartRef.current = chart

    // Create candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    })

    candlestickSeriesRef.current = candlestickSeries

    // Create equity curve series
    const equitySeries = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      title: 'Equity Curve',
      priceScaleId: 'right',
    })

    equitySeriesRef.current = equitySeries

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])

  useEffect(() => {
    if (!candlestickSeriesRef.current || !equitySeriesRef.current || !data.length) return

    // Set candlestick data
    candlestickSeriesRef.current.setData(data)

    // Calculate and set equity curve if we have backtest results
    if (backtestResult && backtestResult.trades.length > 0) {
      const equityData: LineData[] = []
      let cumulativePnL = 0

      // Sort trades by entry time
      const sortedTrades = [...backtestResult.trades].sort((a, b) => a.entryTime - b.entryTime)

      // Add initial point
      equityData.push({
        time: data[0].time as any,
        value: 0,
      })

      // Add equity points after each trade
      for (const trade of sortedTrades) {
        cumulativePnL += trade.pnl
        equityData.push({
          time: trade.exitTime as any,
          value: cumulativePnL,
        })
      }

      equitySeriesRef.current.setData(equityData)
    } else {
      equitySeriesRef.current.setData([])
    }

    // Fit content
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent()
    }
  }, [data, backtestResult])

  // Add trade markers
  useEffect(() => {
    if (!candlestickSeriesRef.current || !backtestResult) return

    const markers = []

    for (const trade of backtestResult.trades) {
      // Entry marker
      markers.push({
        time: trade.entryTime as any,
        position: trade.type === 'long' ? 'belowBar' : 'aboveBar',
        color: trade.type === 'long' ? '#10b981' : '#ef4444',
        shape: trade.type === 'long' ? 'arrowUp' : 'arrowDown',
        text: `Entry ${trade.type.toUpperCase()}`,
        size: 2,
      })

      // Exit marker
      markers.push({
        time: trade.exitTime as any,
        position: trade.type === 'long' ? 'aboveBar' : 'belowBar',
        color: trade.pnl > 0 ? '#10b981' : '#ef4444',
        shape: trade.pnl > 0 ? 'arrowUp' : 'arrowDown',
        text: `Exit ${trade.pnl > 0 ? 'WIN' : 'LOSS'} (${trade.pnl.toFixed(2)})`,
        size: 2,
      })
    }

    // candlestickSeriesRef.current.setMarkers(markers) // TODO: Fix markers API
  }, [backtestResult])

  return (
    <div className="space-y-4">
      <div ref={chartContainerRef} className="w-full h-96 bg-gray-900 rounded-lg" />

      {backtestResult && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-gray-400">Total P&L</div>
            <div className={`text-lg font-bold ${backtestResult.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${backtestResult.totalPnL.toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-gray-400">Win Rate</div>
            <div className="text-lg font-bold text-blue-400">
              {(backtestResult.winRate * 100).toFixed(1)}%
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-gray-400">Max Drawdown</div>
            <div className="text-lg font-bold text-red-400">
              ${backtestResult.maxDrawdown.toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-gray-400">Total Trades</div>
            <div className="text-lg font-bold text-gray-300">
              {backtestResult.totalTrades}
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-gray-400">Avg Trade</div>
            <div className={`text-lg font-bold ${backtestResult.avgTrade >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${backtestResult.avgTrade.toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-gray-400">Best Trade</div>
            <div className="text-lg font-bold text-green-400">
              ${backtestResult.bestTrade.toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-gray-400">Worst Trade</div>
            <div className="text-lg font-bold text-red-400">
              ${backtestResult.worstTrade.toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-gray-400">Sharpe Ratio</div>
            <div className="text-lg font-bold text-purple-400">
              {backtestResult.sharpeRatio.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}