import { NextRequest, NextResponse } from 'next/server'
import { fetchBinanceKlines, type CandlestickData } from '@/utils/binance'

// Strategy definitions
interface Strategy {
  name: string
  execute: (data: CandlestickData[], params: any) => Trade[]
}

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

// Simple Moving Average Crossover Strategy
const smaCrossoverStrategy: Strategy = {
  name: 'SMA Crossover',
  execute: (data: CandlestickData[], params: { fastPeriod: number; slowPeriod: number }) => {
    const trades: Trade[] = []
    let position: 'long' | 'short' | null = null
    let entryPrice = 0
    let entryTime = 0

    // Calculate SMAs
    const fastSMA = calculateSMA(data.map(d => d.close), params.fastPeriod)
    const slowSMA = calculateSMA(data.map(d => d.close), params.slowPeriod)

    for (let i = params.slowPeriod; i < data.length - 1; i++) {
      const fastValue = fastSMA[i - params.fastPeriod + 1]
      const slowValue = slowSMA[i - params.slowPeriod + 1]
      const prevFastValue = fastSMA[i - params.fastPeriod]
      const prevSlowValue = slowSMA[i - params.slowPeriod]

      // Check for crossover signals
      const bullishCrossover = prevFastValue <= prevSlowValue && fastValue > slowValue
      const bearishCrossover = prevFastValue >= prevSlowValue && fastValue < slowValue

      if (bullishCrossover && position !== 'long') {
        // Close short position if open
        if (position === 'short') {
          const exitPrice = data[i].open
          const pnl = entryPrice - exitPrice
          trades.push({
            entryTime,
            exitTime: Number(data[i].time),
            entryPrice,
            exitPrice,
            type: 'short',
            pnl
          })
        }

        // Open long position
        position = 'long'
        entryPrice = data[i].open
        entryTime = Number(data[i].time)

      } else if (bearishCrossover && position !== 'short') {
        // Close long position if open
        if (position === 'long') {
          const exitPrice = data[i].open
          const pnl = exitPrice - entryPrice
          trades.push({
            entryTime,
            exitTime: Number(data[i].time),
            entryPrice,
            exitPrice,
            type: 'long',
            pnl
          })
        }

        // Open short position
        position = 'short'
        entryPrice = data[i].open
        entryTime = Number(data[i].time)
      }
    }

    // Close any open position at the end
    if (position && data.length > 0) {
      const exitPrice = data[data.length - 1].close
      const pnl = position === 'long' ? exitPrice - entryPrice : entryPrice - exitPrice
      trades.push({
        entryTime,
        exitTime: Number(data[data.length - 1].time),
        entryPrice,
        exitPrice,
        type: position,
        pnl
      })
    }

    return trades
  }
}

// RSI Strategy
const rsiStrategy: Strategy = {
  name: 'RSI Strategy',
  execute: (data: CandlestickData[], params: { period: number; overbought: number; oversold: number }) => {
    const trades: Trade[] = []
    let position: 'long' | 'short' | null = null
    let entryPrice = 0
    let entryTime = 0

    const closes = data.map(d => d.close)
    const rsiValues = calculateRSI(closes, params.period)

    for (let i = params.period; i < data.length - 1; i++) {
      const rsi = rsiValues[i - params.period]

      if (rsi <= params.oversold && position !== 'long') {
        // Close short position if open
        if (position === 'short') {
          const exitPrice = data[i].open
          const pnl = entryPrice - exitPrice
          trades.push({
            entryTime,
            exitTime: Number(data[i].time),
            entryPrice,
            exitPrice,
            type: 'short',
            pnl
          })
        }

        // Open long position
        position = 'long'
        entryPrice = data[i].open
        entryTime = Number(data[i].time)

      } else if (rsi >= params.overbought && position !== 'short') {
        // Close long position if open
        if (position === 'long') {
          const exitPrice = data[i].open
          const pnl = exitPrice - entryPrice
          trades.push({
            entryTime,
            exitTime: Number(data[i].time),
            entryPrice,
            exitPrice,
            type: 'long',
            pnl
          })
        }

        // Open short position
        position = 'short'
        entryPrice = data[i].open
        entryTime = Number(data[i].time)
      }
    }

    // Close any open position at the end
    if (position && data.length > 0) {
      const exitPrice = data[data.length - 1].close
      const pnl = position === 'long' ? exitPrice - entryPrice : entryPrice - exitPrice
      trades.push({
        entryTime,
        exitTime: Number(data[data.length - 1].time),
        entryPrice,
        exitPrice,
        type: position,
        pnl
      })
    }

    return trades
  }
}

// Utility functions
function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = []

  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
    result.push(sum / period)
  }

  return result
}

function calculateRSI(data: number[], period: number = 14): number[] {
  const gains: number[] = []
  const losses: number[] = []

  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1]
    gains.push(change > 0 ? change : 0)
    losses.push(change < 0 ? Math.abs(change) : 0)
  }

  const result: number[] = []

  for (let i = period - 1; i < gains.length; i++) {
    const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
    const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period

    if (avgLoss === 0) {
      result.push(100)
    } else {
      const rs = avgGain / avgLoss
      result.push(100 - (100 / (1 + rs)))
    }
  }

  return result
}

function calculateBacktestMetrics(trades: Trade[]): Omit<BacktestResult, 'strategy' | 'trades'> {
  if (trades.length === 0) {
    return {
      totalPnL: 0,
      winRate: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      totalTrades: 0,
      avgTrade: 0,
      bestTrade: 0,
      worstTrade: 0
    }
  }

  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0)
  const winningTrades = trades.filter(trade => trade.pnl > 0)
  const winRate = winningTrades.length / trades.length

  // Calculate drawdown
  let peak = 0
  let maxDrawdown = 0
  let runningPnL = 0

  for (const trade of trades) {
    runningPnL += trade.pnl
    if (runningPnL > peak) {
      peak = runningPnL
    }
    const drawdown = peak - runningPnL
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
  }

  // Simple Sharpe ratio (assuming daily returns, risk-free rate = 0)
  const returns = trades.map(trade => trade.pnl)
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
  const stdDev = Math.sqrt(returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length)
  const sharpeRatio = stdDev !== 0 ? avgReturn / stdDev : 0

  const avgTrade = totalPnL / trades.length
  const bestTrade = Math.max(...trades.map(t => t.pnl))
  const worstTrade = Math.min(...trades.map(t => t.pnl))

  return {
    totalPnL,
    winRate,
    maxDrawdown,
    sharpeRatio,
    totalTrades: trades.length,
    avgTrade,
    bestTrade,
    worstTrade
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      symbol = 'BTCUSDT',
      strategy = 'SMA Crossover',
      timeframe = '1h',
      limit = 500,
      params = {}
    } = body

    // Fetch historical data
    const historicalData = await fetchBinanceKlines(symbol, timeframe, limit)

    if (historicalData.length === 0) {
      return NextResponse.json({ error: 'No historical data available' }, { status: 400 })
    }

    // Select strategy
    let selectedStrategy: Strategy
    switch (strategy) {
      case 'SMA Crossover':
        selectedStrategy = smaCrossoverStrategy
        break
      case 'RSI Strategy':
        selectedStrategy = rsiStrategy
        break
      default:
        return NextResponse.json({ error: 'Unknown strategy' }, { status: 400 })
    }

    // Run backtest
    const trades = selectedStrategy.execute(historicalData, params)
    const metrics = calculateBacktestMetrics(trades)

    const result: BacktestResult = {
      strategy,
      trades,
      ...metrics
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Backtest error:', error)
    return NextResponse.json(
      { error: 'Backtest failed' },
      { status: 500 }
    )
  }
}