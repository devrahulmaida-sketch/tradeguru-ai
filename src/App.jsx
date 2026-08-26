import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Layers, Activity, Target, Bot, Zap,
  BookOpen, Bell, BellOff, RefreshCw, Lock, ShieldCheck, Wallet,
  ChevronRight, Play, Pause, ArrowUpRight, ArrowDownRight, Compass
} from 'lucide-react';

import ChartSection from './components/ChartSection';
import AIPatternAutoTrader from './components/AIPatternAutoTrader';
import MarketDepthTape from './components/MarketDepthTape';
import AIMentorPanel from './components/AIMentorPanel';
import OrderExecutionPanel from './components/OrderExecutionPanel';
import PositionsJournal from './components/PositionsJournal';
import AIChatMentor from './components/AIChatMentor';
import GrowwAuthModal from './components/GrowwAuthModal';
import AIConfigModal from './components/AIConfigModal';
import GyanLibraryModal from './components/GyanLibraryModal';
import CandleInspectorModal from './components/CandleInspectorModal';
import SetupsHubModal from './components/SetupsHubModal';

import { INSTRUMENTS } from './data/marketSymbols';
import { fetchLiveRealCandles, calculateIndicators, evaluateRealTimeTradeSetup, explainCandleInHinglish } from './services/marketData';
import { loadGrowwAccount, saveGrowwAccount } from './services/growwService';
import { soundEngine } from './services/voiceCoach';
import confetti from 'canvas-confetti';

export default function App() {
  // Instruments & Market State
  const [instruments] = useState(INSTRUMENTS);
  const [activeInstrument, setActiveInstrument] = useState(INSTRUMENTS[0]);
  const [candles, setCandles] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(INSTRUMENTS[0].basePrice);
  const [currentPrices, setCurrentPrices] = useState({
    NIFTY50: 24260.00,
    BANKNIFTY: 57880.00,
    BTCUSD: 79050.00,
    RELIANCE: 1303.10,
    HDFCBANK: 727.50
  });

  // Positions & Trades
  const [activePositions, setActivePositions] = useState([]);
  const [closedTrades, setClosedTrades] = useState([
    {
      id: "INIT-1",
      symbol: "NIFTY50",
      name: "NIFTY 50",
      side: "BUY",
      quantity: 50,
      entryPrice: 24210.00,
      exitPrice: 24270.00,
      finalPnL: 3000.00,
      exitReason: "Target 1 Hit (1:2 R:R)",
      aiReview: "Flawless Al Brooks 20 EMA pullback entry. Compounded Groww balance safely.",
      timeClosedFormatted: "09:42 AM"
    }
  ]);

  // Groww & AI Config
  const [growwAccount, setGrowwAccount] = useState(() => loadGrowwAccount());
  const [aiConfig, setAiConfig] = useState(() => {
    try {
      const saved = localStorage.getItem("trade_ai_config");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return { provider: "groq", apiKey: "", model: "llama-3.3-70b-versatile" };
  });

  // Ticking & Setups
  const [currentSetup, setCurrentSetup] = useState(null);
  const [presetOrder, setPresetOrder] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [tickSpeed, setTickSpeed] = useState(1);
  const [ticksInCurrentCandle, setTicksInCurrentCandle] = useState(0);

  // Terminal UI State
  const [rightSidebarTab, setRightSidebarTab] = useState("execute"); // "execute" | "autotrader" | "signals" | "chat"
  const [bottomTrayTab, setBottomTrayTab] = useState("positions"); // "positions" | "depth" | "journal"
  const [soundMode, setSoundMode] = useState("CHIMES_ONLY");
  const [currentTime, setCurrentTime] = useState("");

  // Modals
  const [isGrowwModalOpen, setIsGrowwModalOpen] = useState(false);
  const [isAIConfigModalOpen, setIsAIConfigModalOpen] = useState(false);
  const [isGyanLibraryOpen, setIsGyanLibraryOpen] = useState(false);
  const [isSetupsHubOpen, setIsSetupsHubOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectedCandleData, setInspectedCandleData] = useState(null);
  const [chatExternalPrompt, setChatExternalPrompt] = useState("");

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load Real Candles
  useEffect(() => {
    let isMounted = true;
    fetchLiveRealCandles(activeInstrument.id).then((realCandles) => {
      if (!isMounted || !realCandles || realCandles.length === 0) return;
      setCandles(realCandles);
      const lastClose = realCandles[realCandles.length - 1].close;
      setCurrentPrice(lastClose);
      setCurrentPrices(p => ({ ...p, [activeInstrument.id]: lastClose }));
      const setup = evaluateRealTimeTradeSetup(realCandles, activeInstrument);
      setCurrentSetup(setup);
      setTicksInCurrentCandle(0);
    });
    return () => { isMounted = false; };
  }, [activeInstrument]);

  // Persist Groww Account
  useEffect(() => {
    saveGrowwAccount(growwAccount);
  }, [growwAccount]);

  const handleSaveAIConfig = (newConfig) => {
    setAiConfig(newConfig);
    try {
      localStorage.setItem("trade_ai_config", JSON.stringify(newConfig));
    } catch (_) {}
  };

  const handleInspectCandle = (candle, prevCandle) => {
    const explanation = explainCandleInHinglish(candle, prevCandle, activeInstrument.name);
    setInspectedCandleData(explanation);
    setIsInspectorOpen(true);
    soundEngine.playChime('setup');
  };

  // Check SL / TP
  const checkPositionTriggers = useCallback((sym, price) => {
    setActivePositions((prevPositions) => {
      const remaining = [];
      prevPositions.forEach((pos) => {
        if (pos.symbol !== sym) {
          remaining.push(pos);
          return;
        }

        let isClosed = false;
        let exitReason = "";
        let finalPnL = 0;
        let aiReview = "";

        if (pos.side === 'BUY') {
          if (pos.tp && price >= pos.tp) {
            isClosed = true;
            exitReason = "Target Reached (TP)";
            finalPnL = (pos.tp - pos.entryPrice) * pos.quantity;
            aiReview = "Target Hit! Mark Douglas Rule: Institutional profit compounded.";
          } else if (pos.sl && price <= pos.sl) {
            isClosed = true;
            exitReason = "Stop Loss Hit (SL)";
            finalPnL = (pos.sl - pos.entryPrice) * pos.quantity;
            aiReview = "Disciplined Stop Loss: Dr. Alexander Elder 1-2% rule honored.";
          }
        } else if (pos.side === 'SELL') {
          if (pos.tp && price <= pos.tp) {
            isClosed = true;
            exitReason = "Target Reached (TP)";
            finalPnL = (pos.entryPrice - pos.tp) * pos.quantity;
            aiReview = "Short Target Hit! Wyckoff Distribution played out according to plan.";
          } else if (pos.sl && price >= pos.sl) {
            isClosed = true;
            exitReason = "Stop Loss Hit (SL)";
            finalPnL = (pos.entryPrice - pos.sl) * pos.quantity;
            aiReview = "Structural SL Hit: Smart Money shifted momentum.";
          }
        }

        if (isClosed) {
          if (finalPnL > 0) {
            soundEngine.playChime('profit');
            try { confetti({ particleCount: 35, spread: 50 }); } catch (_) {}
          } else {
            soundEngine.playChime('sl');
          }

          const closedItem = {
            ...pos,
            exitPrice: pos.tp && price >= pos.tp ? pos.tp : pos.sl,
            exitReason,
            finalPnL,
            aiReview,
            timeClosedFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          };

          setClosedTrades(hist => [closedItem, ...hist]);
          setGrowwAccount(acc => ({
            ...acc,
            balance: acc.balance + finalPnL,
            realizedPnL: (acc.realizedPnL || 0) + finalPnL
          }));
        } else {
          remaining.push(pos);
        }
      });
      return remaining;
    });
  }, []);

  // Tick generator
  const tickMarket = useCallback(() => {
    setCandles((prevCandles) => {
      if (!prevCandles || prevCandles.length === 0) return prevCandles;

      const lastIdx = prevCandles.length - 1;
      const lastCandle = { ...prevCandles[lastIdx] };

      const noise = (Math.random() - 0.49) * activeInstrument.volatility * lastCandle.close * 0.4;
      const newClose = Number((lastCandle.close + noise).toFixed(2));
      const newHigh = Number(Math.max(lastCandle.high, newClose).toFixed(2));
      const newLow = Number(Math.min(lastCandle.low, newClose).toFixed(2));
      const addedVolume = Math.floor(10 + Math.random() * 80);

      setCurrentPrice(newClose);
      setCurrentPrices(p => ({ ...p, [activeInstrument.id]: newClose }));

      checkPositionTriggers(activeInstrument.id, newClose);

      let nextCandles = [...prevCandles];
      if (ticksInCurrentCandle >= 12) {
        setTicksInCurrentCandle(0);
        const newTime = new Date();
        const freshCandle = {
          time: newTime.getTime(),
          timeFormatted: newTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          open: newClose,
          high: newClose,
          low: newClose,
          close: newClose,
          volume: addedVolume
        };
        nextCandles.push(freshCandle);
        if (nextCandles.length > 80) nextCandles.shift();
      } else {
        setTicksInCurrentCandle(c => c + 1);
        lastCandle.close = newClose;
        lastCandle.high = newHigh;
        lastCandle.low = newLow;
        lastCandle.volume += addedVolume;
        nextCandles[lastIdx] = lastCandle;
      }

      const updated = calculateIndicators(nextCandles);
      const setup = evaluateRealTimeTradeSetup(updated, activeInstrument);
      setCurrentSetup(setup);
      return updated;
    });
  }, [activeInstrument, ticksInCurrentCandle, checkPositionTriggers]);

  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(200, 1000 / tickSpeed);
    const timer = setInterval(() => {
      tickMarket();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, tickSpeed, tickMarket]);

  const handleExecuteTrade = (trade) => {
    setActivePositions(prev => [trade, ...prev]);
    soundEngine.playChime('setup');
  };

  const handleManualClosePosition = (positionId) => {
    const pos = activePositions.find(p => p.id === positionId);
    if (!pos) return;

    const ltp = currentPrices[pos.symbol] || pos.entryPrice;
    const diff = pos.side === 'BUY' ? ltp - pos.entryPrice : pos.entryPrice - ltp;
    const finalPnL = diff * pos.quantity;

    const closedItem = {
      ...pos,
      exitPrice: ltp,
      exitReason: "Manual Square Off",
      finalPnL,
      aiReview: "Manual exit recorded. Discretion exercised.",
      timeClosedFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setActivePositions(prev => prev.filter(p => p.id !== positionId));
    setClosedTrades(hist => [closedItem, ...hist]);
    setGrowwAccount(acc => ({
      ...acc,
      balance: acc.balance + finalPnL,
      realizedPnL: (acc.realizedPnL || 0) + finalPnL
    }));
    soundEngine.playChime(finalPnL >= 0 ? 'profit' : 'sl');
  };

  const marketContext = {
    symbol: activeInstrument.id,
    symbolName: activeInstrument.name,
    currentPrice: currentPrice,
    changePercent: (((currentPrice - (candles[0]?.open || currentPrice)) / (candles[0]?.open || 1)) * 100).toFixed(2),
    ema9: candles[candles.length - 1]?.ema9 || currentPrice,
    ema21: candles[candles.length - 1]?.ema21 || currentPrice,
    ema50: candles[candles.length - 1]?.ema50 || currentPrice,
    vwap: candles[candles.length - 1]?.vwap || currentPrice,
    rsi: candles[candles.length - 1]?.rsi || 50,
    detectedPattern: currentSetup?.setupName,
    growwBalance: growwAccount.balance,
    activePosition: activePositions.find(p => p.symbol === activeInstrument.id) || null
  };

  const hasGroqKey = Boolean(aiConfig.apiKey && (aiConfig.provider === 'groq' || aiConfig.apiKey.startsWith('gsk_')));

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white font-sans antialiased">
      {/* 1. Top High-Density Financial Header */}
      <header className="bg-[#080d1a] border-b border-[#141e30] px-3 sm:px-4 py-2 select-none flex items-center justify-between gap-3">
        {/* Brand & Market Selectors */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black font-mono text-xs">
              TG
            </div>
            <span className="text-sm font-extrabold text-white tracking-tight">TradeGuru</span>
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              PRO
            </span>
          </div>

          {/* Quick Instrument Switcher */}
          <div className="hidden md:flex items-center bg-[#0d1424] p-0.5 rounded-lg border border-[#1a263c] text-xs font-medium">
            {instruments.map((inst) => (
              <button
                key={inst.id}
                onClick={() => setActiveInstrument(inst)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeInstrument.id === inst.id
                    ? 'bg-[#182338] text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {inst.name}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Live Quote Banner */}
        <div className="hidden lg:flex items-center gap-3 font-mono text-xs">
          <span className="text-slate-400">{activeInstrument.name}:</span>
          <span className="text-base font-black text-white">
            {activeInstrument.currency}{currentPrice?.toFixed(2)}
          </span>
          <span className="text-emerald-400 font-bold flex items-center gap-0.5 text-[11px]">
            <TrendingUp className="w-3 h-3" /> +0.48%
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400 text-[11px]">VWAP: {activeInstrument.currency}{(candles[candles.length - 1]?.vwap || currentPrice).toFixed(2)}</span>
          <span className="text-slate-400 text-[11px]">21 EMA: {activeInstrument.currency}{(candles[candles.length - 1]?.ema21 || currentPrice).toFixed(2)}</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Institutional Setups Hub */}
          <button
            onClick={() => setIsSetupsHubOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-[#0e1626] hover:bg-[#162238] text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1"
          >
            <Target className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Setups Hub</span>
          </button>

          {/* Groq Key Config */}
          <button
            onClick={() => setIsAIConfigModalOpen(true)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 border ${
              hasGroqKey
                ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{hasGroqKey ? 'Groq Active' : 'Add Groq Key'}</span>
          </button>

          {/* Audio Chime Mute */}
          <button
            onClick={() => {
              const next = soundMode === 'CHIMES_ONLY' ? 'MUTED' : 'CHIMES_ONLY';
              setSoundMode(next);
              soundEngine.setMode(next);
            }}
            className={`p-1.5 rounded-lg border text-xs ${
              soundMode === 'CHIMES_ONLY'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-[#0e1626] text-slate-500 border-[#1c283d]'
            }`}
            title="Toggle Sound Alerts"
          >
            {soundMode === 'CHIMES_ONLY' ? <Bell className="w-4 h-4 text-emerald-400" /> : <BellOff className="w-4 h-4" />}
          </button>

          {/* Books Gyan Modal */}
          <button
            onClick={() => setIsGyanLibraryOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-[#0e1626] hover:bg-[#162238] text-slate-300 hover:text-white border border-[#1e2a3f] text-xs font-semibold transition-all flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Books (9+)</span>
          </button>

          {/* Groww Demat Button */}
          <button
            onClick={() => setIsGrowwModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-[#0e1626] hover:bg-[#162238] text-white text-xs font-semibold transition-all flex items-center gap-1.5 border border-emerald-500/40"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 hidden sm:inline">Groww:</span>
            <span className="font-mono font-bold text-emerald-400">
              ₹{(growwAccount.balance / 1000).toFixed(1)}k
            </span>
          </button>
        </div>
      </header>

      {/* 2. Global Ticker Tape */}
      <div className="bg-[#03060d] border-b border-[#121927] px-3 sm:px-4 py-1 overflow-x-auto no-scrollbar text-[11px] font-mono select-none flex items-center gap-5 whitespace-nowrap">
        <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          NSE / GLOBAL TAPE:
        </span>
        <div className="flex items-center gap-4 text-slate-300">
          <span>NIFTY 50: <strong className="text-white">₹{(currentPrices.NIFTY50).toFixed(2)}</strong> <span className="text-emerald-400 font-semibold">(+0.45%)</span></span>
          <span className="text-slate-700">|</span>
          <span>BANK NIFTY: <strong className="text-white">₹{(currentPrices.BANKNIFTY).toFixed(2)}</strong> <span className="text-emerald-400 font-semibold">(+0.68%)</span></span>
          <span className="text-slate-700">|</span>
          <span>BTC/USDT: <strong className="text-white">${(currentPrices.BTCUSD).toFixed(2)}</strong> <span className="text-emerald-400 font-semibold">(+1.34%)</span></span>
          <span className="text-slate-700">|</span>
          <span>RELIANCE: <strong className="text-white">₹{(currentPrices.RELIANCE).toFixed(2)}</strong> <span className="text-emerald-400 font-semibold">(+0.28%)</span></span>
          <span className="text-slate-700">|</span>
          <span>HDFC BANK: <strong className="text-white">₹{(currentPrices.HDFCBANK).toFixed(2)}</strong> <span className="text-rose-400 font-semibold">(-0.12%)</span></span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400">SEBI 2FA: <strong className="text-emerald-400">AUTHENTICATED</strong></span>
        </div>
      </div>

      {/* 3. Main Unified Terminal Workstation */}
      <main className="flex-1 w-full p-2 sm:p-3 grid grid-cols-1 xl:grid-cols-12 gap-2.5">
        {/* Left / Center Section (Chart & Bottom Dock Tray) - 8 Cols */}
        <div className="xl:col-span-8 flex flex-col space-y-2.5">
          {/* Real Candlestick Chart */}
          <ChartSection
            candles={candles}
            currentPrice={currentPrice}
            activeInstrument={activeInstrument}
            onSelectInstrument={setActiveInstrument}
            instruments={instruments}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            tickSpeed={tickSpeed}
            setTickSpeed={setTickSpeed}
            activePosition={activePositions.find(p => p.symbol === activeInstrument.id)}
            currentSetup={currentSetup}
            onManualTick={tickMarket}
            onInspectCandle={handleInspectCandle}
          />

          {/* Bottom Dock Tray: Positions / Market Depth / Journal Tabs */}
          <div className="bg-[#080d19] border border-[#141e30] rounded-xl overflow-hidden shadow-lg flex-1 flex flex-col">
            {/* Tray Tab Bar */}
            <div className="flex items-center justify-between border-b border-[#141e30] bg-[#0b1220] px-3 py-1.5">
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setBottomTrayTab("positions")}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                    bottomTrayTab === "positions"
                      ? "bg-[#162238] text-emerald-400 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Open Positions ({activePositions.length})</span>
                </button>

                <button
                  onClick={() => setBottomTrayTab("depth")}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                    bottomTrayTab === "depth"
                      ? "bg-[#162238] text-cyan-400 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Order Book (L2 Depth)</span>
                </button>

                <button
                  onClick={() => setBottomTrayTab("journal")}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                    bottomTrayTab === "journal"
                      ? "bg-[#162238] text-purple-400 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>AI Trade Journal ({closedTrades.length})</span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-slate-400">
                Groww Demat DP: <strong className="text-white">1208160019284729</strong>
              </div>
            </div>

            {/* Tray Content */}
            <div className="p-3">
              {bottomTrayTab === "positions" && (
                <PositionsJournal
                  activePositions={activePositions}
                  closedTrades={closedTrades}
                  onClosePosition={handleManualClosePosition}
                  currentPrices={currentPrices}
                />
              )}

              {bottomTrayTab === "depth" && (
                <MarketDepthTape
                  currentPrice={currentPrice}
                  activeInstrument={activeInstrument}
                />
              )}

              {bottomTrayTab === "journal" && (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {closedTrades.map((t) => (
                    <div key={t.id} className="bg-[#0d1424] p-2.5 rounded-lg border border-[#162238] flex items-center justify-between text-xs font-mono">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${t.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {t.side}
                          </span>
                          <strong className="text-white font-sans">{t.name}</strong>
                          <span className="text-slate-400">{t.quantity} Qty @ {t.entryPrice} ➔ {t.exitPrice}</span>
                        </div>
                        <p className="text-[11px] text-purple-300 font-sans mt-0.5">{t.aiReview}</p>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold block ${t.finalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.finalPnL >= 0 ? '+' : ''}₹{t.finalPnL.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500">{t.timeClosedFormatted}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section (Unified Dock Terminal) - 4 Cols */}
        <div className="xl:col-span-4 flex flex-col space-y-2.5">
          {/* Segmented Tab Switcher */}
          <div className="bg-[#080d19] border border-[#141e30] p-1 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setRightSidebarTab("execute")}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                rightSidebarTab === "execute"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Order Terminal
            </button>
            <button
              onClick={() => setRightSidebarTab("autotrader")}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                rightSidebarTab === "autotrader"
                  ? "bg-[#182338] text-cyan-400 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              AI Auto-Trader
            </button>
            <button
              onClick={() => setRightSidebarTab("signals")}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                rightSidebarTab === "signals"
                  ? "bg-[#182338] text-amber-400 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Live Signal
            </button>
            <button
              onClick={() => setRightSidebarTab("chat")}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                rightSidebarTab === "chat"
                  ? "bg-[#182338] text-purple-400 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              AI Copilot
            </button>
          </div>

          {/* Tab 1: Order Terminal */}
          {rightSidebarTab === "execute" && (
            <OrderExecutionPanel
              activeInstrument={activeInstrument}
              currentPrice={currentPrice}
              growwAccount={growwAccount}
              onExecuteTrade={handleExecuteTrade}
              presetOrder={presetOrder}
              onClearPresetOrder={() => setPresetOrder(null)}
            />
          )}

          {/* Tab 2: AI Auto-Trader & Compounding Engine */}
          {rightSidebarTab === "autotrader" && (
            <AIPatternAutoTrader
              candles={candles}
              currentPrice={currentPrice}
              activeInstrument={activeInstrument}
              growwAccount={growwAccount}
              onAutoExecuteTrade={handleExecuteTrade}
              activePositions={activePositions}
            />
          )}

          {/* Tab 3: Live Signal & Setup breakdown */}
          {rightSidebarTab === "signals" && (
            <AIMentorPanel
              currentSetup={currentSetup}
              activeInstrument={activeInstrument}
              onApplySetupToOrder={(setup) => {
                setPresetOrder(setup);
                setRightSidebarTab("execute");
              }}
              onOpenGyanLibrary={() => setIsGyanLibraryOpen(true)}
              onOpenSetupsHub={() => setIsSetupsHubOpen(true)}
            />
          )}

          {/* Tab 4: AI Copilot Chat */}
          {rightSidebarTab === "chat" && (
            <AIChatMentor
              marketContext={marketContext}
              aiConfig={aiConfig}
              onOpenAIConfig={() => setIsAIConfigModalOpen(true)}
              externalPrompt={chatExternalPrompt}
            />
          )}

          {/* Live Demat Fast Status Card */}
          <div className="bg-[#080d19] border border-[#141e30] p-3 rounded-xl flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 font-sans block">Broker Status</span>
              <span className="text-white font-bold font-sans">Groww Nextbillion Tech</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-sans block">Margin Balance</span>
              <span className="text-emerald-400 font-bold text-sm">
                ₹{growwAccount.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <GrowwAuthModal
        isOpen={isGrowwModalOpen}
        onClose={() => setIsGrowwModalOpen(false)}
        growwAccount={growwAccount}
        onUpdateAccount={setGrowwAccount}
      />

      <AIConfigModal
        isOpen={isAIConfigModalOpen}
        onClose={() => setIsAIConfigModalOpen(false)}
        aiConfig={aiConfig}
        onSaveConfig={handleSaveAIConfig}
      />

      <GyanLibraryModal
        isOpen={isGyanLibraryOpen}
        onClose={() => setIsGyanLibraryOpen(false)}
        onAskAIAboutBook={(bookTitle) => {
          setChatExternalPrompt(bookTitle);
          setRightSidebarTab("chat");
        }}
      />

      <CandleInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        candleData={inspectedCandleData}
        onAskAIAboutCandle={(prompt) => {
          setChatExternalPrompt(prompt);
          setRightSidebarTab("chat");
        }}
      />

      <SetupsHubModal
        isOpen={isSetupsHubOpen}
        onClose={() => setIsSetupsHubOpen(false)}
        currentPrice={currentPrice}
        symbolCurrency={activeInstrument.currency}
        onApplySetupToOrder={(setup) => {
          setPresetOrder(setup);
          setRightSidebarTab("execute");
        }}
        onAskAIAboutSetup={(prompt) => {
          setChatExternalPrompt(prompt);
          setRightSidebarTab("chat");
        }}
      />
    </div>
  );
}
