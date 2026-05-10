'use client'

import React, { useState, useEffect } from 'react'

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
  price?: number
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

interface PaperPortfolio {
  userId: string
  balance: number
  positions: Position[]
  orders: Order[]
  history: TradeHistory[]
  createdAt: number
  updatedAt: number
}

export default function PaperTradingPanel() {
  const [portfolio, setPortfolio] = useState<PaperPortfolio | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Order form state
  const [orderForm, setOrderForm] = useState({
    symbol: 'BTCUSDT',
    type: 'market' as 'market' | 'limit',
    side: 'buy' as 'buy' | 'sell',
    quantity: '',
    price: ''
  })

  // Load portfolio
  const loadPortfolio = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/paper-trade')
      const data = await response.json()
      setPortfolio(data)
      setError(null)
    } catch (err) {
      setError('Failed to load portfolio')
      console.error('Portfolio load error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Place order
  const placeOrder = async () => {
    if (!orderForm.symbol || !orderForm.quantity) {
      setError('Symbol and quantity are required')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/paper-trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: orderForm.symbol,
          type: orderForm.type,
          side: orderForm.side,
          quantity: parseFloat(orderForm.quantity),
          price: orderForm.price ? parseFloat(orderForm.price) : undefined
        }),
      })

      const result = await response.json()

      if (result.success) {
        setPortfolio(result.portfolio)
        setOrderForm(prev => ({ ...prev, quantity: '', price: '' }))
        setError(null)
        // Reload portfolio to get updated data
        await loadPortfolio()
      } else {
        setError(result.error || 'Failed to place order')
      }
    } catch (err) {
      setError('Failed to place order')
      console.error('Order placement error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Cancel order
  const cancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/paper-trade?orderId=${orderId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        await loadPortfolio()
      } else {
        setError(result.error || 'Failed to cancel order')
      }
    } catch (err) {
      setError('Failed to cancel order')
      console.error('Order cancellation error:', err)
    }
  }

  // Reset portfolio
  const resetPortfolio = async () => {
    if (confirm('Are you sure you want to reset your paper trading portfolio? This will clear all positions and history.')) {
      try {
        // This would need a separate API endpoint in production
        // For now, we'll just reload the page to reset in-memory state
        window.location.reload()
      } catch (err) {
        setError('Failed to reset portfolio')
      }
    }
  }

  useEffect(() => {
    loadPortfolio()
    // Refresh portfolio every 5 seconds
    const interval = setInterval(loadPortfolio, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const getTotalValue = () => {
    if (!portfolio) return 0
    const positionsValue = portfolio.positions.reduce((sum, pos) => sum + (pos.currentPrice * pos.quantity), 0)
    return portfolio.balance + positionsValue
  }

  const getTotalPnl = () => {
    if (!portfolio) return 0
    return portfolio.positions.reduce((sum, pos) => sum + pos.pnl, 0)
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-gray-100">
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Paper Trading</h2>
          <div className="flex space-x-2">
            <button
              onClick={loadPortfolio}
              disabled={isLoading}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={resetPortfolio}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
            >
              Reset
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* Portfolio Summary */}
        {portfolio && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-gray-400 text-sm">Balance</div>
              <div className="text-lg font-bold text-green-400">
                {formatCurrency(portfolio.balance)}
              </div>
            </div>

            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-gray-400 text-sm">Total Value</div>
              <div className="text-lg font-bold text-blue-400">
                {formatCurrency(getTotalValue())}
              </div>
            </div>

            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-gray-400 text-sm">Total P&L</div>
              <div className={`text-lg font-bold ${getTotalPnl() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(getTotalPnl())}
              </div>
            </div>

            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-gray-400 text-sm">Positions</div>
              <div className="text-lg font-bold text-purple-400">
                {portfolio.positions.length}
              </div>
            </div>
          </div>
        )}

        {/* Order Form */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-md font-bold mb-3">Place Order</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Symbol</label>
              <select
                value={orderForm.symbol}
                onChange={(e) => setOrderForm(prev => ({ ...prev, symbol: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              >
                <option value="BTCUSDT">BTC/USDT</option>
                <option value="ETHUSDT">ETH/USDT</option>
                <option value="SOLUSDT">SOL/USDT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={orderForm.type}
                onChange={(e) => setOrderForm(prev => ({ ...prev, type: e.target.value as 'market' | 'limit' }))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              >
                <option value="market">Market</option>
                <option value="limit">Limit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Side</label>
              <select
                value={orderForm.side}
                onChange={(e) => setOrderForm(prev => ({ ...prev, side: e.target.value as 'buy' | 'sell' }))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                value={orderForm.quantity}
                onChange={(e) => setOrderForm(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="0.00"
                step="0.01"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {orderForm.type === 'limit' ? 'Limit Price' : 'Market Order'}
              </label>
              {orderForm.type === 'limit' ? (
                <input
                  type="number"
                  value={orderForm.price}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                />
              ) : (
                <div className="flex items-end h-full pb-2">
                  <button
                    onClick={placeOrder}
                    disabled={isLoading}
                    className={`w-full px-4 py-2 text-sm font-medium rounded ${
                      orderForm.side === 'buy'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    } text-white disabled:bg-gray-600`}
                  >
                    {orderForm.side === 'buy' ? 'Buy' : 'Sell'} Market
                  </button>
                </div>
              )}
            </div>
          </div>

          {orderForm.type === 'limit' && (
            <div className="mt-3">
              <button
                onClick={placeOrder}
                disabled={isLoading}
                className={`px-4 py-2 text-sm font-medium rounded ${
                  orderForm.side === 'buy'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } text-white disabled:bg-gray-600`}
              >
                Place {orderForm.side === 'buy' ? 'Buy' : 'Sell'} Limit Order
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-auto">
        {/* Positions */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-md font-bold mb-3">Positions</h3>
          {portfolio?.positions.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No open positions</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {portfolio?.positions.map((position) => (
                <div key={position.symbol} className="bg-gray-700 p-3 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold">{position.symbol}</div>
                    <div className={`text-sm font-bold ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPercent(position.pnlPercent)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Qty: {position.quantity.toFixed(6)}</div>
                    <div>Avg: {formatCurrency(position.avgPrice)}</div>
                    <div>Current: {formatCurrency(position.currentPrice)}</div>
                    <div className={position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                      P&L: {formatCurrency(position.pnl)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-md font-bold mb-3">Orders</h3>
          {portfolio?.orders.filter(o => o.status === 'pending').length === 0 ? (
            <div className="text-gray-400 text-center py-8">No pending orders</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {portfolio?.orders.filter(o => o.status === 'pending').map((order) => (
                <div key={order.id} className="bg-gray-700 p-3 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold">{order.symbol}</div>
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Type: {order.type.toUpperCase()}</div>
                    <div>Side: <span className={order.side === 'buy' ? 'text-green-400' : 'text-red-400'}>{order.side.toUpperCase()}</span></div>
                    <div>Qty: {order.quantity}</div>
                    {order.price && <div>Price: {formatCurrency(order.price)}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trade History */}
        <div className="bg-gray-800 rounded-lg p-4 lg:col-span-2">
          <h3 className="text-md font-bold mb-3">Trade History</h3>
          {portfolio?.history.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No trade history</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2">Time</th>
                    <th className="text-left py-2">Symbol</th>
                    <th className="text-left py-2">Side</th>
                    <th className="text-right py-2">Quantity</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio?.history.slice(-10).reverse().map((trade) => (
                    <tr key={trade.id} className="border-b border-gray-700">
                      <td className="py-2">{new Date(trade.timestamp).toLocaleTimeString()}</td>
                      <td className="py-2">{trade.symbol}</td>
                      <td className={`py-2 ${trade.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.side.toUpperCase()}
                      </td>
                      <td className="text-right py-2">{trade.quantity.toFixed(6)}</td>
                      <td className="text-right py-2">{formatCurrency(trade.price)}</td>
                      <td className={`text-right py-2 ${trade.pnl !== undefined ? (trade.pnl >= 0 ? 'text-green-400' : 'text-red-400') : ''}`}>
                        {trade.pnl !== undefined ? formatCurrency(trade.pnl) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}