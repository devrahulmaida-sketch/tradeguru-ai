import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Sparkles, HelpCircle, CheckCircle2, RotateCcw, ShieldCheck, Target, TrendingUp, Info } from 'lucide-react';
import { soundEngine } from '../services/voiceCoach';
import confetti from 'canvas-confetti';

export default function SimpleLearningTerminal({
  activeInstrument,
  currentPrice,
  candles,
  onExecuteTrade,
  activePosition,
  onClosePosition
}) {
  const [dummyBalance, setDummyBalance] = useState(100000);
  const [lastLesson, setLastLesson] = useState(null);

  const lastCandle = candles[candles.length - 1] || {};
  const isAboveEMA = (lastCandle.close || currentPrice) > (lastCandle.ema21 || currentPrice);

  // 1-Click Simple Dummy BUY (Call / Bullish)
  const handleTestBuy = () => {
    const entry = currentPrice;
    const sl = Number((entry * 0.996).toFixed(2));
    const tp = Number((entry * 1.008).toFixed(2));
    const qty = activeInstrument.lotSize || 25;

    const trade = {
      id: `DUMMY-BUY-${Date.now()}`,
      symbol: activeInstrument.id,
      name: activeInstrument.name,
      side: "BUY",
      quantity: qty,
      entryPrice: entry,
      currentPrice: entry,
      sl,
      tp,
      timestamp: Date.now(),
      timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onExecuteTrade(trade);
    soundEngine.playChime('setup');

    setLastLesson({
      type: "BUY",
      title: "Aapne BUY (Call Trade) Test Kiya!",
      kyaHua: `Aapne ${activeInstrument.name} ko ₹${entry} par Dummy Buy kiya. Iska matlab aap maante hain ki buyers haavi hain aur market upar jayega.`,
      growwMatlab: "Real Groww App me isko NIFTY Call Option (CE) buy karna ya Stock khareedna kehte hain. Jab price upar jayegi to green me profit dikhega.",
      proTip: isAboveEMA
        ? "✅ Sahi Decision: Price 21 EMA ke upar hai, trend aapke sath hai!"
        : "⚠️ Dhyan Dein: Price 21 EMA ke neeche hai, counter-trend buy me risk zyada hota hai."
    });
  };

  // 1-Click Simple Dummy SELL (Put / Bearish)
  const handleTestSell = () => {
    const entry = currentPrice;
    const sl = Number((entry * 1.004).toFixed(2));
    const tp = Number((entry * 0.992).toFixed(2));
    const qty = activeInstrument.lotSize || 25;

    const trade = {
      id: `DUMMY-SELL-${Date.now()}`,
      symbol: activeInstrument.id,
      name: activeInstrument.name,
      side: "SELL",
      quantity: qty,
      entryPrice: entry,
      currentPrice: entry,
      sl,
      tp,
      timestamp: Date.now(),
      timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onExecuteTrade(trade);
    soundEngine.playChime('setup');

    setLastLesson({
      type: "SELL",
      title: "Aapne SELL (Put Trade) Test Kiya!",
      kyaHua: `Aapne ${activeInstrument.name} ko ₹${entry} par Dummy Short Sell kiya. Iska matlab aap maante hain ki sellers market ko neeche girayenge.`,
      growwMatlab: "Real Groww App me isko Put Option (PE) buy karna ya Intraday me pehle bechkar saste me wapas khareedna kehte hain. Jab market girega to aapko profit hoga.",
      proTip: !isAboveEMA
        ? "✅ Sahi Decision: Price 21 EMA ke neeche gir rahi hai, sellers ka flow hai!"
        : "⚠️ Dhyan Dein: Market uptrend me hai, sellers yahan trap ho sakte hain."
    });
  };

  // Exit Practice Trade
  const handleExitPractice = () => {
    if (!activePosition) return;
    const ltp = currentPrice;
    const diff = activePosition.side === 'BUY' ? ltp - activePosition.entryPrice : activePosition.entryPrice - ltp;
    const pnl = diff * activePosition.quantity;

    onClosePosition(activePosition.id);
    setDummyBalance(b => b + pnl);

    if (pnl > 0) {
      soundEngine.playChime('profit');
      try { confetti({ particleCount: 30, spread: 50 }); } catch (_) {}
    } else {
      soundEngine.playChime('sl');
    }

    setLastLesson({
      type: pnl >= 0 ? "WIN" : "LOSS",
      title: pnl >= 0 ? "🎯 Mubaarak! Practice Trade Profit Me Band Hua" : "🛑 Stop Loss / Safe Exit Hua",
      kyaHua: `Trade close ho gaya. Result: ${pnl >= 0 ? '+' : ''}₹${pnl.toFixed(2)} (Dummy Money). Aapka koi asli paisa kharch nahi hua!`,
      growwMatlab: "Real Groww me 'Square Off' button dabane par aisi hi exit hoti hai aur profit aapke Groww wallet me credit ho jata hai.",
      proTip: pnl >= 0
        ? "Mark Douglas Rule: Target aane par profit book karna hi discipline hai."
        : "Alexander Elder Rule: Chhote loss me nikal jana hi account ko bacha kar rakhta hai."
    });
  };

  // Calculate live P&L of active practice position
  const currentDiff = activePosition
    ? (activePosition.side === 'BUY' ? currentPrice - activePosition.entryPrice : activePosition.entryPrice - currentPrice)
    : 0;
  const currentPnl = activePosition ? currentDiff * activePosition.quantity : 0;
  const isPnlPositive = currentPnl >= 0;

  return (
    <div className="bg-[#080d19] border border-[#162236] rounded-xl p-4 shadow-xl flex flex-col space-y-3.5 font-sans">
      {/* Header with Dummy Balance */}
      <div className="flex items-center justify-between border-b border-[#162236] pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              100% Free Learning Mode
            </h3>
          </div>
          <p className="text-[11px] text-slate-400">Zero Real Risk • Live Market Pe Sikhne Ka Terminal</p>
        </div>

        <div className="text-right font-mono">
          <span className="text-[10px] text-slate-400 block font-sans">Dummy Practice Capital</span>
          <span className="text-sm font-black text-emerald-400">
            ₹{dummyBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Main Big Educational Buttons (Only 2 Primary Actions!) */}
      {!activePosition ? (
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Market Me Test Trade Lein:</span>
            <span className="text-[11px] text-cyan-400 font-mono">
              LTP: ₹{currentPrice.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* BUY BUTTON */}
            <button
              onClick={handleTestBuy}
              className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-600/20 active:scale-98"
            >
              <div className="flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" />
                <span>TEST BUY (Tezi)</span>
              </div>
              <span className="text-[10px] text-emerald-200 font-normal">
                Upar Jane Par Profit
              </span>
            </button>

            {/* SELL BUTTON */}
            <button
              onClick={handleTestSell}
              className="py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 shadow-lg shadow-rose-600/20 active:scale-98"
            >
              <div className="flex items-center gap-1">
                <ArrowDownRight className="w-4 h-4" />
                <span>TEST SELL (Mandi)</span>
              </div>
              <span className="text-[10px] text-rose-200 font-normal">
                Neeche Jane Par Profit
              </span>
            </button>
          </div>

          {/* Simple AI Hint */}
          <div className="p-2.5 rounded-lg bg-[#0e1626] border border-[#1b293e] text-[11px] text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <p>
              <strong>AI Guru Advice:</strong> Abhi price 21 EMA ke {isAboveEMA ? 'upar' : 'neeche'} hai. {isAboveEMA ? 'BUY (Tezi)' : 'SELL (Mandi)'} ka button dabakar test karein!
            </p>
          </div>
        </div>
      ) : (
        /* Active Practice Trade In Progress */
        <div className="bg-[#0e1626] border border-[#1f2e47] rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1b293e] pb-2">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                activePosition.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {activePosition.side} PRACTICE TRADE
              </span>
              <span className="text-xs font-bold text-white">{activePosition.name}</span>
            </div>

            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 block font-sans">Live Practice P&L</span>
              <span className={`text-sm font-black ${isPnlPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPnlPositive ? '+' : ''}₹{currentPnl.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-[#090e1a] p-2 rounded-lg border border-[#162236]">
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Entry Price</span>
              <span className="text-white font-bold">₹{activePosition.entryPrice}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Current Price</span>
              <span className="text-cyan-400 font-bold">₹{currentPrice.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Target / SL</span>
              <span className="text-slate-300 text-[11px]">TP: {activePosition.tp}</span>
            </div>
          </div>

          {/* Big Exit Button */}
          <button
            onClick={handleExitPractice}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            <span>🛑 Practice Trade Square Off Karein</span>
          </button>
        </div>
      )}

      {/* Instant Educational Explanation Card ("Samjho Yeh Kya Hua") */}
      {lastLesson && (
        <div className="bg-[#0b1220] border border-[#1e2f4a] rounded-xl p-3.5 space-y-2 text-xs animate-in fade-in">
          <div className="flex items-center gap-1.5 font-bold text-amber-400 border-b border-[#18263c] pb-1.5">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{lastLesson.title}</span>
          </div>

          <p className="text-slate-200 text-[11px] leading-relaxed">
            {lastLesson.kyaHua}
          </p>

          <div className="bg-[#101a2c] p-2 rounded-lg border border-[#1b2b44] text-[11px] text-emerald-300 space-y-0.5">
            <strong className="block text-emerald-400">📱 Real Groww Me Iska Kya Matlab Hai?</strong>
            <p>{lastLesson.growwMatlab}</p>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            {lastLesson.proTip}
          </p>
        </div>
      )}
    </div>
  );
}
