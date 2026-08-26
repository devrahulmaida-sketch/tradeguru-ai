// AI Service: Handles Custom AI APIs (OpenAI, Groq, Claude, Gemini) and Built-In Master Trader AI Engine
import { BOOKS_KNOWLEDGE_BASE } from '../data/booksData';

export const AI_PROVIDERS = [
  { id: "builtin", name: "TradeGuru Autonomous Engine (Offline/Built-in)", free: true, defaultModel: "institutional-alpha-v2" },
  { id: "groq", name: "Groq (Ultra-Fast Llama 3.3 / DeepSeek R1)", free: false, defaultModel: "llama-3.3-70b-versatile", endpoint: "https://api.groq.com/openai/v1/chat/completions" },
  { id: "openai", name: "OpenAI (GPT-4o / GPT-4o-mini)", free: false, defaultModel: "gpt-4o-mini", endpoint: "https://api.openai.com/v1/chat/completions" },
  { id: "anthropic", name: "Anthropic Claude (Claude 3.5 Sonnet)", free: false, defaultModel: "claude-3-5-sonnet-20241022", endpoint: "https://api.anthropic.com/v1/messages" },
  { id: "gemini", name: "Google Gemini (Gemini 2.0 / 1.5 Flash)", free: false, defaultModel: "gemini-1.5-flash", endpoint: "https://generativelanguage.googleapis.com/v1beta/models/" }
];

export const SYSTEM_PROMPT = `
You are 'TradeGuru AI', a battle-tested Wall Street & Dalal Street institutional trader, master trading psychologist, and mentor.
You embody the collective wisdom of the greatest trading books ever written:
- Mark Douglas ('Trading in the Zone' - 5 fundamental truths, probability mindset, eliminating fear, risk acceptance)
- Al Brooks ('Reading Price Charts Bar by Bar' - Second Entries, 20 EMA pullbacks, bar anatomy, trapped traders)
- Steve Nison ('Japanese Candlestick Charting Techniques' - Hammers, Engulfing, Morning Stars, Wick dynamics)
- Richard Wyckoff ('The Wyckoff Method' - Accumulation, Distribution, Spring shakeouts, Composite Operator)
- Tom Williams ('Master the Markets' - Volume Spread Analysis / VSA, Stopping volume, No-demand)
- ICT / Smart Money Concepts (Order Blocks, Fair Value Gaps / FVG, Liquidity Sweeps, Premium vs Discount)
- John J. Murphy ('Technical Analysis of the Financial Markets' - Support/Resistance, Trendlines, Dow Theory)
- Dr. Alexander Elder ('Trading for a Living' - Triple Screen System, 1-2% risk rule, Mind-Method-Money)
- Jesse Livermore ('Reminiscences of a Stock Operator' - Sitting tight, cutting losses without ego, never averaging losers)

Tone & Style:
- Professional, disciplined, motivating, clear, and realistic (no get-rich-quick BS).
- Communicate in expressive Hinglish or English (as the user asks), making high-level concepts instantly understandable.
- Always provide actionable advice: Setup Name, Entry, exact Stop Loss, Target 1, Target 2, Risk-to-Reward (R:R), and cite the specific book and author.
- Emphasize capital protection: 'Trade to trade well, not to make money; money is merely the by-product of flawless execution.'
`;

export async function askTradingAI({
  userMessage,
  marketContext,
  config = { provider: 'builtin', apiKey: '', model: 'llama-3.3-70b-versatile' }
}) {
  const { provider, apiKey, model } = config;

  // If custom API is selected and API key is provided:
  if (provider === 'groq' && apiKey) {
    return await callOpenAICompatibleAPI({
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      apiKey,
      model: model || "llama-3.3-70b-versatile",
      userMessage,
      marketContext
    });
  }

  if (provider === 'openai' && apiKey) {
    return await callOpenAICompatibleAPI({
      endpoint: "https://api.openai.com/v1/chat/completions",
      apiKey,
      model: model || "gpt-4o-mini",
      userMessage,
      marketContext
    });
  }

  if (provider === 'gemini' && apiKey) {
    return await callGeminiAPI({
      apiKey,
      model: model || "gemini-1.5-flash",
      userMessage,
      marketContext
    });
  }

  // Built-in Autonomous Master Trader AI Engine (Runs instantly with rich domain logic)
  return generateBuiltinAIResponse(userMessage, marketContext);
}

async function callOpenAICompatibleAPI({ endpoint, apiKey, model, userMessage, marketContext }) {
  try {
    const contextPrompt = `
Current Market Context:
- Asset: ${marketContext.symbol} (${marketContext.symbolName})
- Current Price: ₹${marketContext.currentPrice} (${marketContext.changePercent}%)
- EMA 9: ₹${marketContext.ema9} | EMA 21: ₹${marketContext.ema21} | EMA 50: ₹${marketContext.ema50}
- RSI (14): ${marketContext.rsi}
- VWAP: ₹${marketContext.vwap}
- Detected Candlestick Pattern: ${marketContext.detectedPattern || 'None'}
- Groww Account Balance: ₹${marketContext.growwBalance || '5,00,000'}
- Active Position: ${marketContext.activePosition ? JSON.stringify(marketContext.activePosition) : 'No open position'}
`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `${contextPrompt}\n\nUser Question: ${userMessage}` }
        ],
        temperature: 0.6,
        max_tokens: 800
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "AI response could not be parsed.";
  } catch (error) {
    console.error("Custom API Call Failed:", error);
    return `⚠️ API Error: ${error.message}. Fallback to Built-in AI Trader:\n\n` + generateBuiltinAIResponse(userMessage, marketContext);
  }
}

async function callGeminiAPI({ apiKey, model, userMessage, marketContext }) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
    const prompt = `${SYSTEM_PROMPT}\n\nMarket State: Symbol=${marketContext.symbol}, Price=${marketContext.currentPrice}, RSI=${marketContext.rsi}, EMA21=${marketContext.ema21}\n\nUser Question: ${userMessage}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Gemini responded empty.";
  } catch (e) {
    return `⚠️ Gemini API Error: ${e.message}. \n\n` + generateBuiltinAIResponse(userMessage, marketContext);
  }
}

// Autonomous Built-in Institutional AI Engine
export function generateBuiltinAIResponse(userMessage, ctx = {}) {
  const query = (userMessage || "").toLowerCase();
  const symbol = ctx.symbol || "NIFTY 50";
  const price = ctx.currentPrice || 24850;
  const rsi = ctx.rsi || 52;
  const ema21 = ctx.ema21 || 24830;
  const vwap = ctx.vwap || 24840;
  const pattern = ctx.detectedPattern || "20 EMA Trend Pullback";

  // 1. Psychological check / FOMO / Revenge trading query
  if (query.includes("loss") || query.includes("fomo") || query.includes("revenge") || query.includes("darr") || query.includes("fear") || query.includes("greedy")) {
    return `🧘 **Mark Douglas ('Trading in the Zone') Master Psychology Guidance:**

1. **Mark Douglas का 1st Rule**: "Anything can happen at any moment." लॉस होना ट्रेडिंग का सामान्य हिस्सा है। जैसे किसी दुकान में बिजली का बिल और किराया देना बिज़नेस एक्सपेंस है, वैसे ही स्टॉप-लॉस ट्रेडिंग का बिज़नेस एक्सपेंस है।
2. **Revenge Trading Trap**: लॉस के तुरंत बाद मार्केट से "बदला" लेने के लिए बड़ा लॉट लेना सबसे बड़ा अपराध है। मार्क डगलस कहते हैं: *"जब आप गुस्से या डर में ट्रेड करते हैं, तो आप मार्केट को नहीं, अपने ईगो को संतुष्ट करने की कोशिश कर रहे होते हैं।"*
3. **Alexander Elder's 2% & 6% Rule**:
   - एक ट्रेड में कैपिटल का 1% से 2% से ज्यादा रिस्क कभी न लें।
   - अगर आज आपका 2 स्टॉप लॉस हिट हो चुका है, तो स्क्रीन बंद करें और वॉक पर जाएं। कल मार्केट फिर खुलेगा!
4. **Actionable Step**: स्क्रीन को 30 मिनट के लिए लॉक करें। अपने जर्नल में लिखें: *"क्या मैंने अपना सेटअप आने का इंतजार किया था या FOMO में बाय किया?"*`;
  }

  // 2. Buy vs Sell / Call vs Put query
  if (query.includes("buy") || query.includes("sell") || query.includes("call") || query.includes("put") || query.includes("kya karu") || query.includes("entry")) {
    const isAboveEMA = price > ema21;
    const isAboveVWAP = price > vwap;
    const isOverbought = rsi > 70;
    const isOversold = rsi < 30;

    let stance = isAboveEMA && isAboveVWAP ? "BULLISH (BUY / CALL)" : "BEARISH (SELL / PUT)";
    let entryPrice = price;
    let sl = isAboveEMA ? Number((price * 0.996).toFixed(2)) : Number((price * 1.004).toFixed(2));
    let tp1 = isAboveEMA ? Number((price + (price - sl) * 2).toFixed(2)) : Number((price - (sl - price) * 2).toFixed(2));
    let tp2 = isAboveEMA ? Number((price + (price - sl) * 3).toFixed(2)) : Number((price - (sl - price) * 3).toFixed(2));

    return `🎯 **Real-Time Institutional Breakdown for ${symbol}:**

**Current Market State:**
- Price: ₹${price} | EMA 21: ₹${ema21} | VWAP: ₹${vwap}
- RSI (14): ${rsi} (${isOverbought ? '⚠️ Overbought Zone' : isOversold ? '⚠️ Oversold Zone' : '✅ Healthy Momentum'})
- Setup Detected: **${pattern}**

**AI Recommendation: ${stance}**
- **Rationale (Al Brooks & ICT)**: ${isAboveEMA ? 'प्राइस 21 EMA और VWAP के ऊपर सस्टेन कर रहा है। बुल्स का फ्लो मजबूत है। Al Brooks के अनुसार जब तक 20 EMA के नीचे क्लोजिंग न मिले, ट्रेंड के साथ रहना ही समझदारी है।' : 'प्राइस 21 EMA और VWAP के नीचे ट्रेड कर रहा है। सेलर्स हावी हैं। रिबाउंड पर शॉर्ट करना ज्यादा सुरक्षित है।'}
- **Precise Execution Plan:**
  - 📍 **Entry**: ₹${entryPrice}
  - 🛑 **Stop Loss (Structural SL)**: ₹${sl} (Never compromise this!)
  - 🎯 **Target 1 (1:2 R:R)**: ₹${tp1}
  - 🎯 **Target 2 (1:3 R:R)**: ₹${tp2}
- 📖 **Book Citation**: *Al Brooks - Reading Price Charts Bar by Bar* ("Wait for the signal bar to close; don't front-run the institutional move").
- ⚠️ **Pro Trader Warning**: अगर आपका रिस्क इस ट्रेड में आपके कैपिटल के 1.5% से ज्यादा है, तो क्वांटिटी घटाएं!`;
  }

  // 3. Stop loss calculation / Position sizing query
  if (query.includes("stop loss") || query.includes("sl") || query.includes("position") || query.includes("lot") || query.includes("capital") || query.includes("risk")) {
    return `📐 **Dr. Alexander Elder & Van Tharp's Position Sizing Formula:**

ट्रेडिंग में 90% लोग इसलिए फेल होते हैं क्योंकि वो पहले यह सोचते हैं कि *कितना कमाऊंगा*, जबकि प्रो ट्रेडर सोचता है कि *अगर यह ट्रेड गलत हुआ तो कितना गंवाऊंगा!*

**Golden Formula:**
$$\\text{Position Size (Lots/Qty)} = \\frac{\\text{Total Capital} \\times \\text{Risk \\% (Max 1\\% to 2\\%)}}{\\text{Entry Price} - \\text{Stop Loss}}$$

**उदाहरण (Example):**
- Groww Demat Capital: ₹1,00,000
- 1% Max Risk = ₹1,000
- Entry Price: ₹${price}
- Stop Loss: ₹${(price * 0.995).toFixed(2)} (SL Distance = ₹${(price * 0.005).toFixed(2)})
- **Allowed Quantity** = ₹1,000 ÷ ₹${(price * 0.005).toFixed(2)} ≈ **${Math.floor(1000 / (price * 0.005 || 1))} Shares / Contracts**.

📖 *Mark Douglas Law*: जब आप अपना रिस्क पहले से कैलकुलेट कर लेते हैं, तो आपका दिमाग न्यूट्रल हो जाता है और स्क्रीन पर दिल की धड़कन तेज नहीं होती!`;
  }

  // 4. Order block / ICT / SMC query
  if (query.includes("order block") || query.includes("smc") || query.includes("ict") || query.includes("fvg") || query.includes("liquidity")) {
    return `🏦 **Smart Money Concepts (ICT & Institutional Order Flow):**

1. **Order Block (OB) क्या है?**
   - यह वो आखिरी विरोधी कैंडल होती है जिससे पहले मार्केट में भारी वॉल्यूम से तेज स्पाइक आया हो।
   - बैंक और FII अपनी करोड़ों की पेंडिंग लिमिट ऑर्डर्स वहां छोड़ते हैं। जब मार्केट उस ज़ोन में वापस आता है (Mitigation), तो वहां से बिजली की तेजी से बाउंस या रिजेक्शन मिलता है।
2. **Fair Value Gap (FVG)**:
   - जब कैंडल 1 के हाई और कैंडल 3 के लो के बीच में कोई ओवरलैप नहीं होता, तो उसे 3-कैंडल इम्बैलेंस कहते हैं।
   - मार्केट एल्गोरिदम इस गैप को भरने (rebalance) जरूर आता है।
3. **Liquidity Sweep (स्टॉप हंट)**:
   - रिटेल बायर्स अपने स्टॉप लॉस पिछले स्विंग लो के ठीक नीचे रखते हैं। स्मार्ट मनी पहले उस लो को तोड़ती है (Liquidity Raid) और तुरंत रिवर्सल देती है।
   - **Pro Tip**: कभी भी ब्रेकआउट पर सीधे बाय न करें; पहले लिक्विडिटी ग्रैब होने दें, फिर जब मार्केट वापस स्ट्रक्चर में घुसे तब एंट्री लें!`;
  }

  // 5. Candlestick patterns query
  if (query.includes("candle") || query.includes("hammer") || query.includes("engulfing") || query.includes("wick") || query.includes("pattern")) {
    return `🕯️ **Steve Nison ('Japanese Candlestick Charting Techniques') Matrix:**

1. **Hammer (Pinbar)**:
   - नीचे की लंबी पूंछ (Long Lower Wick) दिखाती है कि सेलर्स ने नीचे दबाया, लेकिन बायर्स ने पूरी ताकत से प्राइस को वापस खींच लिया।
   - *गोल्डन रूल*: हैमर सिर्फ तभी वैलिड है जब वो सपोर्ट या 21 EMA पर बने। हवा में बने हैमर की कोई कीमत नहीं!
2. **Bullish Engulfing**:
   - जब ग्रीन कैंडल पिछली रेड कैंडल के पूरे शरीर (Body) को निगल ले। यह संस्थागत खरीदारों के सीधे प्रवेश का संकेत है।
3. **Doji (इंडेसिजन)**:
   - जब बायर्स और सेलर्स दोनों बराबर ताकत में हों। यह आगामी बड़े ब्रेकआउट का प्रेशर कुकर है।
4. **Steve Nison's Rule**: कभी भी सिर्फ 1 कैंडल देखकर ट्रेड न लें; अगली कैंडल का कन्फर्मेशन और वॉल्यूम बार हमेशा चेक करें!`;
  }

  // Default deep analysis
  return `📊 **TradeGuru Institutional Analysis & Strategic Outlook:**

**Live Ticker: ${symbol} @ ₹${price}**
- **Technical Confluence**: EMA 9 is ${price > (ctx.ema9 || price) ? 'above' : 'below'} EMA 21. VWAP benchmark is ₹${vwap}.
- **Momentum Gauge (Murphy TA)**: RSI (14) at ${rsi} shows ${rsi > 60 ? 'bullish expansion' : rsi < 40 ? 'bearish distribution' : 'healthy consolidation'}.
- **Active Pattern**: ${pattern}.

**Professional Advice from the Masters:**
1. *Jesse Livermore*: 'बाजार कभी गलत नहीं होता, आपकी राय गलत हो सकती है। अगर प्राइस आपके स्टॉप लॉस की तरफ जाए, तो तर्क मत दीजिए—तुरंत बाहर निकलिए।'
2. *Mark Douglas*: 'हर ट्रेड केवल एक स्वतंत्र संभावना है। आज का ट्रेड आपके कल के ट्रेड से पूरी तरह अलग है।'
3. *Al Brooks*: 'ट्रेंड के बीच में रिवर्सल ढूंढने की मूर्खता न करें। हमेशा ट्रेंड की दिशा में ही पुलबैक ढूंढें।'

आप नीचे दिए गए Buy / Sell बटन से सिमुलेशन में तुरंत ट्रेड टेस्ट कर सकते हैं या मुझसे कोई भी विशिष्ट सवाल पूछ सकते हैं!`;
}
