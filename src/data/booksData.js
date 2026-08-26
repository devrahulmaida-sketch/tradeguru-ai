// Comprehensive Trading Books Knowledge Base & Wisdom Repository
export const BOOKS_KNOWLEDGE_BASE = [
  {
    id: "mark-douglas-zone",
    title: "Trading in the Zone",
    author: "Mark Douglas",
    category: "Trading Psychology & Mindset",
    year: "2000",
    badge: "Psychology Bible",
    color: "#8b5cf6",
    corePhilosophy: "The market is an environment where anything can happen at any moment. Successful traders think in probabilities, accept risk completely, and eliminate fear and greed.",
    hindiSummary: "मार्केट में कोई भी गारंटी नहीं होती। एक प्रो ट्रेडर हर ट्रेड को संभावना (probability) के रूप में देखता है। अगर लॉस हुआ तो वो इमोशनल नहीं होता, क्योंकि उसे पता है कि 100 में से 60 ट्रेड सही होंगे और 40 गलत, लेकिन सही रिस्क मैनेजमेंट से वो अंत में प्रॉफिट में रहेगा।",
    fiveTruths: [
      "Anything can happen at any moment (कुछ भी हो सकता है).",
      "You don't need to know what is going to happen next to make money (पैसे कमाने के लिए अगला मूव जानना जरूरी नहीं).",
      "There is a random distribution between wins and losses for any given set of variables that define an edge.",
      "An edge is nothing more than an indication of a higher probability of one thing happening over another.",
      "Every moment in the market is unique."
    ],
    goldenRules: [
      "Never enter a trade without knowing your exact exit point (Stop Loss) beforehand.",
      "Completely accept the risk of the trade before pressing Buy/Sell.",
      "Do not revenge trade after a loss; step away and let emotions cool down.",
      "Trading without fear creates the flow state necessary for consistency."
    ]
  },
  {
    id: "al-brooks-price-action",
    title: "Reading Price Charts Bar by Bar",
    author: "Al Brooks, M.D.",
    category: "Pure Price Action",
    year: "2009",
    badge: "Price Action Master",
    color: "#3b82f6",
    corePhilosophy: "Every single tick on the chart represents a battle between institutional bulls and bears. Price action is the footprint of money. Don't predict; react to bar-by-bar structure.",
    hindiSummary: "चार्ट पर हर कैंडल एक कहानी कहती है। इंडिकेटर्स से पहले प्राइस चलता है। जब मार्केट 20 EMA पर पुलबैक ले या 2nd Entry दे, तभी सबसे हाई-प्रोबेबिलिटी ट्रेड बनता है।",
    keyConcepts: [
      "Second Entry Long/Short (H2 / L2 setups) - Institutional confirmation after a trapped counter-trend.",
      "Always In Long / Always In Short (AIL / AIS) - Identifying market state immediately.",
      "Breakout Mode & Breakout Pullback.",
      "Trading Range vs Trend Channel - Buy low, sell high, scalp in ranges; buy pullbacks in strong trends."
    ],
    goldenRules: [
      "Never fight a strong trend bar breaking out with expanding volume.",
      "Wait for the signal bar to close before entering.",
      "Look for second entry pullbacks near the 20-period EMA.",
      "Assume 80% of breakout attempts in a trading range will fail."
    ]
  },
  {
    id: "steve-nison-candlesticks",
    title: "Japanese Candlestick Charting Techniques",
    author: "Steve Nison",
    category: "Candlestick Patterns",
    year: "1991",
    badge: "Candlestick Foundation",
    color: "#10b981",
    corePhilosophy: "Candlesticks reveal the psychological state of market participants. Long wicks indicate rejection; engulfing bodies demonstrate institutional dominance.",
    hindiSummary: "जापानी कैंडलस्टिक्स हमें दिखाती हैं कि बायर्स और सेलर्स के बीच क्या जंग चल रही है। अगर नीचे लंबी विक (Wick) बनती है तो इसका मतलब बायर्स आ चुके हैं (Hammer / Pinbar)।",
    keyPatterns: [
      "Bullish / Bearish Engulfing - One party completely overtakes the previous candle.",
      "Hammer & Hanging Man - Strong price rejection from lower levels.",
      "Morning Star & Evening Star - High probability 3-candle reversal confluence.",
      "Doji & Spinning Tops - Indecision, prepares for explosive momentum."
    ],
    goldenRules: [
      "Candlestick patterns are only valid at key Support/Resistance or Moving Average levels.",
      "A hammer in the middle of nowhere has zero significance.",
      "Always wait for confirmation of the candlestick pattern on the next candle."
    ]
  },
  {
    id: "richard-wyckoff-method",
    title: "The Wyckoff Method & Composite Operator",
    author: "Richard D. Wyckoff",
    category: "Institutional Order Flow & VSA",
    year: "1931",
    badge: "Institutional Flow",
    color: "#f59e0b",
    corePhilosophy: "The market is manipulated by the 'Composite Man' (Smart Money / Big Institutions). They accumulate at bottoms, markup prices, distribute at tops, and markdown.",
    hindiSummary: "बड़े इंस्टिट्यूशन्स (FII/DII) सीधे बाय नहीं करते। वो पहले रिटेल ट्रेडर्स को ट्रैप करते हैं (Spring / Stop Hunt) और फिर बड़ा मूव लाते हैं। हमें स्मार्ट मनी के कदमों को फॉलो करना है।",
    phases: [
      "Phase A: Stopping the prior trend (Preliminary Support, Selling Climax).",
      "Phase B: Building Cause (Testing & Absorption).",
      "Phase C: Testing Liquidity (Wyckoff Spring / Shakeout below support).",
      "Phase D: Markup inside range (Sign of Strength - SOS).",
      "Phase E: Markup outside range (Trend continuation)."
    ],
    goldenRules: [
      "Enter after the Wyckoff Spring re-test when smart money has trapped retail shorts.",
      "Look for high volume on breakouts and drying volume on pullbacks.",
      "Never buy when the Composite Man is in active Distribution (Upthrust after Distribution)."
    ]
  },
  {
    id: "smart-money-concepts",
    title: "Smart Money Concepts & ICT Methodology",
    author: "Inner Circle Trader (ICT) / Institutional Market Mechanics",
    category: "Modern Smart Money (SMC)",
    year: "Modern Institutional",
    badge: "SMC / ICT Edge",
    color: "#06b6d4",
    corePhilosophy: "Markets do not move randomly; algorithms seek liquidity (stops) and rebalance Fair Value Gaps (FVG). Institutions leave Order Blocks where massive orders were filled.",
    hindiSummary: "स्मार्ट मनी वहां बाय करती है जहां रिटेल ट्रेडर के स्टॉप लॉस पड़े होते हैं (Liquidity Sweep)। FVG (इम्बैलेंस) हमेशा री-टेस्ट होता है, वहीं एंट्री लेनी चाहिए।",
    keyConcepts: [
      "Order Block (OB) - Last opposite candle before an explosive institutional impulse.",
      "Fair Value Gap (FVG) - 3-candle imbalance where liquidity was skipped.",
      "Liquidity Sweep (BSL / SSL) - Taking out previous highs/lows before reversing.",
      "Market Structure Shift (MSS) / Change of Character (CHoCH) - Reversal signal.",
      "Premium vs Discount Array - Buy only in Discount (< 50% Fibonacci range)."
    ],
    goldenRules: [
      "Do NOT buy at swing highs (Buy-side liquidity) - you are feeding institutional sell orders.",
      "Wait for liquidity sweep + MSS + FVG retracement for an institutional 1:3+ R:R trade."
    ]
  },
  {
    id: "john-murphy-ta",
    title: "Technical Analysis of the Financial Markets",
    author: "John J. Murphy",
    category: "Technical Analysis Standard",
    year: "1999",
    badge: "Chartist Handbook",
    color: "#ec4899",
    corePhilosophy: "Market action discounts everything. Prices move in trends. History repeats itself. The three pillars of technical chart analysis.",
    hindiSummary: "प्राइस हर फंडामेंटल न्यूज को डिस्काउंट कर लेता है। ट्रेंड आपका दोस्त है (Trend is your friend)। सपोर्ट और रेजिस्टेंस का ब्रेकआउट रीटेस्ट सबसे सुरक्षित एंट्री देता है।",
    keyConcepts: [
      "Support & Resistance Role Reversal (Previous Resistance becomes Support).",
      "Moving Average Ribbon (9, 21, 50, 200 EMA) for trend determination.",
      "RSI Overbought (>70) & Oversold (<30) + Bullish/Bearish Divergences.",
      "Head and Shoulders, Double Bottoms, Flags, and Pennants."
    ],
    goldenRules: [
      "Always trade in the direction of the dominant higher timeframe trend.",
      "A moving average is dynamic support/resistance in trending markets."
    ]
  },
  {
    id: "alexander-elder-triple-screen",
    title: "Trading for a Living",
    author: "Dr. Alexander Elder",
    category: "Triple Screen & Psychology",
    year: "1993",
    badge: "3-M System",
    color: "#6366f1",
    corePhilosophy: "Successful trading rests on three pillars: Mind (Psychology), Method (Strategy), and Money (Risk Management). Use multiple timeframes (Triple Screen).",
    hindiSummary: "सफल ट्रेडिंग के तीन नियम हैं: माइंड (इमोशन कंट्रोल), मेथड (ट्रिपल स्क्रीन सिस्टम) और मनी (रिस्क मैनेजमेंट)। कभी भी 1 ट्रेड में 2% से ज्यादा रिस्क न लें।",
    keyConcepts: [
      "First Screen: Market Tide (Higher timeframe trend e.g. Daily/15m).",
      "Second Screen: Market Wave (Pullback against the tide e.g. 5m RSI dip).",
      "Third Screen: Market Ripple (Intraday trigger e.g. 1m breakout of prior high).",
      "2% Rule: Never risk more than 2% of equity on a single trade.",
      "6% Rule: If account loses 6% in a month, stop trading immediately."
    ],
    goldenRules: [
      "Cut losses fast without hesitation.",
      "The goal of a trader is simply to execute good trades, not to chase money."
    ]
  },
  {
    id: "jesse-livermore-operator",
    title: "Reminiscences of a Stock Operator",
    author: "Edwin Lefèvre (Jesse Livermore)",
    category: "Legendary Tape Reading",
    year: "1923",
    badge: "Wall Street Legend",
    color: "#eab308",
    corePhilosophy: "It was never my thinking that made the big money for me. It also was my sitting. Got that? My sitting tight! Markets are never wrong - opinions often are.",
    hindiSummary: "बड़ा पैसा ट्रेडिंग में बार-बार एंट्री एग्जिट करने से नहीं, बल्कि सही पोजीशन में टिके रहने (Sitting tight) से बनता है। लॉस को तुरंत काटो, प्रॉफिट को दौड़ने दो।",
    goldenRules: [
      "A trader must believe in himself and his judgment.",
      "Never average down a losing position (डूबते शेयर में और पैसे कभी मत डालो).",
      "Sell what shows you a loss and keep what shows you a profit."
    ]
  }
];
