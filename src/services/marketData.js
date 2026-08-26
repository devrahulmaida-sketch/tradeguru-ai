// Real-Time Candlestick Engine with Real Market Data & Bar-by-Bar Breakdown
import realData from '../data/realNSEData.json';

export async function fetchLiveRealCandles(symbolId) {
  // 1. If 24/7 BTC-USD is requested, fetch 100% live real candles from Coinbase REST API
  if (symbolId === 'BTCUSD') {
    try {
      const res = await fetch("https://api.exchange.coinbase.com/products/BTC-USD/candles?granularity=60");
      if (res.ok) {
        const raw = await res.json();
        // Coinbase returns [time, low, high, open, close, volume] sorted newest first
        const formatted = raw.slice(0, 60).reverse().map(([t, low, high, open, close, volume]) => {
          const date = new Date(t * 1000);
          return {
            time: t * 1000,
            timeFormatted: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            open: Number(open.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            close: Number(close.toFixed(2)),
            volume: Math.round(volume * 10)
          };
        });
        return calculateIndicators(formatted);
      }
    } catch (e) {
      console.warn("Coinbase API live fetch error, falling back to snapshot:", e);
    }
  }

  // 2. Load authentic snapshot from realNSEData
  if (realData && realData[symbolId]) {
    const candles = realData[symbolId].map(c => {
      const date = new Date(c.time);
      return {
        ...c,
        timeFormatted: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
    });
    return calculateIndicators(candles);
  }

  // 3. Fallback to realistic seed
  return generateSeedCandles(24260, 60);
}

export function generateSeedCandles(basePrice, count = 60, volatility = 0.0015) {
  const candles = [];
  let currentPrice = basePrice * 0.99;
  const now = Date.now();
  const timeframeMs = 60 * 1000;

  for (let i = count; i >= 0; i--) {
    const time = new Date(now - i * timeframeMs);
    const trendDrift = (Math.random() - 0.48) * volatility * currentPrice;
    const open = currentPrice;
    const change = trendDrift + (Math.random() - 0.5) * volatility * currentPrice;
    const close = Math.max(10, open + change);
    const high = Math.max(open, close) + Math.random() * volatility * currentPrice * 0.7;
    const low = Math.min(open, close) - Math.random() * volatility * currentPrice * 0.7;
    const volume = Math.floor(800 + Math.random() * 4000);

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

  const calcEMA = (period) => {
    const k = 2 / (period + 1);
    let ema = candles[0].close;
    return candles.map((c, idx) => {
      if (idx === 0) return ema;
      ema = c.close * k + ema * (1 - k);
      return Number(ema.toFixed(2));
    });
  };

  const ema9 = calcEMA(9);
  const ema21 = calcEMA(21);
  const ema50 = calcEMA(50);

  let cumulativeTypicalVol = 0;
  let cumulativeVol = 0;
  const vwap = candles.map((c) => {
    const typicalPrice = (c.high + c.low + c.close) / 3;
    cumulativeTypicalVol += typicalPrice * c.volume;
    cumulativeVol += c.volume;
    return Number((cumulativeTypicalVol / (cumulativeVol || 1)).toFixed(2));
  });

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

// Pro Trader Bar-by-Bar Breakdown (Al Brooks + Steve Nison)
export function explainCandleInHinglish(candle, prevCandle, instrumentName = "Asset") {
  if (!candle) return null;

  const isBullish = candle.close >= candle.open;
  const bodySize = Math.abs(candle.close - candle.open);
  const totalRange = Math.max(0.01, candle.high - candle.low);
  const upperWick = candle.high - Math.max(candle.open, candle.close);
  const lowerWick = Math.min(candle.open, candle.close) - candle.low;

  const upperWickPct = ((upperWick / totalRange) * 100).toFixed(0);
  const lowerWickPct = ((lowerWick / totalRange) * 100).toFixed(0);
  const bodyPct = ((bodySize / totalRange) * 100).toFixed(0);

  let candleType = "";
  let orderFlowMeaning = "";
  let proRule = "";
  let actionAdvice = "";
  let speechText = "";

  // Classification
  if (lowerWick >= 2 * bodySize && upperWick <= bodySize * 0.5) {
    candleType = "Hammer / Bullish Pinbar (Demand Absorption)";
    orderFlowMeaning = `Is candle me Sellers ne price ko ₹${candle.low} tak neeche girane ki puri koshish ki, lekin lower levels par Institutional Buyers (Smart Money) ne aggressive orders daal kar saari supply absorb kar li. Niche ki ${lowerWickPct}% lambi wick batati hai ki neeche ke price ko market ne reject kar diya hai.`;
    proRule = "Steve Nison Law: 'A hammer is proof that buyers stepped in when everyone was panic selling.'";
    actionAdvice = `Agar yeh 21 EMA (₹${candle.ema21}) ya Support par bani hai, to is candle ke High toot-te hi Long (BUY) ka high-probability setup banta hai. Stop Loss ₹${candle.low} ke thoda neeche rakhein.`;
    speechText = `Bhai dekho, chart par ek strong Hammer bani hai. Niche lambi wick ka matlab hai buyers ne sellers ko reject kar diya. EMA ke upar buy setup ban raha hai.`;
  } else if (upperWick >= 2 * bodySize && lowerWick <= bodySize * 0.5) {
    candleType = "Shooting Star / Bearish Pinbar (Liquidity Rejection)";
    orderFlowMeaning = `Buyers ne price ko ₹${candle.high} tak upar kheenchne ki koshish ki, lekin upar ke level par Big Institutions ne heavy sell orders execute kiye (Liquidity Grab). Upar ki ${upperWickPct}% lambi wick dikha rahi hai ki buyers fail ho chuke hain aur sellers active ho gaye.`;
    proRule = "Al Brooks Law: 'Upper tails in resistance zones trap breakout buyers.'";
    actionAdvice = `Is candle ke Low toot-te hi Short (SELL / PUT) ka trade banta hai. Stop Loss candle ke High (₹${candle.high}) par strictly set karein.`;
    speechText = `Bhai dhyan do, upar lambi wick wali rejection candle bani hai. Institutional sellers ne upar supply dump ki hai, yahan buying me mat fasna.`;
  } else if (isBullish && bodyPct > 65) {
    candleType = "Strong Bullish Trend Bar (Institutional Expansion)";
    orderFlowMeaning = `Is 5-minute candle me Buyers shuru se aakhir tak puri tarah dominant the. Open hone ke baad price neeche bilkul nahi gayi aur seedhe top ke paas close hui. Volume (${candle.volume}) confirm karta hai ki big money trend ko upar push kar rahi hai.`;
    proRule = "Al Brooks Law: 'A strong trend bar with small tails means 'Always In Long' - trade pullbacks in direction of the bar.'";
    actionAdvice = `Sidhe FOMO me mat kudo. Next candle ka thoda pullback (21 EMA ya candle ke 50% retracement) aane do, fir buy karo.`;
    speechText = `Zabardast green candle bani hai bhai! Buyers poore control me hain. Thoda pullback aane do fir enter karenge.`;
  } else if (!isBullish && bodyPct > 65) {
    candleType = "Strong Bearish Trend Bar (Aggressive Selling Climax)";
    orderFlowMeaning = `Sellers ne market ko heavy selling pressure ke sath neeche mara. ${candle.volume} volume ke sath price apne low ke paas band hui. Iska matlab institutions apni holdings offload kar rahe hain.`;
    proRule = "Richard Wyckoff: 'Sign of Weakness (SOW) - Supply heavily exceeds demand.'";
    actionAdvice = `Rising falling knife ko pakadne ki koshish mat karo. Short positions hold karo ya pullback par sell karo.`;
    speechText = `Bhai strong red bar bana hai. Sellers market ko neeche daba rahe hain, trend ke khilaaf buy mat karna.`;
  } else {
    candleType = "Doji / Indecision Compression (Pressure Build-up)";
    orderFlowMeaning = `Buyers aur Sellers dono ne koshish ki lekin barabar volume hone ki wajah se price lagbhag wahi close ho gayi jahan open hui thi (Body sirf ${bodyPct}% hai). Market me liquidity build ho rahi hai.`;
    proRule = "Bob Volman: 'Compression precedes expansion. Wait for the breakout with high volume.'";
    actionAdvice = `Range ke dono taraf orders active hain. Range break hone ka wait karein, premature entry se bachein.`;
    speechText = `Chart par doji indecision candle hai bhai. Buyers aur sellers dono equal hain, breakout ka wait karo.`;
  }

  // Indicator Confluences
  const emaContext = candle.close > candle.ema21
    ? `✅ Price 21 EMA (₹${candle.ema21}) ke upar hai: Uptrend confirm hai.`
    : `⚠️ Price 21 EMA (₹${candle.ema21}) ke neeche hai: Downtrend active hai.`;

  const vwapContext = candle.close > candle.vwap
    ? `Institutional buyers VWAP (₹${candle.vwap}) ke upar profit me hain.`
    : `Institutional sellers VWAP (₹${candle.vwap}) ke neeche haavi hain.`;

  const rsiContext = candle.rsi > 70
    ? `RSI ${candle.rsi} (Overbought): Mark Douglas ke mutabiq yahan buy karna risky hai, pullback ka wait karein.`
    : candle.rsi < 30
    ? `RSI ${candle.rsi} (Oversold): Smart money reversal dhoondh rahi hai.`
    : `RSI ${candle.rsi} (Healthy Momentum): Trend clean chal raha hai.`;

  return {
    candleType,
    time: candle.timeFormatted,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: candle.volume,
    orderFlowMeaning,
    proRule,
    actionAdvice,
    emaContext,
    vwapContext,
    rsiContext,
    speechText
  };
}

export function evaluateRealTimeTradeSetup(candles, symbolInfo) {
  if (!candles || candles.length < 10) return null;
  const current = candles[candles.length - 1];
  const prev = candles[candles.length - 2];

  const body = Math.abs(current.close - current.open);
  const upperWick = current.high - Math.max(current.open, current.close);
  const lowerWick = Math.min(current.open, current.close) - current.low;

  let bias = "NEUTRAL";
  let setupName = "20 EMA Trend Consolidation";
  let bookRef = "Al Brooks - Reading Price Charts Bar by Bar";
  let rationale = "Price 21 EMA ke paas consolidate kar raha hai. Pullback confirmation ka wait karein.";
  let entry = current.close;
  let sl = Number((entry * 0.996).toFixed(2));
  let tp1 = Number((entry * 1.008).toFixed(2));
  let tp2 = Number((entry * 1.016).toFixed(2));
  let rr = "1:2.0";

  // Check Hammer on EMA
  if (lowerWick >= 2 * body && current.close > current.ema21) {
    bias = "BUY";
    setupName = "Bullish Pinbar / Rejection on 21 EMA Support";
    bookRef = "Steve Nison + Al Brooks (H2 Setup)";
    rationale = `Sellers ne neeche push kiya lekin 21 EMA (₹${current.ema21}) par institutional buyers ne demand absorb kar li. Niche ki lambi wick liquidity sweep confirm karti hai.`;
    entry = Number((current.high + symbolInfo.tickSize).toFixed(2));
    sl = Number((current.low - symbolInfo.tickSize * 2).toFixed(2));
    const risk = entry - sl;
    tp1 = Number((entry + risk * 2.0).toFixed(2));
    tp2 = Number((entry + risk * 3.0).toFixed(2));
    rr = "1:2.0";
  } else if (upperWick >= 2 * body && current.close < current.ema21) {
    bias = "SELL";
    setupName = "Shooting Star / Liquidity Raid at Resistance";
    bookRef = "ICT / Smart Money + Steve Nison";
    rationale = `High par retail buyers ko trap karne ke baad institutional sellers ne aggressive short orders execute kiye hain.`;
    entry = Number((current.low - symbolInfo.tickSize).toFixed(2));
    sl = Number((current.high + symbolInfo.tickSize * 2).toFixed(2));
    const risk = sl - entry;
    tp1 = Number((entry - risk * 2.0).toFixed(2));
    tp2 = Number((entry - risk * 2.8).toFixed(2));
    rr = "1:2.0";
  } else if (current.close > current.ema21 && current.close > current.vwap && current.rsi < 65) {
    bias = "BUY";
    setupName = "VWAP & 21 EMA Momentum Continuation";
    bookRef = "John J. Murphy - Technical Analysis of the Financial Markets";
    rationale = `Price VWAP (₹${current.vwap}) aur 21 EMA dono ke upar strong hold kar raha hai. Trend continuation trade.`;
    entry = current.close;
    sl = Number((current.ema21 * 0.997).toFixed(2));
    const risk = entry - sl;
    tp1 = Number((entry + risk * 2.0).toFixed(2));
    tp2 = Number((entry + risk * 3.0).toFixed(2));
    rr = "1:2.0";
  } else if (current.close < current.ema21 && current.close < current.vwap && current.rsi > 35) {
    bias = "SELL";
    setupName = "Institutional Breakdown under VWAP Ribbon";
    bookRef = "Dr. Alexander Elder - Triple Screen Trading System";
    rationale = `Price VWAP aur moving average ke neeche sustain kar raha hai. Selling volume haavi hai.`;
    entry = current.close;
    sl = Number((current.ema21 * 1.003).toFixed(2));
    const risk = sl - entry;
    tp1 = Number((entry - risk * 2.0).toFixed(2));
    tp2 = Number((entry - risk * 3.0).toFixed(2));
    rr = "1:2.0";
  }

  const psychologyAdvice = [
    `Mark Douglas Truth: 'हर ट्रेड एक स्वतंत्र संभावना है। रिस्क पहले से स्वीकार करें।'`,
    `Jesse Livermore: 'बड़ा पैसा बार-बार इन-आउट करने से नहीं, बल्कि सही ट्रेड में टिके रहने से बनता है।'`,
    `Alexander Elder: 'अगर स्टॉप लॉस हिट हो तो बिना ईगो के तुरंत बाहर निकलो, मार्केट से बदला मत लो!'`,
    `Al Brooks: 'सिग्नल बार क्लोज होने का हमेशा इंतजार करें, जल्दबाजी में ट्रैप न हों।'`
  ];

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
    psychologyAdvice: psychologyAdvice[Math.floor(Math.random() * psychologyAdvice.length)],
    timestamp: Date.now()
  };
}
