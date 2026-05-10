'use client'

import { useEffect, useRef } from 'react'
import { createChart, IChartApi, ISeriesApi, CandlestickData, CandlestickSeries, LineSeries, ColorType } from 'lightweight-charts'
import { calculateSMA, calculateRSI } from '@/utils/indicators'

interface ChartProps {
  data: CandlestickData[]
  width?: number
  height?: number
}

export default function Chart({ data, width = 600, height = 400 }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const sma20Ref = useRef<ISeriesApi<'Line'> | null>(null)
  const rsiRef = useRef<ISeriesApi<'Line'> | null>(null)
  const dataRef = useRef<CandlestickData[]>(data)

  useEffect(() => {
    dataRef.current = data
  }, [data])

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
        timeVisible: true,
        secondsVisible: false,
      },
    })

    // Create candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00ff00',
      downColor: '#ff0000',
      borderVisible: false,
      wickUpColor: '#00ff00',
      wickDownColor: '#ff0000',
    })

    // Create SMA 20 line
    const sma20Series = chart.addSeries(LineSeries, {
      color: '#ffff00',
      lineWidth: 2,
      title: 'SMA 20',
    })

    // Create RSI indicator (in separate pane)
    const rsiSeries = chart.addSeries(LineSeries, {
      color: '#00ffff',
      lineWidth: 1,
      title: 'RSI',
      priceScaleId: 'rsi',
    })

    // Configure RSI scale
    chart.priceScale('rsi').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    })

    chartRef.current = chart
    seriesRef.current = candlestickSeries
    sma20Ref.current = sma20Series
    rsiRef.current = rsiSeries

    // Set initial data
    if (dataRef.current.length > 0) {
      candlestickSeries.setData(dataRef.current)

      // Calculate and set indicators
      const closes = dataRef.current.map(d => d.close)
      const sma20Data = calculateSMA(closes, 20)
      const rsiData = calculateRSI(closes, 14)

      const sma20ChartData = dataRef.current.slice(19).map((d, i) => ({
        time: d.time,
        value: sma20Data[i]
      }))

      const rsiChartData = dataRef.current.slice(13).map((d, i) => ({
        time: d.time,
        value: rsiData[i]
      }))

      sma20Series.setData(sma20ChartData)
      rsiSeries.setData(rsiChartData)

      chart.timeScale().fitContent()
    }

    return () => {
      chart.remove()
    }
  }, [width, height])

  useEffect(() => {
    if (seriesRef.current && sma20Ref.current && rsiRef.current && data.length > 0) {
      seriesRef.current.setData(data)

      // Update indicators
      const closes = data.map(d => d.close)
      const sma20Data = calculateSMA(closes, 20)
      const rsiData = calculateRSI(closes, 14)

      const sma20ChartData = data.slice(19).map((d, i) => ({
        time: d.time,
        value: sma20Data[i]
      }))

      const rsiChartData = data.slice(13).map((d, i) => ({
        time: d.time,
        value: rsiData[i]
      }))

      sma20Ref.current.setData(sma20ChartData)
      rsiRef.current.setData(rsiChartData)

      if (chartRef.current) {
        chartRef.current.timeScale().fitContent()
      }
    }
  }, [data])

  return <div ref={chartContainerRef} className="w-full h-full" />
}