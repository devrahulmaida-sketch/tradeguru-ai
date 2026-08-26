// Real-Time Candlestick & Market Simulation Engine with Technical Indicators

export function generateSeedCandles(basePrice, count = 60, volatility = 0.002) {
  const candles = [];
  let currentPrice = basePrice * 0.985; // start slightly below
  const now = Date.now();
  const timeframeMs = 60 * 1000; // 1 minute candles

  for (let i = count; i >= 0; i--) {
    const time = new Date(now - i * timeframeMs);
    const trendDrift = (Math.random() - 0.48) * volatility * currentPrice;
    const open = currentPrice;
    const change = trendDrift + (Math.random() - 0.5) * volatility * currentPrice;
    const close = Math.max(10, open + change);
    const high = Math.max(open, close) + Math.random() * volatility * currentPrice * 0.8;
    const low = Math.min(open, close) - Math.random() * volatility * currentPrice * 0.8;
    const volume = Math.floor(500 + Math.random() * 3500 * (1 + Math.abs(change) / (currentPrice * volatility)));

    candles.push({
      time: time.getTime(),
      timeFormatted: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: volume
    });

    currentPrice = close;
  }

  return calculateIndicators(candles);
}

export function calculateIndicators(candles) {
  if (!candles || candles.length === 0) return [];

  // EMA Calculation helper
  const calcEMA = (period, dataKey = 'close') => {
    const k = 2 / (period + 1);
    let ema = candles[0][dataKey];
    return candles.map((c, idx) => {
      if (idx === 0) return ema;
      ema = c[dataKey] * k + ema * (1 - k);
      return Number(ema.toFixed(2));
    });
  };

  const ema9 = calcEMA(9);
  const ema21 = calcEMA(21);
  const ema50 = calcEMA(50);

  // VWAP Calculation
  let cumulativeTypicalVol = 0;
  let cumulativeVol = 0;
  const vwap = candles.map((c) => {
    const typicalPrice = (c.high + c.low + c.close) / 3;
    cumulativeTypicalVol += typicalPrice * c.volume;
    cumulativeVol += c.volume;
    return Number((cumulativeTypicalVol / (cumulativeVol || 1)).toFixed(2));
  });

  // RSI Calculation (14 period)
  const rsiPeriod = 14;
  let gains = 0;
  let losses = 0;
  const rsi = [];

  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      rsi.push(50);
      continue;
    }
    const diff = candles[i].close - candles[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    if (i <= rsiPeriod) {
      gains += gain;
      losses += loss;
      rsi.push(50);
    } else {
      gains = (gains * (rsiPeriod - 1) + gain) / rsiPeriod;
      losses = (losses * (rsiPeriod - 1) + loss) / rsiPeriod;
      if (losses === 0) {
        rsi.push(100);
      } else {
        const rs = gains / losses;
        const rsiVal = 100 - 100 / (1 + rs);
        rsi.push(Number(rsiVal.toFixed(1)));
      }
    }
  }

  return candles.map((c, i) => ({
    ...c,
    ema9: ema9[i],
    ema21: ema21[i],
    ema50: ema50[i],
    vwap: vwap[i],
    rsi: rsi[i] || 50
  }));
}

// Candlestick Pattern & Setup Detector
export function detectPatterns(candles) {
  if (!candles || candles.length < 5) return null;
  const current = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const prev2 = candles[candles.length - 3];

  const body = Math.abs(current.close - current.open);
  const upperWick = current.high - Math.max(current.open, current.close);
  const lowerWick = Math.min(current.open, current.close) - current.low;
  const totalRange = current.high - current.low || 0.01;

  const patterns = [];

  // 1. Hammer / Bullish Pinbar (Steve Nison)
  if (lowerWick >= 2 * body && upperWick <= body * 0.4 && current.close >= prev.close * 0.998) {
    patterns.push({
      name: "Bullish Hammer / Pinbar Rejection",
      bias: "BULLISH",
      book: "Japanese Candlestick Charting Techniques (Steve Nison)",
      principle: "Lower wick shows aggressive buyers defending lower price levels. Smart money absorbs selling pressure.",
      reliability: "High"
    });
  }

  // 2. Shooting Star / Bearish Pinbar
  if (upperWick >= 2 * body && lowerWick <= body * 0.4) {
    patterns.push({
      name: "Bearish Shooting Star / Liquidity Rejection",
      bias: "BEARISH",
      book: "Japanese Candlestick Charting Techniques (Steve Nison)",
      principle: "Buyers attempted to push higher but institutions dumped heavy supply into the top wick.",
      reliability: "High"
    });
  }

  // 3. Bullish Engulfing
  if (prev.close < prev.open && current.close > current.open && current.close > prev.open && current.open < prev.close) {
    patterns.push({
      name: "Bullish Engulfing",
      bias: "BULLISH",
      book: "Japanese Candlestick Charting Techniques (Steve Nison) & Al Brooks",
      principle: "Bullish momentum completely overtakes the previous bear candle. Trend reversal confirmation.",
      reliability: "Very High"
    });
  }

  // 4. Bearish Engulfing
  if (prev.close > prev.open && current.close < current.open && current.close < prev.open && current.open > prev.close) {
    patterns.push({
      name: "Bearish Engulfing",
      bias: "BEARISH",
      book: "Steve Nison & Al Brooks Bar-by-Bar",
      principle: "Institutional sellers took full control, obliterating previous session buyers.",
      reliability: "Very High"
    });
  }

  // 5. Al Brooks 20 EMA Pullback / Second Entry
  if (current.ema21 && Math.abs(current.low - current.ema21) / current.close < 0.0015 && current.close > current.ema21 && current.close > current.open) {
    patterns.push({
      name: "Al Brooks 20 EMA Trend Pullback (H2 / Long)",
      bias: "BULLISH",
      book: "Reading Price Charts Bar by Bar (Al Brooks)",
      principle: "Institutions use the 20-period EMA as dynamic support in a trending market. High probability trend continuation entry.",
      reliability: "Exceptional"
    });
  }

  // 6. Smart Money Fair Value Gap (FVG) / Order Block
  if (current.low > prev2.high) {
    patterns.push({
      name: "Bullish Fair Value Gap (FVG) Expansion",
      bias: "BULLISH",
      book: "Smart Money Concepts & ICT Methodology",
      principle: "Sudden institutional volume left an imbalance between Candle 1 High and Candle 3 Low. Price will likely retest and slingshot.",
      reliability: "High"
    });
  }

  // 7. Wyckoff Spring (False breakdown and swift reclaim)
  if (prev.low < Math.min(...candles.slice(-10, -2).map(c => c.low)) && current.close > prev.open) {
    patterns.push({
      name: "Wyckoff Spring / Liquidity Purge",
      bias: "BULLISH",
      book: "The Wyckoff Method (Richard Wyckoff)",
      principle: "Smart money pierced below support to trigger retail stop-losses (liquidity raid), then immediately bought up the order book.",
      reliability: "Exceptional"
    });
  }

  return patterns.length > 0 ? patterns[0] : null;
}

// Generate Real-time Trade Setup with Risk/Reward
export function evaluateRealTimeTradeSetup(candles, symbolInfo) {
  if (!candles || candles.length < 10) return null;
  const current = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const pattern = detectPatterns(candles);

  const isBullish = current.close > current.ema21 && current.rsi < 68;
  const isBearish = current.close < current.ema21 && current.rsi > 32;

  let bias = "NEUTRAL";
  let setupName = "Consolidation / Range Build-up";
  let bookRef = "Bob Volman - Understanding Price Action";
  let rationale = "Price is compressing inside a narrow zone. Wait for a clean breakout with volume before placing capital at risk.";
  let entry = current.close;
  let sl = Number((entry * 0.995).toFixed(2));
  let tp1 = Number((entry * 1.01).toFixed(2));
  let tp2 = Number((entry * 1.018).toFixed(2));
  let rr = "1:2.0";

  if (pattern && pattern.bias === "BULLISH") {
    bias = "BUY";
    setupName = pattern.name;
    bookRef = pattern.book;
    rationale = pattern.principle;
    entry = Number((current.close + symbolInfo.tickSize).toFixed(2));
    sl = Number((Math.min(current.low, prev.low) - symbolInfo.tickSize * 2).toFixed(2));
    const risk = entry - sl;
    tp1 = Number((entry + risk * 1.8).toFixed(2));
    tp2 = Number((entry + risk * 2.8).toFixed(2));
    rr = `1:${(1.8).toFixed(1)}`;
  } else if (pattern && pattern.bias === "BEARISH") {
    bias = "SELL";
    setupName = pattern.name;
    bookRef = pattern.book;
    rationale = pattern.principle;
    entry = Number((current.close - symbolInfo.tickSize).toFixed(2));
    sl = Number((Math.max(current.high, prev.high) + symbolInfo.tickSize * 2).toFixed(2));
    const risk = sl - entry;
    tp1 = Number((entry - risk * 1.8).toFixed(2));
    tp2 = Number((entry - risk * 2.8).toFixed(2));
    rr = `1:${(1.8).toFixed(1)}`;
  } else if (isBullish && current.rsi > 52 && current.rsi < 65) {
    bias = "BUY";
    setupName = "Trend Continuation over EMA 21 & VWAP";
    bookRef = "John J. Murphy - Technical Analysis of the Financial Markets";
    rationale = "Price is holding above both 21 EMA and VWAP with healthy momentum. Trend is your friend.";
    entry = current.close;
    sl = Number((current.ema21 * 0.997).toFixed(2));
    const risk = entry - sl;
    tp1 = Number((entry + risk * 2.0).toFixed(2));
    tp2 = Number((entry + risk * 3.0).toFixed(2));
    rr = "1:2.0";
  } else if (isBearish && current.rsi < 48 && current.rsi > 35) {
    bias = "SELL";
    setupName = "Bearish Breakdown below VWAP & EMA Ribbon";
    bookRef = "Dr. Alexander Elder - Trading for a Living (Triple Screen)";
    rationale = "Sellers dominant under VWAP. Higher timeframe tide is down, intraday ripple confirms breakdown.";
    entry = current.close;
    sl = Number((current.ema21 * 1.003).toFixed(2));
    const risk = sl - entry;
    tp1 = Number((entry - risk * 2.0).toFixed(2));
    tp2 = Number((entry - risk * 3.0).toFixed(2));
    rr = "1:2.0";
  }

  // Psychology advice from Mark Douglas
  const psychologyAdvice = [
    "Mark Douglas Rule: Accept the full risk of ₹" + Math.abs(entry - sl).toFixed(2) + " per unit before entering.",
    "Jesse Livermore Wisdom: Big money is made in sitting tight, not in overtrading.",
    "Al Brooks Rule: Do not move your Stop Loss to break-even prematurely. Let the trade breathe.",
    "Alexander Elder: If this setup invalidates your thesis, cut the loss immediately without ego."
  ];
  const selectedPsychology = psychologyAdvice[Math.floor(Math.random() * psychologyAdvice.length)];

  return {
    bias,
    setupName,
    bookRef,
    rationale,
    entry,
    sl,
    tp1,
    tp2,
    rr,
    psychologyAdvice: selectedPsychology,
    timestamp: Date.now()
  };
}
