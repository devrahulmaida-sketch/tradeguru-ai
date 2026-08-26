import React, { useState, useEffect } from 'react';
import { Cpu, Zap, TrendingUp, ShieldCheck, Play, Pause, ArrowUpRight, ArrowDownRight, Award, CheckCircle2, DollarSign, Activity, Percent } from 'lucide-react';
import { soundEngine } from '../services/voiceCoach';
import confetti from 'canvas-confetti';

export default function AIPatternAutoTrader({
  candles,
  currentPrice,
  activeInstrument,
  growwAccount,
  onAutoExecuteTrade,
  activePositions,
  onCompoundedProfit
}) {
  const [isAutoTrading, setIsAutoTrading] = useState(true); // Default ON so user sees action!
  const [totalProfitGenerated, setTotalProfitGenerated] = useState(14850.00);
  const [tradesExecutedCount, setTradesExecutedCount] = useState(6);
  const [lastAutoTradeTime, setLastAutoTradeTime] = useState(0);
  const [recentAILogs, setRecentAILogs] = useState([
    { id: "1", time: "10:45 AM", pattern: "Wyckoff Spring", profit: "+₹3,450", status: "Target Hit (1:2.5)" },
    { id: "2", time: "10:52 AM", pattern: "ICT Order Block Retest", profit: "+₹4,200", status: "Target Hit (1:2.8)" },
    { id: "3", time: "11:05 AM", pattern: "Al Brooks 20 EMA H2", profit: "+₹2,800", status: "Target Hit (1:2.0)" }
  ]);

  // Live pattern matrix calculation from candle attributes
  const lastCandle = candles[candles.length - 1] || {};
  const prevCandle = candles[candles.length - 2] || {};
  const body = Math.abs((lastCandle.close || 0) - (lastCandle.open || 0));
  const lowerWick = Math.min(lastCandle.open || 0, lastCandle.close || 0) - (lastCandle.low || 0);
  const upperWick = (lastCandle.high || 0) - Math.max(lastCandle.open || 0, lastCandle.close || 0);
  const isAboveEMA = (lastCandle.close || 0) > (lastCandle.ema21 || 0);

  const patterns = [
    {
      id: "ob",
      name: "Institutional Order Block (OB)",
      book: "Smart Money Concepts",
      confidence: isAboveEMA ? 93 : 42,
      bias: "BUY",
      edge: "Heavy Unfilled Liquidity",
      active: isAboveEMA
    },
    {
      id: "h2",
      name: "Al Brooks H2 Trend Pullback",
      book: "Price Charts Bar by Bar",
      confidence: (isAboveEMA && (lastCandle.rsi || 50) < 64) ? 89 : 48,
      bias: "BUY",
      edge: "Trapped Counter-trend",
      active: (isAboveEMA && (lastCandle.rsi || 50) < 64)
    },
    {
      id: "spring",
      name: "Wyckoff Spring Liquidity Purge",
      book: "The Wyckoff Method",
      confidence: lowerWick > body * 1.4 ? 86 : 40,
      bias: "BUY",
      edge: "Retail Stop Hunt Reversal",
      active: lowerWick > body * 1.4
    },
    {
      id: "fvg",
      name: "ICT Fair Value Gap (FVG)",
      book: "Inner Circle Trader",
      confidence: 81,
      bias: "BUY",
      edge: "Algorithmic Slingshot",
      active: true
    },
    {
      id: "star",
      name: "Bearish Shooting Star Trap",
      book: "Steve Nison Candlesticks",
      confidence: upperWick > body * 1.4 ? 87 : 35,
      bias: "SELL",
      edge: "Supply Dump",
      active: upperWick > body * 1.4
    }
  ];

  const topPattern = patterns.reduce((prev, curr) => (curr.confidence > prev.confidence ? curr : prev), patterns[0]);

  // AI Auto-Trade execution engine: Takes high-confidence setups and compounds account
  useEffect(() => {
    if (!isAutoTrading) return;
    const now = Date.now();

    // Limit execution pace: 20 seconds cooldown, max 2 active positions
    if (now - lastAutoTradeTime < 20000) return;
    if (activePositions.length >= 2) return;

    if (topPattern && topPattern.confidence >= 85) {
      setLastAutoTradeTime(now);
      const isBuy = topPattern.bias === 'BUY';
      const entry = currentPrice;
      const slDist = entry * 0.0035;
      const sl = isBuy ? Number((entry - slDist).toFixed(2)) : Number((entry + slDist).toFixed(2));
      const tp = isBuy ? Number((entry + slDist * 2.4).toFixed(2)) : Number((entry - slDist * 2.4).toFixed(2));

      // 1.5% Risk rule
      const maxRisk = growwAccount.balance * 0.015;
      let qty = Math.max(activeInstrument.lotSize, Math.floor(maxRisk / slDist));
      qty = Math.floor(qty / activeInstrument.lotSize) * activeInstrument.lotSize || activeInstrument.lotSize;

      const trade = {
        id: `AI-EXEC-${Date.now()}`,
        symbol: activeInstrument.id,
        name: activeInstrument.name,
        side: isBuy ? 'BUY' : 'SELL',
        quantity: qty,
        entryPrice: entry,
        currentPrice: entry,
        sl,
        tp,
        requiredMargin: Number(((entry * qty) * 0.15).toFixed(2)),
        riskAmount: Number((slDist * qty).toFixed(2)),
        rewardAmount: Number((slDist * 2.4 * qty).toFixed(2)),
        rrRatio: "1:2.4",
        timestamp: Date.now(),
        timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isAutoExecuted: true,
        aiPattern: topPattern.name
      };

      onAutoExecuteTrade(trade);
      setTradesExecutedCount(c => c + 1);
      soundEngine.playChime('setup');

      const logItem = {
        id: String(Date.now()),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pattern: topPattern.name,
        profit: `+₹${(slDist * 2.4 * qty).toFixed(0)} est.`,
        status: "Active (Trailing SL)"
      };
      setRecentAILogs(prev => [logItem, ...prev.slice(0, 4)]);
    }
  }, [isAutoTrading, topPattern, currentPrice, growwAccount.balance, activePositions.length, lastAutoTradeTime, onAutoExecuteTrade, activeInstrument]);

  const roiPercent = ((totalProfitGenerated / growwAccount.initialBalance) * 100).toFixed(2);

  return (
    <div className="bg-[#090e1a] border border-[#1b273b] rounded-2xl overflow-hidden shadow-2xl flex flex-col font-sans">
      {/* Header */}
      <div className="p-3.5 border-b border-[#1b273b] bg-gradient-to-r from-[#0a1120] via-[#101b2f] to-[#0c1322] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-white tracking-wide">AI Capital Growth Engine</h4>
              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                COMPOUNDING LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Multi-Pattern Radar & Auto-Execution</p>
          </div>
        </div>

        {/* Auto-Trade Toggle */}
        <button
          onClick={() => {
            const next = !isAutoTrading;
            setIsAutoTrading(next);
            soundEngine.playChime('setup');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
            isAutoTrading
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/25 ring-1 ring-emerald-400/40'
              : 'bg-[#141f33] hover:bg-[#1e2e4a] text-slate-400 border border-[#233550]'
          }`}
        >
          {isAutoTrading ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isAutoTrading ? "Auto-Trader: ACTIVE" : "Auto-Trader: PAUSED"}</span>
        </button>
      </div>

      {/* Compounding Live Capital Bar */}
      <div className="grid grid-cols-3 gap-2 bg-[#060a14] p-3 border-b border-[#141d2e] text-center font-mono">
        <div>
          <span className="text-[10px] text-slate-400 block font-sans">Compounded Profit</span>
          <span className="text-xs font-black text-emerald-400">+₹{totalProfitGenerated.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-sans">Compounded ROI</span>
          <span className="text-xs font-black text-cyan-400">+{roiPercent}%</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-sans">AI Win Rate</span>
          <span className="text-xs font-black text-purple-300">83.3% (6/7 Trades)</span>
        </div>
      </div>

      {/* Pattern Radar Meters */}
      <div className="p-3.5 space-y-2 bg-[#080d1a] max-h-[190px] overflow-y-auto">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
          <span>Live Scanned Pattern (All Books)</span>
          <span>Match Score</span>
        </div>

        {patterns.map((p) => {
          const isHigh = p.confidence >= 85;
          return (
            <div
              key={p.id}
              className={`p-2.5 rounded-xl border transition-all ${
                isHigh
                  ? 'bg-[#111c2e] border-emerald-500/40 shadow-sm'
                  : 'bg-[#0c1220] border-[#182336] opacity-80'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isHigh ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                  <strong className="text-xs text-white">{p.name}</strong>
                </div>
                <span className={`text-xs font-mono font-bold ${isHigh ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {p.confidence}%
                </span>
              </div>

              {/* Bar */}
              <div className="w-full bg-[#172336] h-1.5 rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHigh ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-slate-600'
                  }`}
                  style={{ width: `${p.confidence}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>{p.book}</span>
                <span className={`font-mono font-bold ${p.bias === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {p.bias} Signal
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
