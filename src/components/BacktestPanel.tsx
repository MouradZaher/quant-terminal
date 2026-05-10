'use client'

import React, { useState, useEffect } from 'react'
import BacktestChart from './BacktestChart'
import { fetchBinanceKlines, type CandlestickData } from '@/utils/binance'

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

interface BacktestPanelProps {
  symbol: string
}

export default function BacktestPanel({ symbol }: BacktestPanelProps) {
  const [historicalData, setHistoricalData] = useState<CandlestickData[]>([])
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Backtest parameters
  const [strategy, setStrategy] = useState('SMA Crossover')
  const [timeframe, setTimeframe] = useState('1h')
  const [limit, setLimit] = useState(500)

  // Strategy-specific parameters
  const [smaParams, setSmaParams] = useState({ fastPeriod: 9, slowPeriod: 21 })
  const [rsiParams, setRsiParams] = useState({ period: 14, overbought: 70, oversold: 30 })

  // Load historical data when symbol or timeframe changes
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchBinanceKlines(symbol, timeframe, limit)
        setHistoricalData(data)
        setError(null)
      } catch (err) {
        setError('Failed to load historical data')
        console.error('Historical data error:', err)
      }
    }

    loadData()
  }, [symbol, timeframe, limit])

  const runBacktest = async () => {
    setIsLoading(true)
    setError(null)

    try {
      let params = {}
      switch (strategy) {
        case 'SMA Crossover':
          params = smaParams
          break
        case 'RSI Strategy':
          params = rsiParams
          break
      }

      const response = await fetch('/api/backtest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
          strategy,
          timeframe,
          limit,
          params,
        }),
      })

      if (!response.ok) {
        throw new Error('Backtest failed')
      }

      const result: BacktestResult = await response.json()
      setBacktestResult(result)
    } catch (err) {
      setError('Backtest failed')
      console.error('Backtest error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-gray-100">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold mb-4">Backtesting Engine</h2>

        {/* Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Strategy</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
            >
              <option value="SMA Crossover">SMA Crossover</option>
              <option value="RSI Strategy">RSI Strategy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
            >
              <option value="1m">1 Minute</option>
              <option value="5m">5 Minutes</option>
              <option value="15m">15 Minutes</option>
              <option value="1h">1 Hour</option>
              <option value="4h">4 Hours</option>
              <option value="1d">1 Day</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Data Points</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
            >
              <option value={100}>100</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
              <option value={2000}>2000</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={runBacktest}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              {isLoading ? 'Running...' : 'Run Backtest'}
            </button>
          </div>
        </div>

        {/* Strategy Parameters */}
        {strategy === 'SMA Crossover' && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fast SMA Period</label>
              <input
                type="number"
                value={smaParams.fastPeriod}
                onChange={(e) => setSmaParams(prev => ({ ...prev, fastPeriod: Number(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slow SMA Period</label>
              <input
                type="number"
                value={smaParams.slowPeriod}
                onChange={(e) => setSmaParams(prev => ({ ...prev, slowPeriod: Number(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
                min="1"
              />
            </div>
          </div>
        )}

        {strategy === 'RSI Strategy' && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">RSI Period</label>
              <input
                type="number"
                value={rsiParams.period}
                onChange={(e) => setRsiParams(prev => ({ ...prev, period: Number(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Overbought</label>
              <input
                type="number"
                value={rsiParams.overbought}
                onChange={(e) => setRsiParams(prev => ({ ...prev, overbought: Number(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
                min="1"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Oversold</label>
              <input
                type="number"
                value={rsiParams.oversold}
                onChange={(e) => setRsiParams(prev => ({ ...prev, oversold: Number(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
                min="1"
                max="100"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
      </div>

      {/* Chart and Results */}
      <div className="flex-1 p-4 overflow-auto">
        {historicalData.length > 0 ? (
          <BacktestChart data={historicalData} backtestResult={backtestResult} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Loading historical data...
          </div>
        )}
      </div>
    </div>
  )
}