import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for paper trading (in production, this would be a database)
let paperPortfolios: { [userId: string]: PaperPortfolio } = {}

interface PaperPortfolio {
  userId: string
  balance: number
  positions: Position[]
  orders: Order[]
  history: TradeHistory[]
  createdAt: number
  updatedAt: number
}

interface Position {
  symbol: string
  quantity: number
  avgPrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
}

interface Order {
  id: string
  symbol: string
  type: 'market' | 'limit'
  side: 'buy' | 'sell'
  quantity: number
  price?: number // for limit orders
  status: 'pending' | 'filled' | 'cancelled'
  timestamp: number
}

interface TradeHistory {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  quantity: number
  price: number
  timestamp: number
  pnl?: number
}

const INITIAL_BALANCE = 10000 // $10,000 starting balance

// Get or create paper portfolio for user
function getPaperPortfolio(userId: string = 'default'): PaperPortfolio {
  if (!paperPortfolios[userId]) {
    paperPortfolios[userId] = {
      userId,
      balance: INITIAL_BALANCE,
      positions: [],
      orders: [],
      history: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  }
  return paperPortfolios[userId]
}

// Update position prices and P&L
async function updatePositions(portfolio: PaperPortfolio) {
  for (const position of portfolio.positions) {
    try {
      // Fetch current price from Binance
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${position.symbol}`)
      const data = await response.json()
      const currentPrice = parseFloat(data.price)

      position.currentPrice = currentPrice
      position.pnl = (currentPrice - position.avgPrice) * position.quantity
      position.pnlPercent = ((currentPrice - position.avgPrice) / position.avgPrice) * 100
    } catch (error) {
      console.error(`Failed to update price for ${position.symbol}:`, error)
    }
  }
  portfolio.updatedAt = Date.now()
}

// Execute pending orders
async function executeOrders(portfolio: PaperPortfolio) {
  const pendingOrders = portfolio.orders.filter(order => order.status === 'pending')

  for (const order of pendingOrders) {
    try {
      // Get current market price
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${order.symbol}`)
      const data = await response.json()
      const marketPrice = parseFloat(data.price)

      let executePrice = marketPrice
      let shouldExecute = false

      if (order.type === 'market') {
        shouldExecute = true
      } else if (order.type === 'limit') {
        if (order.side === 'buy' && marketPrice <= (order.price || 0)) {
          executePrice = order.price || marketPrice
          shouldExecute = true
        } else if (order.side === 'sell' && marketPrice >= (order.price || 0)) {
          executePrice = order.price || marketPrice
          shouldExecute = true
        }
      }

      if (shouldExecute) {
        const totalCost = executePrice * order.quantity

        if (order.side === 'buy') {
          // Check if we have enough balance
          if (portfolio.balance >= totalCost) {
            portfolio.balance -= totalCost

            // Update or create position
            const existingPosition = portfolio.positions.find(p => p.symbol === order.symbol)
            if (existingPosition) {
              const totalQuantity = existingPosition.quantity + order.quantity
              const totalCost = (existingPosition.avgPrice * existingPosition.quantity) + (executePrice * order.quantity)
              existingPosition.avgPrice = totalCost / totalQuantity
              existingPosition.quantity = totalQuantity
            } else {
              portfolio.positions.push({
                symbol: order.symbol,
                quantity: order.quantity,
                avgPrice: executePrice,
                currentPrice: executePrice,
                pnl: 0,
                pnlPercent: 0
              })
            }

            // Add to history
            portfolio.history.push({
              id: order.id,
              symbol: order.symbol,
              side: order.side,
              quantity: order.quantity,
              price: executePrice,
              timestamp: Date.now()
            })
          } else {
            order.status = 'cancelled'
            continue
          }
        } else if (order.side === 'sell') {
          // Check if we have the position
          const position = portfolio.positions.find(p => p.symbol === order.symbol)
          if (position && position.quantity >= order.quantity) {
            position.quantity -= order.quantity
            portfolio.balance += totalCost

            // Add to history with P&L
            const entryPrice = position.avgPrice
            const pnl = (executePrice - entryPrice) * order.quantity
            portfolio.history.push({
              id: order.id,
              symbol: order.symbol,
              side: order.side,
              quantity: order.quantity,
              price: executePrice,
              timestamp: Date.now(),
              pnl
            })

            // Remove position if quantity is 0
            if (position.quantity === 0) {
              portfolio.positions = portfolio.positions.filter(p => p.symbol !== order.symbol)
            }
          } else {
            order.status = 'cancelled'
            continue
          }
        }

        order.status = 'filled'
      }
    } catch (error) {
      console.error(`Failed to execute order ${order.id}:`, error)
    }
  }
}

// GET /api/paper-trade - Get portfolio status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'default'

    const portfolio = getPaperPortfolio(userId)
    await updatePositions(portfolio)
    await executeOrders(portfolio)

    return NextResponse.json(portfolio)
  } catch (error) {
    console.error('Paper trade GET error:', error)
    return NextResponse.json({ error: 'Failed to get portfolio' }, { status: 500 })
  }
}

// POST /api/paper-trade - Place an order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId = 'default',
      symbol,
      type,
      side,
      quantity,
      price
    } = body

    if (!symbol || !type || !side || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const portfolio = getPaperPortfolio(userId)

    // Create order
    const order: Order = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      symbol: symbol.toUpperCase(),
      type,
      side,
      quantity: parseFloat(quantity),
      price: price ? parseFloat(price) : undefined,
      status: 'pending',
      timestamp: Date.now()
    }

    portfolio.orders.push(order)
    await executeOrders(portfolio)

    return NextResponse.json({
      success: true,
      order,
      portfolio: {
        balance: portfolio.balance,
        positions: portfolio.positions
      }
    })
  } catch (error) {
    console.error('Paper trade POST error:', error)
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}

// DELETE /api/paper-trade - Cancel an order
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'default'
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const portfolio = getPaperPortfolio(userId)
    const order = portfolio.orders.find(o => o.id === orderId)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === 'pending') {
      order.status = 'cancelled'
      return NextResponse.json({ success: true, message: 'Order cancelled' })
    } else {
      return NextResponse.json({ error: 'Order cannot be cancelled' }, { status: 400 })
    }
  } catch (error) {
    console.error('Paper trade DELETE error:', error)
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 })
  }
}