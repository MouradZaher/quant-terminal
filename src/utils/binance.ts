import { Time } from 'lightweight-charts'

export interface MarketData {
  symbol: string
  price: string
  timestamp: number
}

export interface CandlestickData {
  time: Time
  open: number
  high: number
  low: number
  close: number
}

export async function fetchBinancePrice(symbol: string = 'BTCUSDT'): Promise<MarketData> {
  const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
  const data = await response.json()
  return {
    symbol: data.symbol,
    price: data.price,
    timestamp: Date.now()
  }
}

export async function fetchBinance24hrStats(symbol: string = 'BTCUSDT') {
  const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
  return await response.json()
}

export async function fetchBinanceOrderBook(symbol: string = 'BTCUSDT', limit: number = 20): Promise<{
  bids: [string, string][]
  asks: [string, string][]
}> {
  const response = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=${limit}`)
  const data = await response.json()
  return {
    bids: data.bids,
    asks: data.asks
  }
}

export async function fetchBinanceKlines(
  symbol: string = 'BTCUSDT',
  interval: string = '1h',
  limit: number = 100
): Promise<CandlestickData[]> {
  const response = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  )
  const data = await response.json()

  return data.map((kline: any[]) => ({
    time: Math.floor(kline[0] / 1000) as Time,
    open: parseFloat(kline[1]),
    high: parseFloat(kline[2]),
    low: parseFloat(kline[3]),
    close: parseFloat(kline[4]),
  }))
}