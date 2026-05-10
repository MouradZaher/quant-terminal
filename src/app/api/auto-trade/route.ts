import { NextRequest, NextResponse } from 'next/server'

// In-memory bot storage (in production, this would be a database)
let activeBots: { [botId: string]: TradingBot } = {}

interface TradingBot {
  id: string
  name: string
  strategy: 'SMA_Crossover' | 'RSI_Strategy'
  symbol: string
  status: 'running' | 'stopped' | 'paused'
  config: BotConfig
  performance: BotPerformance
  positions: BotPosition[]
  createdAt: number
  lastActivity: number
}

interface BotConfig {
  // SMA Crossover config
  fastPeriod?: number
  slowPeriod?: number
  // RSI config
  rsiPeriod?: number
  overbought?: number
  oversold?: number
  // Risk management
  maxPositionSize: number // Max position size as % of portfolio
  stopLoss: number // Stop loss percentage
  takeProfit: number // Take profit percentage
  maxDrawdown: number // Max drawdown before stopping
  // Trading parameters
  orderSize: number // Base order size
  maxOrdersPerDay: number // Limit trading frequency
}

interface BotPerformance {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  totalPnL: number
  winRate: number
  avgWin: number
  avgLoss: number
  maxDrawdown: number
  sharpeRatio: number
  startBalance: number
  currentBalance: number
}

interface BotPosition {
  symbol: string
  side: 'long' | 'short'
  quantity: number
  entryPrice: number
  currentPrice: number
  pnl: number
  entryTime: number
}

// Strategy signal generators
function generateSMASignal(symbol: string, config: BotConfig): 'buy' | 'sell' | null {
  try {
    // Get recent price data
    const response = fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=50`)
    const data = response.json()

    if (!data || data.length < config.slowPeriod!) return null

    const closes = data.map((k: any) => parseFloat(k[4]))
    const fastSMA = calculateSMA(closes, config.fastPeriod!)
    const slowSMA = calculateSMA(closes, config.slowPeriod!)

    const currentFast = fastSMA[fastSMA.length - 1]
    const currentSlow = slowSMA[slowSMA.length - 1]
    const prevFast = fastSMA[fastSMA.length - 2]
    const prevSlow = slowSMA[slowSMA.length - 2]

    // Bullish crossover
    if (prevFast <= prevSlow && currentFast > currentSlow) {
      return 'buy'
    }
    // Bearish crossover
    if (prevFast >= prevSlow && currentFast < currentSlow) {
      return 'sell'
    }

    return null
  } catch (error) {
    console.error('SMA signal generation error:', error)
    return null
  }
}

function generateRSISignal(symbol: string, config: BotConfig): 'buy' | 'sell' | null {
  try {
    // Get recent price data
    const response = fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=50`)
    const data = response.json()

    if (!data || data.length < config.rsiPeriod!) return null

    const closes = data.map((k: any) => parseFloat(k[4]))
    const rsi = calculateRSI(closes, config.rsiPeriod!)
    const currentRSI = rsi[rsi.length - 1]

    // Oversold - buy signal
    if (currentRSI <= config.oversold!) {
      return 'buy'
    }
    // Overbought - sell signal
    if (currentRSI >= config.overbought!) {
      return 'sell'
    }

    return null
  } catch (error) {
    console.error('RSI signal generation error:', error)
    return null
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

// Risk management
function checkRiskLimits(bot: TradingBot): boolean {
  const { performance, config } = bot

  // Check max drawdown
  if (performance.maxDrawdown >= config.maxDrawdown) {
    console.log(`Bot ${bot.id}: Max drawdown limit reached (${performance.maxDrawdown}%)`)
    return false
  }

  // Check daily trade limit
  const today = new Date().toDateString()
  const todayTrades = performance.totalTrades // In production, filter by date

  if (todayTrades >= config.maxOrdersPerDay) {
    console.log(`Bot ${bot.id}: Daily trade limit reached (${config.maxOrdersPerDay})`)
    return false
  }

  return true
}

// Execute bot trading logic
async function executeBot(bot: TradingBot) {
  if (bot.status !== 'running') return

  try {
    // Generate signal based on strategy
    let signal: 'buy' | 'sell' | null = null

    switch (bot.strategy) {
      case 'SMA_Crossover':
        signal = generateSMASignal(bot.symbol, bot.config)
        break
      case 'RSI_Strategy':
        signal = generateRSISignal(bot.symbol, bot.config)
        break
    }

    if (!signal) return

    // Check risk limits
    if (!checkRiskLimits(bot)) {
      bot.status = 'paused'
      return
    }

    // Get current price
    const priceResponse = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${bot.symbol}`)
    const priceData = await priceResponse.json()
    const currentPrice = parseFloat(priceData.price)

    // Calculate position size
    const portfolioValue = bot.performance.currentBalance
    const positionSize = (portfolioValue * bot.config.maxPositionSize) / currentPrice

    // Check if we can afford the position
    const orderValue = positionSize * currentPrice
    if (orderValue > bot.performance.currentBalance) {
      console.log(`Bot ${bot.id}: Insufficient balance for order`)
      return
    }

    // Execute trade via paper trading API
    const tradeResponse = await fetch('http://localhost:3004/api/paper-trade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: `bot_${bot.id}`,
        symbol: bot.symbol,
        type: 'market',
        side: signal,
        quantity: positionSize.toFixed(6)
      }),
    })

    const tradeResult = await tradeResponse.json()

    if (tradeResult.success) {
      // Update bot performance
      bot.performance.totalTrades++
      bot.lastActivity = Date.now()

      console.log(`Bot ${bot.id}: Executed ${signal} order for ${positionSize.toFixed(6)} ${bot.symbol}`)
    }

  } catch (error) {
    console.error(`Bot ${bot.id} execution error:`, error)
  }
}

// Bot management functions
function createBot(name: string, strategy: 'SMA_Crossover' | 'RSI_Strategy', symbol: string, config: Partial<BotConfig>): TradingBot {
  const botId = `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const defaultConfig: BotConfig = {
    maxPositionSize: 0.1, // 10% of portfolio
    stopLoss: 0.05, // 5% stop loss
    takeProfit: 0.1, // 10% take profit
    maxDrawdown: 0.2, // 20% max drawdown
    orderSize: 0.01, // 0.01 BTC equivalent
    maxOrdersPerDay: 5,
    ...config
  }

  const bot: TradingBot = {
    id: botId,
    name,
    strategy,
    symbol,
    status: 'stopped',
    config: defaultConfig,
    performance: {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalPnL: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      startBalance: 10000, // $10k starting balance
      currentBalance: 10000
    },
    positions: [],
    createdAt: Date.now(),
    lastActivity: Date.now()
  }

  activeBots[botId] = bot
  return bot
}

function startBot(botId: string): boolean {
  const bot = activeBots[botId]
  if (!bot) return false

  bot.status = 'running'
  return true
}

function stopBot(botId: string): boolean {
  const bot = activeBots[botId]
  if (!bot) return false

  bot.status = 'stopped'
  return true
}

function deleteBot(botId: string): boolean {
  if (!activeBots[botId]) return false

  delete activeBots[botId]
  return true
}

// API Routes

// GET /api/auto-trade - Get all bots
export async function GET(request: NextRequest) {
  try {
    const bots = Object.values(activeBots)
    return NextResponse.json(bots)
  } catch (error) {
    console.error('Auto trade GET error:', error)
    return NextResponse.json({ error: 'Failed to get bots' }, { status: 500 })
  }
}

// POST /api/auto-trade - Create a new bot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, strategy, symbol, config } = body

    if (!name || !strategy || !symbol) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const bot = createBot(name, strategy, symbol, config)
    return NextResponse.json(bot)
  } catch (error) {
    console.error('Auto trade POST error:', error)
    return NextResponse.json({ error: 'Failed to create bot' }, { status: 500 })
  }
}

// PUT /api/auto-trade - Update bot (start/stop)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { botId, action } = body

    if (!botId || !action) {
      return NextResponse.json({ error: 'Missing botId or action' }, { status: 400 })
    }

    let success = false
    switch (action) {
      case 'start':
        success = startBot(botId)
        break
      case 'stop':
        success = stopBot(botId)
        break
      case 'delete':
        success = deleteBot(botId)
        break
    }

    if (!success) {
      return NextResponse.json({ error: 'Bot not found or action failed' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Auto trade PUT error:', error)
    return NextResponse.json({ error: 'Failed to update bot' }, { status: 500 })
  }
}

// Background bot execution (this would run on a schedule in production)
setInterval(() => {
  Object.values(activeBots).forEach(bot => {
    if (bot.status === 'running') {
      executeBot(bot)
    }
  })
}, 60000) // Run every minute