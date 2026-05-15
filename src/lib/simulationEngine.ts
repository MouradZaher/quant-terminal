"use client";

export type SimulationResult = {
  id: string;
  asset: string;
  paths: number[][];
  mean: number;
  stdDev: number;
  percentile5: number;
  percentile25: number;
  percentile50: number;
  percentile75: number;
  percentile95: number;
  expectedValue: number;
  maxDrawdown: number;
  winRate: number;
  sharpeRatio: number;
  timestamp: string;
  pathCount: number;
  horizonDays: number;
};

function generateGBMPath(
  initialPrice: number,
  mu: number,
  sigma: number,
  steps: number
): number[] {
  const path = [initialPrice];
  const dt = 1 / 252;
  for (let i = 0; i < steps; i++) {
    const z = Math.random() * 2 - 1;
    const drift = (mu - (sigma * sigma) / 2) * dt;
    const diffusion = sigma * Math.sqrt(dt) * z;
    const nextPrice = path[path.length - 1] * Math.exp(drift + diffusion);
    path.push(nextPrice);
  }
  return path;
}

function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

export function runMonteCarloSimulation(
  assetPrice: number,
  annualReturn: number = 0.15,
  volatility: number = 0.65,
  pathCount: number = 10000,
  horizonDays: number = 30
): SimulationResult {
  const paths: number[][] = [];
  const steps = horizonDays;
  const endPrices: number[] = [];

  for (let i = 0; i < pathCount; i++) {
    const path = generateGBMPath(assetPrice, annualReturn, volatility, steps);
    paths.push(path);
    endPrices.push(path[path.length - 1]);
  }

  const mean = endPrices.reduce((a, b) => a + b, 0) / endPrices.length;
  const variance =
    endPrices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) /
    endPrices.length;
  const stdDev = Math.sqrt(variance);

  const returns = endPrices.map((price) => (price - assetPrice) / assetPrice);
  const winRate =
    (returns.filter((r) => r > 0).length / returns.length) * 100;

  const expectedValue = returns.reduce((a, b) => a + b, 0) / returns.length;
  const sharpeRatio = expectedValue / (stdDev / assetPrice);

  const pricesAllSteps = paths.map((path) => path[path.length - 1]);
  const drawdownsPerPath = paths.map((path) => {
    let maxPrice = path[0];
    let maxDD = 0;
    for (let price of path) {
      maxPrice = Math.max(maxPrice, price);
      const dd = (maxPrice - price) / maxPrice;
      maxDD = Math.max(maxDD, dd);
    }
    return maxDD;
  });
  const maxDrawdown =
    drawdownsPerPath.reduce((a, b) => a + b, 0) / drawdownsPerPath.length;

  return {
    id: `sim-${Date.now()}`,
    asset: "BTC/USD",
    paths: paths.slice(0, 100),
    mean,
    stdDev,
    percentile5: percentile(endPrices, 5),
    percentile25: percentile(endPrices, 25),
    percentile50: percentile(endPrices, 50),
    percentile75: percentile(endPrices, 75),
    percentile95: percentile(endPrices, 95),
    expectedValue: expectedValue * 100,
    maxDrawdown: maxDrawdown * 100,
    winRate,
    sharpeRatio,
    timestamp: new Date().toLocaleTimeString(),
    pathCount,
    horizonDays,
  };
}
