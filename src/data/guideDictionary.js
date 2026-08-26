// Comprehensive Beginner Guide & Hinglish Dictionary for All Platform Elements
export const GUIDE_DICTIONARY = {
  // Chart & Timeframes
  timeframe_1m: {
    title: "1 Minute Candle (1m Timeframe)",
    kaam: "Har 1 minute me market me kitna upar-neeche hua, yeh ek candle dikhati hai. Scalpers isko fast entry-exit ke liye use karte hain.",
    growwGuide: "Groww App me chart kholkar top par '1M' select karein. Real Groww me 1m chart par brokerage zyada lag sakti hai agar overtrading karein.",
    proTip: "Al Brooks Rule: 1m chart par bohot fake signals aate hain, 5m ke trend ke sath hi 1m par trade lein."
  },
  timeframe_5m: {
    title: "5 Minute Candle (5m Timeframe - Best for Intraday)",
    kaam: "Intraday trading ka golden timeframe. 5 minute me institutional buyers aur sellers ka actual control saaf dikhta hai.",
    growwGuide: "Groww App me Nifty/BankNifty chart par '5M' sabse popular hai. Isme noise kam hoti hai aur setups clean bante hain.",
    proTip: "Steve Nison Law: 5m candle close hone se pehle kabhi jump mat karo; wick bante hi trap ho sakte ho."
  },
  ema9: {
    title: "EMA 9 (Fast Moving Average - Cyan Line)",
    kaam: "Pichhle 9 candles ka weighted average price. Yeh market ke immediate short-term momentum ko track karta hai.",
    growwGuide: "Groww me 'Indicators' par tap karke 'Moving Average Exponential' add karein aur Length 9 daalein.",
    proTip: "Jab price EMA 9 ke upar bhaagti hai, to trend explosive hota hai."
  },
  ema21: {
    title: "EMA 21 (Al Brooks Dynamic Support - Amber Line)",
    kaam: "Institutions ka favorite support line. Uptrend me jab bhi price 21 EMA ke paas aati hai, banks aur FIIs wahan dip buy karte hain.",
    growwGuide: "Groww me EMA ki Length 21 set karein. Jab Nifty 21 EMA par bounce kare, tab Groww me Call option buy ka setup banta hai.",
    proTip: "21 EMA ke upar Hammer bane to 80% chances hote hain ki market wahan se upar bounce karega."
  },
  vwap: {
    title: "VWAP (Volume Weighted Average Price - Purple Line)",
    kaam: "Price aur Volume dono ka mila-jula benchmark. Mutual funds aur bade institutions VWAP ke mutabiq orders execute karte hain.",
    growwGuide: "Groww Web terminal par indicators me 'VWAP' search karein. Agar price VWAP ke upar hai to sirf BUY ka sochein, SELL ka nahi.",
    proTip: "VWAP ke upar retail buyers safe hote hain kyunki big institutions unke sath khade hote hain."
  },

  // Groww Demat & Balance
  groww_balance: {
    title: "Groww Demat Buying Power / Margin",
    kaam: "Aapke Groww account me trade lene ke liye uplabdh cash margin. Is paise se aap shares ya options contracts khareed sakte hain.",
    growwGuide: "Groww App ke 'Profile' ➔ 'Groww Balance' me yeh dikhta hai. Option buying me 100% cash chahiye hota hai, jabki intraday equity me 5x leverage milta hai.",
    proTip: "Risk Rule: Ek trade me kabhi bhi apne total balance ka 1% se zyada risk na lein (Alexander Elder 1% Rule)."
  },
  sebi_totp: {
    title: "SEBI 2FA TOTP Authorisation",
    kaam: "SEBI ka suraksha niyam. Indian brokers me direct password login ban hai; Google Authenticator ka 6-digit rotating code mandatory hai.",
    growwGuide: "Groww Profile ➔ Security settings ➔ 'Two-Factor Authentication' me jakar TOTP enable kiya jata hai.",
    proTip: "Yeh 30 second me expire hota hai taaki koi aapka account hack na kar sake."
  },

  // Execution & Orders
  market_order: {
    title: "Market Order (Turant Buy/Sell)",
    kaam: "Jo bhi current rate chal raha hai, usi par order turant execute ho jata hai. Wait karne ki zaroorat nahi hoti.",
    growwGuide: "Groww me Buy button dabate waqt 'Type: Market' choose karein. Fast moving market me thoda slippage (price difference) aa sakta hai.",
    proTip: "High volatility me limit order prefer karein taaki galat price par order fill na ho."
  },
  limit_order: {
    title: "Limit Order (Manpasand Price Par Buy/Sell)",
    kaam: "Aap apna rate fix kar dete hain (e.g. ₹24,250). Jab market us rate par aayega, tabhi order execute hoga.",
    growwGuide: "Groww me 'Type: Limit' select karke apna desired price daalein. Jab tak price match nahi hota, order pending rehta hai.",
    proTip: "Pullback trades me hamesha Limit order lagayein taaki saste me entry mile."
  },
  stop_loss: {
    title: "Stop Loss (SL - Capital Ki Raksha)",
    kaam: "Agar trade galat chala jaye, to yeh ek safety net hai jo aapko chhota loss dekar bahar nikal deta hai aur account blow hone se bachata hai.",
    growwGuide: "Groww me 'Add Stop Loss' toggle on karein ya position banne ke baad 'Exit with SL' karein. Real Groww me SL-Limit order lagta hai.",
    proTip: "Mark Douglas Law: 'Trade lene se pehle apna Stop Loss tay karein aur jab hit ho to bina ego ke nikal jayein.'"
  },
  take_profit: {
    title: "Take Profit / Target (TP - Munafa Book Karna)",
    kaam: "Pehle se tay kiya gaya level jahan aap apna target profit book karke bahar nikalte hain (minimum 1:2 Risk-Reward).",
    growwGuide: "Groww me Target limit order ya GTT (Good Till Triggered) order ke zariye profit lock kiya jata hai.",
    proTip: "Jesse Livermore: 'Aadha profit Target 1 par book karein aur baaki ko trailing SL ke sath ride karein.'"
  },
  elder_risk_rule: {
    title: "Dr. Alexander Elder 1% Risk Auto-Calculator",
    kaam: "Yeh formula aapke Stop Loss ki doori ke hisaab se exact safe quantity nikalta hai taaki agar SL hit bhi ho to sirf 1% nuksan ho.",
    growwGuide: "Groww me trader aksar manmana lot size leke fas jate hain. Yeh button aapko Groww balance ke hisaab se safe lot size deta hai.",
    proTip: "Formula: Qty = (Demat Balance × 1%) ÷ (Entry Price - Stop Loss)."
  },

  // Patterns & AI
  ai_auto_trader: {
    title: "AI Capital Growth & Auto-Compounder",
    kaam: "Yeh engine 6 institutional patterns ko scan karta hai. 85%+ score milte hi auto-trade execute karta hai aur profit Groww account me jama karta hai.",
    growwGuide: "Real Groww me algo trading API (OpenAPI) ke zariye aisi algorithmic strategies run hoti hain.",
    proTip: "Rule-based algo trading se emotional trading aur FOMO khatam ho jata hai."
  },
  pattern_order_block: {
    title: "Institutional Order Block (OB)",
    kaam: "Bade bank aur FIIs jahan crores ke limit order chhodte hain. Price jab is zone me wapas aati hai to rocket bounce milta hai.",
    growwGuide: "Groww chart par support zone box draw karke Order Block mark karein. Jab price touch kare tab entry lein.",
    proTip: "ICT SMC Rule: Order block ke base ke 2 point neeche Stop Loss rakhein."
  },
  pattern_wyckoff_spring: {
    title: "Wyckoff Spring (Retail Stop Hunt)",
    kaam: "Support todkar retail traders ke stop loss trigger karwana (Liquidity Purge), aur fir turant wapas upar kheench lena.",
    growwGuide: "Jab Groww me Nifty support todkar sabko bechne par majboor kare aur agle 5 minute me wapas support ke upar aa jaye, to samjhein Spring ban gaya!",
    proTip: "Wyckoff Law: Spring ke retest par buy karein, 1:3+ Risk-to-Reward milta hai."
  },
  pattern_fvg: {
    title: "Fair Value Gap (FVG Imbalance)",
    kaam: "Tez move ki wajah se 3 candles ke beech chhoota hua khali hissa. Market algorithm is gap ko rebalance karne zaroor aati hai.",
    growwGuide: "Groww me 3-candle imbalance dekhkar 50% retracement par limit buy order lagayein.",
    proTip: "Gap bharte hi price slingshot ki tarah original trend me bhaagti hai."
  },

  // Level 2 Market Depth
  market_depth: {
    title: "Level 2 Order Book (Market Depth)",
    kaam: "Top 5 Buyers (Bids) aur Top 5 Sellers (Asks) ke live pending orders aur quantity dikhata hai.",
    growwGuide: "Groww me kisi bhi stock par click karein to neeche 'Market Depth' table dikhti hai. Agar Buyers 60%+ hain to bullish pressure hota hai.",
    proTip: "Agar Asks me achanak badi quantity gayab ho jaye to breakout aane wala hota hai."
  },

  // Books
  mark_douglas: {
    title: "Trading in the Zone (Mark Douglas)",
    kaam: "Trading Psychology ka sabse mahan granth. Dar, lalach aur revenge trading ko khatam karke probability mindset sikhata hai.",
    growwGuide: "Groww me loss hone par ghutne tekne ke bajaye calm rehne ke liye Mark Douglas ke 5 fundamental truths padhein.",
    proTip: "'Anything can happen at any moment. You don't need to know what happens next to make money.'"
  },
  al_brooks: {
    title: "Reading Price Charts Bar by Bar (Al Brooks)",
    kaam: "Pure Price action ka bible. Har single candle ki wick aur body ki kahani samjhata hai.",
    growwGuide: "Groww me bina kisi indicator ke sirf 21 EMA aur price action dekhkar trade karne ka tarika.",
    proTip: "Al Brooks Rule: 80% trading range breakouts fail hote hain, premature breakout par mat kudo."
  }
};
