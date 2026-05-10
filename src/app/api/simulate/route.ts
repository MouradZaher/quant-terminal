import { NextRequest, NextResponse } from 'next/server'

// Monte Carlo simulation for price paths
function monteCarloSimulation(
  currentPrice: number,
  volatility: number,
  timeHorizon: number = 30, // days
  numPaths: number = 1000,
  numSteps: number = 30
) {
  const dt = timeHorizon / numSteps
  const drift = 0 // Assume no drift for simplicity
  const paths: number[][] = []

  for (let path = 0; path < numPaths; path++) {
    const pricePath: number[] = [currentPrice]

    for (let step = 1; step <= numSteps; step++) {
      // Geometric Brownian Motion
      const randomShock = Math.random() * 2 - 1 // Random between -1 and 1
      const priceChange = drift * dt + volatility * Math.sqrt(dt) * randomShock
      const newPrice = pricePath[pricePath.length - 1] * (1 + priceChange)
      pricePath.push(Math.max(newPrice, 0.01)) // Prevent negative prices
    }

    paths.push(pricePath)
  }

  return paths
}

// Calculate statistics from Monte Carlo paths
function calculateStatistics(paths: number[][]) {
  const finalPrices = paths.map(path => path[path.length - 1])
  const sortedPrices = [...finalPrices].sort((a, b) => a - b)

  const mean = finalPrices.reduce((sum, price) => sum + price, 0) / finalPrices.length
  const median = sortedPrices[Math.floor(sortedPrices.length / 2)]
  const stdDev = Math.sqrt(
    finalPrices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / finalPrices.length
  )

  // Percentiles
  const percentile5 = sortedPrices[Math.floor(sortedPrices.length * 0.05)]
  const percentile95 = sortedPrices[Math.floor(sortedPrices.length * 0.95)]

  // Probability of profit/loss
  const currentPrice = paths[0][0]
  const profitProb = finalPrices.filter(price => price > currentPrice).length / finalPrices.length
  const lossProb = 1 - profitProb

  return {
    mean,
    median,
    stdDev,
    percentile5,
    percentile95,
    profitProb,
    lossProb,
    min: Math.min(...finalPrices),
    max: Math.max(...finalPrices),
    currentPrice
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      symbol = 'BTC',
      currentPrice = 45000,
      volatility = 0.02, // 2% daily volatility
      timeHorizon = 30,
      numPaths = 1000,
      numSteps = 30
    } = body

    // Run Monte Carlo simulation
    const paths = monteCarloSimulation(currentPrice, volatility, timeHorizon, numPaths, numSteps)
    const statistics = calculateStatistics(paths)

    // Sample some paths for visualization (not all 1000)
    const samplePaths = paths.slice(0, 100)

    return NextResponse.json({
      symbol,
      statistics,
      samplePaths,
      simulationParams: {
        currentPrice,
        volatility,
        timeHorizon,
        numPaths,
        numSteps
      }
    })
  } catch (error) {
    console.error('Simulation error:', error)
    return NextResponse.json(
      { error: 'Simulation failed' },
      { status: 500 }
    )
  }
}