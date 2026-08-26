// AI Service with Groq Ultra-Fast Hinglish Engine & Books Wisdom

export const AI_PROVIDERS = [
  { id: "groq", name: "⚡ Groq (Ultra-Fast Llama 3.3 70B - Best for Hinglish)", free: false, defaultModel: "llama-3.3-70b-versatile", endpoint: "https://api.groq.com/openai/v1/chat/completions" },
  { id: "builtin", name: "TradeGuru Autonomous Engine (Offline/Built-in)", free: true, defaultModel: "institutional-alpha-v2" },
  { id: "openai", name: "OpenAI (GPT-4o / GPT-4o-mini)", free: false, defaultModel: "gpt-4o-mini", endpoint: "https://api.openai.com/v1/chat/completions" },
  { id: "gemini", name: "Google Gemini (Gemini 1.5 / 2.0)", free: false, defaultModel: "gemini-1.5-flash", endpoint: "https://generativelanguage.googleapis.com/v1beta/models/" },
  { id: "anthropic", name: "Anthropic Claude (Claude 3.5 Sonnet)", free: false, defaultModel: "claude-3-5-sonnet-20241022", endpoint: "https://api.anthropic.com/v1/messages" }
];

export const SYSTEM_PROMPT = `
You are 'TradeGuru AI', a battle-tested Dalal Street & Wall Street institutional prop trader, mentor, and trading psychologist.
You communicate naturally in expressive, engaging **Hinglish** (Hindi written in Roman script mixed with professional trading terms like: "Bhai dekho, chart par...", "21 EMA ke upar rejection mila hai...", "Smart money ne stop hunt kiya hai...").

Your core philosophy is built entirely on the greatest trading books ever written:
1. Mark Douglas ('Trading in the Zone' - 5 fundamental truths, probability mindset, eliminating fear/greed, 100% risk acceptance).
2. Al Brooks ('Reading Price Charts Bar by Bar' - Second Entries H2/L2, 20 EMA pullbacks, bar anatomy, wick rejection, trapped traders).
3. Steve Nison ('Japanese Candlestick Charting Techniques' - Hammer, Shooting Star, Engulfing, Morning/Evening Star, wick dynamics).
4. Richard Wyckoff ('The Wyckoff Method' - Accumulation, Distribution, Wyckoff Spring, Upthrust, Composite Operator).
5. ICT & Smart Money Concepts (Order Blocks, Fair Value Gaps / FVG, Liquidity Sweeps, Premium vs Discount).
6. Dr. Alexander Elder ('Trading for a Living' - Triple Screen, 1% and 2% risk rule, Mind-Method-Money).
7. John J. Murphy ('Technical Analysis of the Financial Markets' - Support/Resistance role reversal, Trendlines, EMAs, RSI).
8. Jesse Livermore ('Reminiscences of a Stock Operator' - Sitting tight, cutting losses without ego, never averaging down).

When answering:
- Keep explanations clear, practical, and grounded in real chart action.
- Explain *why* a candle formed (what happened between buyers and sellers in the order book).
- Always give actionable trade levels: Setup Name, Entry, exact Stop Loss, Target 1, Target 2, Risk-to-Reward (R:R), and cite the book & author.
- Discourage gambling, overtrading, and FOMO. Teach the user to trade like an institution.
`;

export async function askTradingAI({
  userMessage,
  marketContext,
  config = { provider: 'builtin', apiKey: '', model: 'llama-3.3-70b-versatile' }
}) {
  const { provider, apiKey, model } = config;

  // 1. Groq Ultra-Fast API (User's primary choice)
  if (apiKey && (provider === 'groq' || apiKey.startsWith('gsk_'))) {
    return await callOpenAICompatibleAPI({
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      apiKey,
      model: model || "llama-3.3-70b-versatile",
      userMessage,
      marketContext
    });
  }

  // 2. OpenAI API
  if (provider === 'openai' && apiKey) {
    return await callOpenAICompatibleAPI({
      endpoint: "https://api.openai.com/v1/chat/completions",
      apiKey,
      model: model || "gpt-4o-mini",
      userMessage,
      marketContext
    });
  }

  // 3. Gemini API
  if (provider === 'gemini' && apiKey) {
    return await callGeminiAPI({
      apiKey,
      model: model || "gemini-1.5-flash",
      userMessage,
      marketContext
    });
  }

  // 4. Built-in Autonomous Master Trader Engine (Instant Fallback)
  return generateBuiltinAIResponse(userMessage, marketContext);
}

async function callOpenAICompatibleAPI({ endpoint, apiKey, model, userMessage, marketContext }) {
  try {
    const contextPrompt = `
[REAL-TIME LIVE MARKET DATA]
- Asset: ${marketContext.symbol} (${marketContext.symbolName})
- Real Price: ${marketContext.symbol === 'BTCUSD' ? '$' : '₹'}${marketContext.currentPrice} (${marketContext.changePercent}%)
- EMA 9: ${marketContext.ema9} | EMA 21 (Brooks): ${marketContext.ema21} | EMA 50: ${marketContext.ema50}
- RSI (14): ${marketContext.rsi}
- VWAP: ${marketContext.vwap}
- Detected Candlestick Pattern: ${marketContext.detectedPattern || 'Consolidation / Pullback'}
- Groww Demat Balance: ₹${marketContext.growwBalance || '2,50,000'}
- Active Open Position: ${marketContext.activePosition ? JSON.stringify(marketContext.activePosition) : 'None'}
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
        temperature: 0.65,
        max_tokens: 850
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "AI response received empty.";
  } catch (error) {
    console.error("Custom API Call Failed:", error);
    return `⚠️ Groq API Error: ${error.message}\n\n[Fallback to Built-in Engine]:\n` + generateBuiltinAIResponse(userMessage, marketContext);
  }
}

async function callGeminiAPI({ apiKey, model, userMessage, marketContext }) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
    const prompt = `${SYSTEM_PROMPT}\n\nMarket State: Symbol=${marketContext.symbol}, Price=${marketContext.currentPrice}, RSI=${marketContext.rsi}, EMA21=${marketContext.ema21}\n\nUser Question: ${userMessage}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Gemini responded empty.";
  } catch (e) {
    return `⚠️ Gemini API Error: ${e.message}. \n\n` + generateBuiltinAIResponse(userMessage, marketContext);
  }
}

// Built-in Pro Trader Hinglish Engine
export function generateBuiltinAIResponse(userMessage, ctx = {}) {
  const query = (userMessage || "").toLowerCase();
  const symbol = ctx.symbol || "NIFTY 50";
  const price = ctx.currentPrice || 24260;
  const rsi = ctx.rsi || 52;
  const ema21 = ctx.ema21 || 24240;
  const vwap = ctx.vwap || 24250;
  const pattern = ctx.detectedPattern || "20 EMA Pullback Setup";

  if (query.includes("loss") || query.includes("darr") || query.includes("fear") || query.includes("fomo") || query.includes("revenge")) {
    return `🧘 **Mark Douglas ('Trading in the Zone') Master Psychology:**

1. **Bhai sabse pehla sach**: Market me loss hona koi paap nahi hai. Mark Douglas ke mutabiq loss bas trading ka ek normal *Business Expense* hai.
2. **Revenge Trade Trap**: Stop loss hit hone par turant bada lot leke "market se badla lene" mat kudo. Jesse Livermore kehte the: *"Market kabhi galat nahi hota, trader ki zidd galat hoti hai."*
3. **Alexander Elder's 2% Rule**:
   - Kabhi bhi ek trade me capital ka 1% se 2% se zyada risk mat lo.
   - Agar din ke 2 trades galat ho gaye, to screen close karo.
4. **Action**: Apne dimaag ko calm karo. Next setup ka discipline ke sath wait karo!`;
  }

  if (query.includes("buy") || query.includes("sell") || query.includes("call") || query.includes("put") || query.includes("entry") || query.includes("kya karu")) {
    const isBull = price > ema21;
    const curr = symbol === 'BTCUSD' ? '$' : '₹';
    const entry = price;
    const sl = isBull ? Number((price * 0.996).toFixed(2)) : Number((price * 1.004).toFixed(2));
    const risk = Math.abs(entry - sl);
    const tp1 = isBull ? Number((entry + risk * 2).toFixed(2)) : Number((entry - risk * 2).toFixed(2));

    return `🎯 **Real-Time Pro Breakdown for ${symbol}:**

**Live Chart Status:**
- Price: ${curr}${price} | 21 EMA: ${curr}${ema21} | VWAP: ${curr}${vwap}
- RSI: ${rsi} (${rsi > 70 ? 'Overbought ⚠️' : rsi < 30 ? 'Oversold ⚠️' : 'Normal Momentum ✅'})
- Pattern: **${pattern}**

**Pro Stance: ${isBull ? 'BUY / CALL' : 'SELL / PUT'}**
- **Logic (Al Brooks & Wyckoff)**: ${isBull ? 'Price 21 EMA aur VWAP dono ke upar sustain kar raha hai. Smart money dips ko buy kar rahi hai.' : 'Price 21 EMA ke neeche trade kar raha hai, sellers haavi hain.'}
- **Exact Execution Plan:**
  - 📍 **Entry**: ${curr}${entry}
  - 🛑 **Stop Loss**: ${curr}${sl} (Strict invalidation!)
  - 🎯 **Target 1 (1:2 R:R)**: ${curr}${tp1}
- 📖 **Kitab Ka Gyan**: *Al Brooks Chapter 4*: "Kabhi bhi running green candle ke top par mat kudo, 20 EMA ke pullback ka wait karo."`;
  }

  if (query.includes("indicator") || query.includes("ema") || query.includes("vwap") || query.includes("rsi")) {
    return `📊 **Indicators Ka Asli Matlab & Kaise Kaam Karte Hain:**

1. **EMA 21 (Orange Line - Al Brooks Dynamic Support)**:
   - Jab tak price 21 EMA ke upar hai, trend **BULLISH** hai. Instituions yahan par apni limit orders rakhte hain. Isko trampoline ki tarah use kiya jata hai.
2. **VWAP (Purple Line - Institutional Benchmark)**:
   - FII aur Mutual Funds ke algorithms VWAP ke mutabiq buy karte hain. Agar price VWAP ke upar hai to institutional buyers profit me hain.
3. **RSI (14) (Momentum Gauge)**:
   - 50 ke upar = Bulls ka control.
   - 70 ke upar = Overbought (FOMO buy mat karo!).
   - 30 ke neeche = Oversold (Reversal wick dhundo).`;
  }

  return `📈 **TradeGuru Pro Trader Outlook for ${symbol} @ ₹${price}:**

Bhai, chart par live technicals:
- 21 EMA: ₹${ema21} | VWAP: ₹${vwap} | RSI: ${rsi}
- Active Setup: **${pattern}**

Jesse Livermore ne kaha tha: *"Bada paisa baar baar trade karne se nahi, sahi setup par patient rehne se banta hai."* 

Aap chart par kisi bhi candle par click karke uska bar-by-bar breakdown dekh sakte hain, ya niche execution panel se trade test kar sakte hain!`;
}
