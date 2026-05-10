import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for trading bots (in production, this would be a database)
let tradingBots: { [botId: string]: TradingBot } = {}
let botCounter = 1

interface TradingBot {
  id: string
  name: string
  strategy: 'SMA Crossover' | 'RSI Strategy' | 'Trend Following' | 'Mean Reversion'
  symbol: string
  status: 'stopped' | 'running' | 'paused' | 'error'
  config: BotConfig
  performance: BotPerformance
  positions: BotPosition[]
  createdAt: number
  startedAt?: number
  lastTradeAt?: number
  errorMessage?: string
}

interface BotConfig {
  // Risk management
  maxPositionSize: number // Max position size as % of portfolio
  maxDrawdown: number // Max drawdown before stopping
  stopLoss: number // Stop loss percentage
  takeProfit: number // Take profit percentage

  // Strategy parameters
  fastPeriod?: number
  slowPeriod?: number
  rsiPeriod?: number
  rsiOverbought?: number
  rsiOversold?: number

  // Trading parameters
  orderSize: number // Base order size
  maxOrders: number // Max concurrent orders
  cooldownPeriod: number // Minutes between trades
}

interface BotPerformance {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  totalPnL: number
  winRate: number
  avgTrade: number
  bestTrade: number
  worstTrade: number
  sharpeRatio: number
  maxDrawdown: number
  currentDrawdown: number
}

interface BotPosition {
  symbol: string
  quantity: number
  entryPrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
  entryTime: number
}

// Strategy implementations
const strategies = {
  'SMA Crossover': {
    name: 'SMA Crossover',
    description: 'Trades based on fast/slow SMA crossovers',
    parameters: ['fastPeriod', 'slowPeriod']
  },
  'RSI Strategy': {
    name: 'RSI Strategy',
    description: 'Trades based on RSI overbought/oversold levels',
    parameters: ['rsiPeriod', 'rsiOverbought', 'rsiOversold']
  },
  'Trend Following': {
    name: 'Trend Following',
    description: 'Follows strong trends with momentum indicators',
    parameters: []
  },
  'Mean Reversion': {
    name: 'Mean Reversion',
    description: 'Trades against extreme price movements',
    parameters: []
  }
}

// Utility functions
function generateBotId(): string {
  return `bot_${botCounter++}_${Date.now()}`
}

function createDefaultConfig(strategy: string): BotConfig {
  const baseConfig: BotConfig = {
    maxPositionSize: 10, // 10% of portfolio
    maxDrawdown: 5, // 5% max drawdown
    stopLoss: 2, // 2% stop loss
    takeProfit: 5, // 5% take profit
    orderSize: 100, // $100 base order
    maxOrders: 3, // Max 3 concurrent orders
    cooldownPeriod: 5 // 5 minutes between trades
  }

  // Strategy-specific defaults
  switch (strategy) {
    case 'SMA Crossover':
      return { ...baseConfig, fastPeriod: 9, slowPeriod: 21 }
    case 'RSI Strategy':
      return { ...baseConfig, rsiPeriod: 14, rsiOverbought: 70, rsiOversold: 30 }
    default:
      return baseConfig
  }
}

function calculateBotPerformance(bot: TradingBot): BotPerformance {
  // This would normally calculate from actual trade history
  // For demo purposes, we'll return mock data
  return {
    totalTrades: Math.floor(Math.random() * 50) + 10,
    winningTrades: 0,
    losingTrades: 0,
    totalPnL: (Math.random() - 0.3) * 1000, // Random P&L between -300 and +700
    winRate: Math.random() * 0.4 + 0.3, // 30-70% win rate
    avgTrade: 0,
    bestTrade: Math.random() * 200 + 50,
    worstTrade: -(Math.random() * 150 + 25),
    sharpeRatio: Math.random() * 2 - 0.5, // -0.5 to 1.5
    maxDrawdown: Math.random() * 10,
    currentDrawdown: Math.random() * 5
  }
}

// GET /api/bots - Get all bots
export async function GET(request: NextRequest) {
  try {
    const bots = Object.values(tradingBots).map(bot => ({
      ...bot,
      performance: calculateBotPerformance(bot)
    }))

    return NextResponse.json(bots)
  } catch (error) {
    console.error('Get bots error:', error)
    return NextResponse.json({ error: 'Failed to get bots' }, { status: 500 })
  }
}

// POST /api/bots - Create a new bot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, strategy, symbol, config } = body

    if (!name || !strategy || !symbol) {
      return NextResponse.json({ error: 'Name, strategy, and symbol are required' }, { status: 400 })
    }

    if (!strategies[strategy as keyof typeof strategies]) {
      return NextResponse.json({ error: 'Invalid strategy' }, { status: 400 })
    }

    const botId = generateBotId()
    const bot: TradingBot = {
      id: botId,
      name,
      strategy: strategy as TradingBot['strategy'],
      symbol: symbol.toUpperCase(),
      status: 'stopped',
      config: { ...createDefaultConfig(strategy), ...config },
      performance: {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalPnL: 0,
        winRate: 0,
        avgTrade: 0,
        bestTrade: 0,
        worstTrade: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        currentDrawdown: 0
      },
      positions: [],
      createdAt: Date.now()
    }

    tradingBots[botId] = bot

    return NextResponse.json(bot)
  } catch (error) {
    console.error('Create bot error:', error)
    return NextResponse.json({ error: 'Failed to create bot' }, { status: 500 })
  }
}

// PUT /api/bots/[botId] - Update bot status or config
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const botId = url.pathname.split('/').pop()

    if (!botId || !tradingBots[botId]) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 })
    }

    const body = await request.json()
    const { action, config } = body

    const bot = tradingBots[botId]

    if (action === 'start') {
      if (bot.status === 'stopped') {
        bot.status = 'running'
        bot.startedAt = Date.now()
      }
    } else if (action === 'stop') {
      bot.status = 'stopped'
      bot.startedAt = undefined
    } else if (action === 'pause') {
      if (bot.status === 'running') {
        bot.status = 'paused'
      }
    } else if (action === 'resume') {
      if (bot.status === 'paused') {
        bot.status = 'running'
      }
    } else if (config) {
      bot.config = { ...bot.config, ...config }
    }

    return NextResponse.json(bot)
  } catch (error) {
    console.error('Update bot error:', error)
    return NextResponse.json({ error: 'Failed to update bot' }, { status: 500 })
  }
}

// DELETE /api/bots/[botId] - Delete a bot
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const botId = url.pathname.split('/').pop()

    if (!botId || !tradingBots[botId]) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 })
    }

    const bot = tradingBots[botId]

    // Stop bot if running
    if (bot.status === 'running') {
      bot.status = 'stopped'
    }

    delete tradingBots[botId]

    return NextResponse.json({ success: true, message: 'Bot deleted' })
  } catch (error) {
    console.error('Delete bot error:', error)
    return NextResponse.json({ error: 'Failed to delete bot' }, { status: 500 })
  }
}