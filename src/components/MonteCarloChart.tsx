'use client'

import { useEffect, useRef } from 'react'
import { createChart, IChartApi, LineData } from 'lightweight-charts'

interface MonteCarloData {
  statistics: {
    mean: number
    median: number
    stdDev: number
    percentile5: number
    percentile95: number
    profitProb: number
    lossProb: number
    min: number
    max: number
    currentPrice: number
  }
  samplePaths: number[][]
  simulationParams: {
    currentPrice: number
    volatility: number
    timeHorizon: number
    numPaths: number
    numSteps: number
  }
}

interface MonteCarloChartProps {
  data: MonteCarloData | null
  width?: number
  height?: number
}

export default function MonteCarloChart({ data, width = 600, height = 400 }: MonteCarloChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width,
      height,
      layout: {
        background: { color: '#000000' },
        textColor: '#00ff00',
      },
      grid: {
        vertLines: { color: '#1a1a1a' },
        horzLines: { color: '#1a1a1a' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#00ff00',
      },
      timeScale: {
        borderColor: '#00ff00',
        timeVisible: false,
      },
    })

    chartRef.current = chart

    return () => {
      chart.remove()
    }
  }, [width, height])

  useEffect(() => {
    if (!chartRef.current || !data) return

    const chart = chartRef.current

    // Clear existing series by removing and recreating chart
    // In production, you'd want to properly manage series

    // Add sample price paths (light gray lines)
    data.samplePaths.slice(0, 20).forEach((path) => {
      const series = chart.addSeries('Line' as any, {
        color: 'rgba(128, 128, 128, 0.2)',
        lineWidth: 1,
        priceLineVisible: false,
      })

      const pathData: LineData[] = path.map((price, step) => ({
        time: step as any,
        value: price,
      }))

      series.setData(pathData)
    })

    // Add mean line (yellow)
    const meanSeries = chart.addSeries('Line' as any, {
      color: '#ffff00',
      lineWidth: 3,
      title: 'Expected Price',
    })

    const meanData: LineData[] = []
    for (let step = 0; step <= data.simulationParams.numSteps; step++) {
      const timeProgress = step / data.simulationParams.numSteps
      const meanPrice = data.simulationParams.currentPrice +
        (data.statistics.mean - data.simulationParams.currentPrice) * timeProgress
      meanData.push({
        time: step as any,
        value: meanPrice,
      })
    }
    meanSeries.setData(meanData)

    // Add current price line (cyan)
    const currentPriceSeries = chart.addSeries('Line' as any, {
      color: '#00ffff',
      lineWidth: 2,
      lineStyle: 2, // Dashed
      title: 'Current Price',
    })

    const currentPriceData: LineData[] = []
    for (let step = 0; step <= data.simulationParams.numSteps; step++) {
      currentPriceData.push({
        time: step as any,
        value: data.simulationParams.currentPrice,
      })
    }
    currentPriceSeries.setData(currentPriceData)

    chart.timeScale().fitContent()
  }, [data])

  if (!data) {
    return (
      <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-lg mb-2">🎲 Monte Carlo Simulation</div>
          <div>Type &apos;simulate&apos; in the command line to run</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Statistics Panel */}
      <div className="bg-gray-900 p-2 text-xs space-y-1 border-b border-green-400">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-cyan-400 font-bold">Expected: ${data.statistics.mean.toFixed(2)}</div>
            <div className="text-yellow-400">Median: ${data.statistics.median.toFixed(2)}</div>
            <div className="text-gray-400">Std Dev: ${data.statistics.stdDev.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-green-400">Profit Prob: {(data.statistics.profitProb * 100).toFixed(1)}%</div>
            <div className="text-red-400">Loss Prob: {(data.statistics.lossProb * 100).toFixed(1)}%</div>
            <div className="text-cyan-400">Range: ${data.statistics.min.toFixed(2)} - ${data.statistics.max.toFixed(2)}</div>
          </div>
        </div>
        <div className="text-gray-500">
          5th-95th: ${data.statistics.percentile5.toFixed(2)} - ${data.statistics.percentile95.toFixed(2)}
        </div>
      </div>

      {/* Chart */}
      <div ref={chartContainerRef} className="flex-1" />
    </div>
  )
}