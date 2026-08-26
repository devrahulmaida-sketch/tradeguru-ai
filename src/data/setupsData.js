// Institutional Pro Trading Setups Matrix
export const PRO_SETUPS = [
  {
    id: "h2-pullback",
    name: "Al Brooks H2 (Second Entry Long)",
    category: "Price Action Trend Continuation",
    author: "Al Brooks, M.D.",
    book: "Reading Price Charts Bar by Bar",
    winRate: "74%",
    avgRR: "1:2.4",
    badge: "Most Reliable Trend Setup",
    color: "#10b981",
    bias: "BUY",
    hinglishLogic: "Jab market strong uptrend me hota hai aur counter-trend bears 2 baar price ko girane ki koshish karke fail ho jate hain (Second Attempt), tab 21 EMA ke paas H2 trigger hota hai. Institutions trapped bears ke stop losses ko target karte hain.",
    checklist: [
      "Market 21 EMA aur VWAP ke upar trade kar raha ho",
      "Pehla dip bana ho aur bears dubara girane me fail hue hon (2nd Entry)",
      "Signal candle 21 EMA par rejection wick banaye (Hammer/Pinbar)",
      "RSI 50-65 ke healthy range me ho",
      "Risk-to-Reward minimum 1:2 mil raha ho"
    ]
  },
  {
    id: "wyckoff-spring",
    name: "Wyckoff Spring (Liquidity Purge)",
    category: "Smart Money Institutional Accumulation",
    author: "Richard D. Wyckoff",
    book: "The Wyckoff Method",
    winRate: "81%",
    avgRR: "1:3.2",
    badge: "Smart Money Trap",
    color: "#f59e0b",
    bias: "BUY",
    hinglishLogic: "Institutions (Composite Man) support level ke neeche price ko ek jhatke me todte hain taaki retail buyers ke Stop Loss hit hon (Sell orders trigger hon). Fir smart money unhi saste orders ko absorb karke rocket banati hai.",
    checklist: [
      "Range/Support ke neeche ek sharp breakdown wick bani ho",
      "Neeche heavy stopping volume aaya ho",
      "Agli candle ne turant support range ke andar wapas close diya ho",
      "Retail shorts trap ho chuke hon",
      "Stop Loss spring candle ke lowest wick ke neeche set ho"
    ]
  },
  {
    id: "ict-fvg",
    name: "ICT Fair Value Gap (FVG Slingshot)",
    category: "Algorithmic Imbalance Rebalance",
    author: "Inner Circle Trader (ICT)",
    book: "Smart Money Concepts (SMC)",
    winRate: "77%",
    avgRR: "1:2.8",
    badge: "Algo Rebalance",
    color: "#06b6d4",
    bias: "BUY",
    hinglishLogic: "3-candle formation me jab Candle 1 ke High aur Candle 3 ke Low ke beech khali gap reh jata hai, use Fair Value Gap kehte hain. Algorithmic delivery system is gap ko 50% retest karke explosive bounce deta hai.",
    checklist: [
      "Strong impulsive candle ne 3-bar imbalance chodi ho",
      "Price FVG zone (50% Consequent Encroachment) me retrace kare",
      "Zone par price rejection wick banaye",
      "Higher timeframe trend ki disha me trade ho",
      "Target liquidity pool (previous swing high) ho"
    ]
  },
  {
    id: "order-block-retest",
    name: "Institutional Order Block (OB Retest)",
    category: "Institutional Footprint Entry",
    author: "Institutional Prop Methodology",
    book: "Master the Markets (Tom Williams / VSA)",
    winRate: "78%",
    avgRR: "1:3.0",
    badge: "Heavy Volume Zone",
    color: "#8b5cf6",
    bias: "BUY",
    hinglishLogic: "Bada move aane se theek pehle institutions ne jis candle me apni crores ki orders bhari thi, use Order Block kehte hain. Jab price wapas aati hai, tab unki pending orders fill hokar price ko upar phenkti hain.",
    checklist: [
      "Explosive breakout se pehle ka last opposite bar mark ho",
      "Breakout ne market structure shift (MSS) kiya ho",
      "Price OB zone me slow volume ke sath pullback le",
      "Zone chhoote hi bullish rejection candle bane",
      "Strict SL: Order Block ke base ke neeche"
    ]
  },
  {
    id: "bearish-liquidity-raid",
    name: "Shooting Star Liquidity Raid (Short Setup)",
    category: "Bearish Institutional Trap",
    author: "Steve Nison + Al Brooks",
    book: "Japanese Candlestick Charting Techniques",
    winRate: "75%",
    avgRR: "1:2.5",
    badge: "High Resistance Trap",
    color: "#ef4444",
    bias: "SELL",
    hinglishLogic: "Resistance par breakout dekhkar retail traders buy karte hain. Institutions unhe buy karne dete hain aur upar se heavy quantity dump kar dete hain. Upar lambi wick banakar price neeche dump hoti hai.",
    checklist: [
      "Price key resistance ya VWAP upper band par ho",
      "Lambi upper wick (at least 2x of candle body)",
      "Next candle ne shooting star ke low ko cross kiya ho",
      "RSI 65-75 ke overbought zone se turn ho raha ho",
      "Target: Lower dynamic support / 21 EMA"
    ]
  }
];
