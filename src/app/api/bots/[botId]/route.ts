import { NextRequest, NextResponse } from 'next/server'
import { tradingBots } from '../route'

// GET /api/bots/[botId] - Get specific bot
export async function GET(
  request: NextRequest,
  { params }: { params: { botId: string } }
) {
  try {
    const botId = params.botId

    if (!tradingBots[botId]) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 })
    }

    const bot = tradingBots[botId]

    // Calculate current performance
    const performance = calculateBotPerformance(bot)

    return NextResponse.json({
      ...bot,
      performance
    })
  } catch (error) {
    console.error('Get bot error:', error)
    return NextResponse.json({ error: 'Failed to get bot' }, { status: 500 })
  }
}

// PUT /api/bots/[botId] - Update bot
export async function PUT(
  request: NextRequest,
  { params }: { params: { botId: string } }
) {
  try {
    const botId = params.botId

    if (!tradingBots[botId]) {
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

// DELETE /api/bots/[botId] - Delete bot
export async function DELETE(
  request: NextRequest,
  { params }: { params: { botId: string } }
) {
  try {
    const botId = params.botId

    if (!tradingBots[botId]) {
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

// Calculate bot performance (mock implementation)
function calculateBotPerformance(bot: any) {
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