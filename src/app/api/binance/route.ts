import { NextRequest, NextResponse } from "next/server";

const BINANCE_API = "https://api.binance.com/api/v3";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const symbol = url.searchParams.get("symbol") || "BTCUSDT";
  const symbols = url.searchParams.get("symbols");
  const interval = url.searchParams.get("interval") || "1m";
  const limit = url.searchParams.get("limit") || "50";

  try {
    if (type === "ticker") {
      if (!symbols) {
        return NextResponse.json({ error: "Missing symbols" }, { status: 400 });
      }
      const apiUrl = `${BINANCE_API}/ticker/24hr?symbols=${encodeURIComponent(`[${symbols.split(",").map((symbol) => `\"${symbol}\"`).join(",")}]`)}`;
      const response = await fetch(apiUrl);
      const body = await response.json();
      return NextResponse.json(body);
    }

    if (type === "klines") {
      const apiUrl = `${BINANCE_API}/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${encodeURIComponent(limit)}`;
      const response = await fetch(apiUrl);
      const body = await response.json();
      return NextResponse.json(body);
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Binance proxy error" }, { status: 502 });
  }
}
