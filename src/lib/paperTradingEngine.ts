"use client";

export type PaperPosition = {
  id: string;
  asset: string;
  side: "long" | "short";
  entryPrice: number;
  currentPrice: number;
  size: number;
  pnl: number;
  pnlPercent: number;
  entryTime: string;
  stopLoss: number;
  takeProfit: number;
  status: "open" | "closed";
};

export type PaperTrade = {
  id: string;
  positionId: string;
  asset: string;
  side: "long" | "short";
  entryPrice: number;
  exitPrice: number;
  size: number;
  pnl: number;
  pnlPercent: number;
  entryTime: string;
  exitTime: string;
  duration: string;
};

export type PaperPortfolio = {
  id: string;
  initialCapital: number;
  currentBalance: number;
  equity: number;
  totalPnL: number;
  totalPnLPercent: number;
  openPositions: PaperPosition[];\n  closedTrades: PaperTrade[];\n  winRate: number;\n  averageWin: number;\n  averageLoss: number;\n  largestWin: number;\n  largestLoss: number;\n  timestamp: string;\n};\n\nconst INITIAL_CAPITAL = 100000;\nconst POSITION_SIZE = 0.5; // Risk 0.5% per trade\n\nfunction calculateKellyPosition(\n  winRate: number,\n  avgWin: number,\n  avgLoss: number,\n  capital: number\n): number {\n  if (avgLoss === 0) return 0;\n  const b = avgWin / avgLoss;\n  const p = winRate / 100;\n  const q = 1 - p;\n  const kelly = (p * b - q) / b;\n  const clipped = Math.max(0.01, Math.min(kelly, 0.1));\n  return capital * clipped;\n}\n\nexport function createPaperPortfolio(): PaperPortfolio {\n  return {\n    id: `portfolio-${Date.now()}`,\n    initialCapital: INITIAL_CAPITAL,\n    currentBalance: INITIAL_CAPITAL,\n    equity: INITIAL_CAPITAL,\n    totalPnL: 0,\n    totalPnLPercent: 0,\n    openPositions: [],\n    closedTrades: [],\n    winRate: 0,\n    averageWin: 0,\n    averageLoss: 0,\n    largestWin: 0,\n    largestLoss: 0,\n    timestamp: new Date().toLocaleTimeString(),\n  };\n}\n\nexport function openPosition(\n  portfolio: PaperPortfolio,\n  asset: string,\n  side: \"long\" | \"short\",\n  entryPrice: number,\n  winRate: number\n): PaperPortfolio {\n  const positionSize = (portfolio.currentBalance * POSITION_SIZE) / entryPrice;\n  const riskAmount = portfolio.currentBalance * POSITION_SIZE;\n  const stopLossPercent = side === \"long\" ? 0.02 : 0.02;\n  const stopLoss = side === \"long\" \n    ? entryPrice * (1 - stopLossPercent)\n    : entryPrice * (1 + stopLossPercent);\n  const takeProfitPercent = 0.05;\n  const takeProfit = side === \"long\"\n    ? entryPrice * (1 + takeProfitPercent)\n    : entryPrice * (1 - takeProfitPercent);\n\n  const newPosition: PaperPosition = {\n    id: `pos-${Date.now()}`,\n    asset,\n    side,\n    entryPrice,\n    currentPrice: entryPrice,\n    size: positionSize,\n    pnl: 0,\n    pnlPercent: 0,\n    entryTime: new Date().toLocaleTimeString(),\n    stopLoss,\n    takeProfit,\n    status: \"open\",\n  };\n\n  return {\n    ...portfolio,\n    openPositions: [...portfolio.openPositions, newPosition],\n  };\n}\n\nexport function updatePositionPrice(\n  position: PaperPosition,\n  newPrice: number\n): PaperPosition {\n  const priceDiff = position.side === \"long\" \n    ? newPrice - position.entryPrice\n    : position.entryPrice - newPrice;\n  const pnl = priceDiff * position.size;\n  const pnlPercent = (priceDiff / position.entryPrice) * 100;\n\n  let status = position.status;\n  if (position.side === \"long\" && newPrice <= position.stopLoss) {\n    status = \"closed\";\n  } else if (position.side === \"long\" && newPrice >= position.takeProfit) {\n    status = \"closed\";\n  } else if (position.side === \"short\" && newPrice >= position.stopLoss) {\n    status = \"closed\";\n  } else if (position.side === \"short\" && newPrice <= position.takeProfit) {\n    status = \"closed\";\n  }\n\n  return {\n    ...position,\n    currentPrice: newPrice,\n    pnl,\n    pnlPercent,\n    status,\n  };\n}\n\nexport function closePosition(\n  portfolio: PaperPortfolio,\n  position: PaperPosition,\n  exitPrice: number\n): PaperPortfolio {\n  const priceDiff = position.side === \"long\"\n    ? exitPrice - position.entryPrice\n    : position.entryPrice - exitPrice;\n  const pnl = priceDiff * position.size;\n  const pnlPercent = (priceDiff / position.entryPrice) * 100;\n\n  const closedTrade: PaperTrade = {\n    id: `trade-${Date.now()}`,\n    positionId: position.id,\n    asset: position.asset,\n    side: position.side,\n    entryPrice: position.entryPrice,\n    exitPrice,\n    size: position.size,\n    pnl,\n    pnlPercent,\n    entryTime: position.entryTime,\n    exitTime: new Date().toLocaleTimeString(),\n    duration: \"N/A\",\n  };\n\n  const updatedTrades = [...portfolio.closedTrades, closedTrade];\n  const winningTrades = updatedTrades.filter((t) => t.pnl > 0);\n  const losingTrades = updatedTrades.filter((t) => t.pnl < 0);\n\n  const newBalance = portfolio.currentBalance + pnl;\n  const totalPnL = updatedTrades.reduce((sum, t) => sum + t.pnl, 0);\n  const totalPnLPercent = (totalPnL / portfolio.initialCapital) * 100;\n\n  return {\n    ...portfolio,\n    currentBalance: newBalance,\n    equity: newBalance,\n    totalPnL,\n    totalPnLPercent,\n    openPositions: portfolio.openPositions.filter((p) => p.id !== position.id),\n    closedTrades: updatedTrades,\n    winRate: updatedTrades.length > 0 ? (winningTrades.length / updatedTrades.length) * 100 : 0,\n    averageWin: winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0,\n    averageLoss: losingTrades.length > 0 ? losingTrades.reduce((sum, t) => sum + Math.abs(t.pnl), 0) / losingTrades.length : 0,\n    largestWin: Math.max(...updatedTrades.map((t) => t.pnl), 0),\n    largestLoss: Math.min(...updatedTrades.map((t) => t.pnl), 0),\n    timestamp: new Date().toLocaleTimeString(),\n  };\n}\n\nexport function updatePortfolioEquity(\n  portfolio: PaperPortfolio,\n  newPrices: Record<string, number>\n): PaperPortfolio {\n  let totalOpenPnL = 0;\n\n  const updatedPositions = portfolio.openPositions.map((pos) => {\n    const newPrice = newPrices[pos.asset] || pos.currentPrice;\n    const updated = updatePositionPrice(pos, newPrice);\n    totalOpenPnL += updated.pnl;\n    return updated;\n  });\n\n  const equity = portfolio.currentBalance + totalOpenPnL;\n\n  return {\n    ...portfolio,\n    openPositions: updatedPositions,\n    equity,\n  };\n}\n