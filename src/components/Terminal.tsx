'use client'

import { useState, useEffect } from 'react'
import { fetchBinancePrice, fetchBinance24hrStats, fetchBinanceKlines, fetchBinanceOrderBook, type MarketData, type CandlestickData } from '@/utils/binance'
import Chart from './Chart'
import MonteCarloChart from './MonteCarloChart'
import BacktestPanel from './BacktestPanel'
import PaperTradingPanel from './PaperTradingPanel'
import AutoTradingPanel from './AutoTradingPanel'

export default function Terminal() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [btcPrice, setBtcPrice] = useState<MarketData | null>(null)
  const [ethPrice, setEthPrice] = useState<MarketData | null>(null)
  const [solPrice, setSolPrice] = useState<MarketData | null>(null)
  const [btcStats, setBtcStats] = useState<any>(null)
  const [chartData, setChartData] = useState<CandlestickData[]>([])
  const [orderBook, setOrderBook] = useState<{bids: [string, string][], asks: [string, string][]} | null>(null)
  const [signals, setSignals] = useState<string[]>([])
  const [command, setCommand] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [monteCarloData, setMonteCarloData] = useState<any>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [activePanel, setActivePanel] = useState<'monte-carlo' | 'backtest' | 'paper-trading' | 'auto-trading'>('monte-carlo')

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const [btc, eth, sol] = await Promise.all([
          fetchBinancePrice('BTCUSDT'),
          fetchBinancePrice('ETHUSDT'),
          fetchBinancePrice('SOLUSDT')
        ])
        setBtcPrice(btc)
        setEthPrice(eth)
        setSolPrice(sol)
      } catch (error) {
        console.error('Failed to fetch prices:', error)
      }
    }

    const fetchStats = async () => {
      try {
        const stats = await fetchBinance24hrStats('BTCUSDT')
        setBtcStats(stats)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    const fetchChart = async () => {
      try {
        const data = await fetchBinanceKlines('BTCUSDT', '1h', 50)
        setChartData(data)
      } catch (error) {
        console.error('Failed to fetch chart data:', error)
      }
    }

    const fetchOrderBook = async () => {
      try {
        const data = await fetchBinanceOrderBook('BTCUSDT', 10)
        setOrderBook(data)
      } catch (error) {
        console.error('Failed to fetch order book:', error)
      }
    }

    fetchPrices()
    fetchStats()
    fetchChart()
    fetchOrderBook()

    // Update prices and order book every 5 seconds
    const interval = setInterval(() => {
      fetchPrices()
      fetchOrderBook()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Generate signals when data changes
  useEffect(() => {
    generateSignals(btcPrice, btcStats, orderBook)
  }, [btcPrice, btcStats, orderBook])

  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const generateSignals = (price: MarketData | null, stats: any, orderBook: any) => {
    const newSignals: string[] = []

    if (price && stats) {
      const currentPrice = parseFloat(price.price)
      const priceChange = parseFloat(stats.priceChangePercent)

      // Price-based signals
      if (priceChange > 2) {
        newSignals.push(`🚀 BTC Momentum: +${priceChange.toFixed(2)}%`)
      } else if (priceChange < -2) {
        newSignals.push(`📉 BTC Pullback: ${priceChange.toFixed(2)}%`)
      }

      // RSI-like signal (simplified)
      const volatility = parseFloat(stats.priceChangePercent)
      if (volatility > 1) {
        newSignals.push(`📊 High Volatility: ${volatility.toFixed(2)}%`)
      }

      // Order book imbalance
      if (orderBook) {
        const totalBids = orderBook.bids.slice(0, 5).reduce((sum: number, [, qty]: [string, string]) => sum + parseFloat(qty), 0)
        const totalAsks = orderBook.asks.slice(0, 5).reduce((sum: number, [, qty]: [string, string]) => sum + parseFloat(qty), 0)
        const imbalance = ((totalBids - totalAsks) / (totalBids + totalAsks)) * 100

        if (imbalance > 10) {
          newSignals.push(`💪 Bullish Order Flow: +${imbalance.toFixed(1)}%`)
        } else if (imbalance < -10) {
          newSignals.push(`⚠️ Bearish Order Flow: ${imbalance.toFixed(1)}%`)
        }
      }
    }

    // Add some default scanning messages
    newSignals.unshift('🔍 Scanning markets...')
    newSignals.splice(1, 0, '🧠 Running AI analysis...')

    setSignals(newSignals.slice(0, 6)) // Keep only latest 6 signals
  }

  const formatChange = (change: string) => {
    const num = parseFloat(change)
    const color = num >= 0 ? 'text-green-400' : 'text-red-400'
    const sign = num >= 0 ? '+' : ''
    return <span className={color}>{sign}{num.toFixed(2)}%</span>
  }

  const runMonteCarloSimulation = async (symbol: string = 'BTC') => {
    if (!btcPrice) return

    setIsSimulating(true)
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
          currentPrice: parseFloat(btcPrice.price),
          volatility: 0.02, // 2% daily volatility
          timeHorizon: 30,
          numPaths: 1000,
          numSteps: 30
        }),
      })

      const data = await response.json()
      setMonteCarloData(data)
      setCommandHistory(prev => [...prev.slice(-4), `> Running Monte Carlo simulation for ${symbol}...`, 'Simulation complete!'])
    } catch (error) {
      console.error('Simulation failed:', error)
      setCommandHistory(prev => [...prev.slice(-4), '> Simulation failed'])
    } finally {
      setIsSimulating(false)
    }
  }

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase()
    let response = ''

    if (trimmedCmd === 'help') {
      response = 'Commands: help, status, signals, price, simulate, backtest, papertrade, autotrade, clear'
    } else if (trimmedCmd === 'status') {
      response = 'System: Online | Bots: 2 Active | Risk: Low'
    } else if (trimmedCmd === 'signals') {
      response = `Active signals: ${signals.length}`
    } else if (trimmedCmd === 'price') {
      response = btcPrice ? `BTC: $${formatPrice(btcPrice.price)}` : 'Price unavailable'
    } else if (trimmedCmd === 'simulate' || trimmedCmd === 'run simulation') {
      runMonteCarloSimulation('BTC')
      setCommand('')
      return
    } else if (trimmedCmd === 'backtest') {
      setActivePanel('backtest')
      response = 'Switched to Backtesting Panel'
    } else if (trimmedCmd === 'papertrade' || trimmedCmd === 'paper') {
      setActivePanel('paper-trading')
      response = 'Switched to Paper Trading Panel'
    } else if (trimmedCmd === 'autotrade' || trimmedCmd === 'bots') {
      setActivePanel('auto-trading')
      response = 'Switched to Auto Trading Panel'
    } else if (trimmedCmd === 'montecarlo' || trimmedCmd === 'mc') {
      setActivePanel('monte-carlo')
      response = 'Switched to Monte Carlo Panel'
    } else if (trimmedCmd === 'clear') {
      setCommandHistory([])
      setCommand('')
      return
    } else if (trimmedCmd) {
      response = `Unknown command: ${trimmedCmd}. Type 'help' for commands.`
    }

    if (response) {
      setCommandHistory(prev => [...prev.slice(-4), `> ${cmd}`, response])
    }
    setCommand('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(command)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-black text-green-400 font-mono text-sm">
      {/* Header */}
      <div className="bg-gray-900 border-b border-green-400 p-2 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-green-400 font-bold">QUANT TERMINAL v1.0</span>
          <div className="flex space-x-4 text-xs">
            <span>BTC: {btcPrice ? `$${formatPrice(btcPrice.price)}` : 'Loading...'} {btcStats && formatChange(btcStats.priceChangePercent)}</span>
            <span>ETH: {ethPrice ? `$${formatPrice(ethPrice.price)}` : 'Loading...'}</span>
            <span>SOL: {solPrice ? `$${formatPrice(solPrice.price)}` : 'Loading...'}</span>
          </div>
        </div>
        <div className="text-cyan-400">
          {currentTime ? currentTime.toLocaleTimeString() : 'Loading...'}
        </div>
      </div>

      {/* Main Terminal Area */}
      <div className="flex-1 grid grid-cols-12 grid-rows-8 gap-1 p-2">
        {/* Panel 1: AI Strategy Log */}
        <div className="col-span-3 row-span-3 bg-gray-900 border border-green-400 p-2">
          <div className="text-green-400 font-bold mb-2">AI STRATEGY LOG</div>
          <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
            {signals.map((signal, index) => (
              <div key={index} className="text-cyan-300">
                {signal}
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Main Chart */}
        <div className="col-span-6 row-span-4 bg-gray-900 border border-green-400 p-2">
          <div className="text-green-400 font-bold mb-2">MAIN CHART - BTC/USDT</div>
          <div className="h-full">
            {chartData.length > 0 ? (
              <Chart data={chartData} />
            ) : (
              <div className="h-full bg-gray-800 flex items-center justify-center text-gray-500">
                Loading chart...
              </div>
            )}
          </div>
        </div>

        {/* Panel 3: Order Book */}
        <div className="col-span-3 row-span-3 bg-gray-900 border border-green-400 p-2">
          <div className="text-green-400 font-bold mb-2">ORDER BOOK HEATMAP</div>
          <div className="space-y-1 text-xs">
            {orderBook ? (
              <>
                {/* Asks (Sell orders) */}
                <div className="space-y-1">
                  {orderBook.asks.slice(0, 3).map(([price, quantity], index) => (
                    <div key={`ask-${index}`} className="flex justify-between">
                      <span className="text-red-400">{parseFloat(price).toFixed(2)}</span>
                      <span>{parseFloat(quantity).toFixed(4)}</span>
                    </div>
                  ))}
                </div>
                <div className="text-green-400 text-center py-1 border-t border-gray-700 text-xs">
                  Spread: {orderBook.asks[0] && orderBook.bids[0] ?
                    (parseFloat(orderBook.asks[0][0]) - parseFloat(orderBook.bids[0][0])).toFixed(2) : 'N/A'}
                </div>
                {/* Bids (Buy orders) */}
                <div className="space-y-1">
                  {orderBook.bids.slice(0, 3).map(([price, quantity], index) => (
                    <div key={`bid-${index}`} className="flex justify-between">
                      <span className="text-green-400">{parseFloat(price).toFixed(2)}</span>
                      <span>{parseFloat(quantity).toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-gray-500">Loading order book...</div>
            )}
          </div>
        </div>

        {/* Panel 4: Simulation Lab (Monte Carlo & Backtest) */}
        <div className="col-span-6 row-span-4 bg-gray-900 border border-green-400 p-2">
          <div className="text-green-400 font-bold mb-2 flex justify-between items-center">
            <span>SIMULATION LAB</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setActivePanel('monte-carlo')}
                className={`px-2 py-1 text-xs rounded ${activePanel === 'monte-carlo' ? 'bg-green-600 text-black' : 'bg-gray-700 text-green-400'}`}
              >
                Monte Carlo
              </button>
              <button
                onClick={() => setActivePanel('backtest')}
                className={`px-2 py-1 text-xs rounded ${activePanel === 'backtest' ? 'bg-green-600 text-black' : 'bg-gray-700 text-green-400'}`}
              >
                Backtest
              </button>
              <button
                onClick={() => setActivePanel('paper-trading')}
                className={`px-2 py-1 text-xs rounded ${activePanel === 'paper-trading' ? 'bg-green-600 text-black' : 'bg-gray-700 text-green-400'}`}
              >
                Paper Trading
              </button>
              <button
                onClick={() => setActivePanel('auto-trading')}
                className={`px-2 py-1 text-xs rounded ${activePanel === 'auto-trading' ? 'bg-green-600 text-black' : 'bg-gray-700 text-green-400'}`}
              >
                Auto Trading
              </button>
            </div>
          </div>
          <div className="h-full">
            {activePanel === 'monte-carlo' ? (
              <>
                {isSimulating && <span className="text-yellow-400 animate-pulse">Running...</span>}
                <MonteCarloChart data={monteCarloData} />
              </>
            ) : activePanel === 'backtest' ? (
              <BacktestPanel symbol="BTCUSDT" />
            ) : activePanel === 'paper-trading' ? (
              <PaperTradingPanel />
            ) : (
              <AutoTradingPanel />
            )}
          </div>
        </div>

        {/* Panel 5: System Status & Strategies */}
        <div className="col-span-3 row-span-3 bg-gray-900 border border-green-400 p-2">
          <div className="text-green-400 font-bold mb-2">SYSTEM STATUS & STRATEGIES</div>
          <div className="text-xs space-y-1">
            <div>Data Latency: <span className="text-green-400">12ms</span></div>
            <div>Active Bots: <span className="text-yellow-400">2</span></div>
            <div>PnL: <span className="text-green-400">+2.4%</span></div>
            <div>Risk Exposure: <span className="text-cyan-400">Low</span></div>
            <div>Connection: <span className="text-green-400">Binance OK</span></div>
            <div className="border-t border-gray-700 pt-1 mt-1">
              <div className="text-yellow-400 font-semibold">Active Strategies:</div>
              <div className="ml-2">
                <div>📈 Trend Following: <span className="text-green-400">Active</span></div>
                <div>🔄 Mean Reversion: <span className="text-cyan-400">Monitoring</span></div>
                <div>📊 Volatility Breakout: <span className="text-yellow-400">Standby</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 6: Execution History */}
        <div className="col-span-3 row-span-2 bg-gray-900 border border-green-400 p-2">
          <div className="text-green-400 font-bold mb-2">EXECUTION HISTORY</div>
          <div className="text-xs space-y-1 overflow-hidden">
            <div className="flex justify-between">
              <span>2024-01-15 14:30:22</span>
              <span className="text-green-400">BUY BTC 0.01 @ 44500</span>
            </div>
            <div className="flex justify-between">
              <span>2024-01-15 14:25:10</span>
              <span className="text-red-400">SELL ETH 0.5 @ 2800</span>
            </div>
            <div className="flex justify-between">
              <span>2024-01-15 14:20:05</span>
              <span className="text-yellow-400">SIGNAL: BTC Mean Reversion</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer/Command Line */}
      <div className="bg-gray-900 border-t border-green-400 p-2">
        <div className="space-y-1">
          {commandHistory.slice(-3).map((line, index) => (
            <div key={index} className="text-xs text-gray-400">
              {line}
            </div>
          ))}
          <div className="flex items-center">
            <span className="text-green-400 mr-2">&gt;</span>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent text-green-400 outline-none"
              placeholder="Type 'help' for commands (try 'simulate', 'backtest', 'papertrade', or 'autotrade')..."
            />
            <span className="text-green-400 animate-pulse">_</span>
          </div>
        </div>
      </div>
    </div>
  )
}