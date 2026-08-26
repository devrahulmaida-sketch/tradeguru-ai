import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import ChartSection from './components/ChartSection';
import AIMentorPanel from './components/AIMentorPanel';
import OrderExecutionPanel from './components/OrderExecutionPanel';
import PositionsJournal from './components/PositionsJournal';
import AIChatMentor from './components/AIChatMentor';
import GrowwAuthModal from './components/GrowwAuthModal';
import AIConfigModal from './components/AIConfigModal';
import GyanLibraryModal from './components/GyanLibraryModal';

import { INSTRUMENTS } from './data/marketSymbols';
import { generateSeedCandles, calculateIndicators, evaluateRealTimeTradeSetup } from './services/marketData';
import { loadGrowwAccount, saveGrowwAccount } from './services/growwService';
import { voiceCoach } from './services/voiceCoach';
import confetti from 'canvas-confetti';

export default function App() {
  // 1. Core State
  const [instruments] = useState(INSTRUMENTS);
  const [activeInstrument, setActiveInstrument] = useState(INSTRUMENTS[0]);
  const [candles, setCandles] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(INSTRUMENTS[0].basePrice);
  const [currentPrices, setCurrentPrices] = useState({
    NIFTY50: 24850.00,
    BANKNIFTY: 51240.00,
    RELIANCE: 2985.50,
    HDFCBANK: 1642.80,
    TATAMOTORS: 1048.20,
    CRUDEOIL: 6320.00
  });

  const [activePositions, setActivePositions] = useState([]);
  const [closedTrades, setClosedTrades] = useState([
    {
      id: "INIT-1",
      symbol: "NIFTY50",
      name: "NIFTY 50",
      side: "BUY",
      quantity: 50,
      entryPrice: 24810.00,
      exitPrice: 24870.00,
      finalPnL: 3000.00,
      exitReason: "Target 1 Hit (1:2 R:R)",
      aiReview: "Flawless Al Brooks 20 EMA pullback entry. Trader exercised patience and allowed the 1:2 target to fill.",
      timeClosedFormatted: "09:42 AM"
    }
  ]);

  const [growwAccount, setGrowwAccount] = useState(() => loadGrowwAccount());
  const [aiConfig, setAiConfig] = useState(() => {
    try {
      const saved = localStorage.getItem("trade_ai_config");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return { provider: "builtin", apiKey: "", model: "llama-3.3-70b-versatile" };
  });

  const [currentSetup, setCurrentSetup] = useState(null);
  const [presetOrder, setPresetOrder] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [tickSpeed, setTickSpeed] = useState(1); // 1x, 2x, 5x
  const [ticksInCurrentCandle, setTicksInCurrentCandle] = useState(0);

  // Modals
  const [isGrowwModalOpen, setIsGrowwModalOpen] = useState(false);
  const [isAIConfigModalOpen, setIsAIConfigModalOpen] = useState(false);
  const [isGyanLibraryOpen, setIsGyanLibraryOpen] = useState(false);
  const [chatExternalPrompt, setChatExternalPrompt] = useState("");

  // Initialize seed candles when instrument changes
  useEffect(() => {
    const seed = generateSeedCandles(activeInstrument.basePrice, 60, activeInstrument.volatility);
    setCandles(seed);
    const lastClose = seed[seed.length - 1].close;
    setCurrentPrice(lastClose);
    setCurrentPrices(prev => ({ ...prev, [activeInstrument.id]: lastClose }));
    const setup = evaluateRealTimeTradeSetup(seed, activeInstrument);
    setCurrentSetup(setup);
    setTicksInCurrentCandle(0);
  }, [activeInstrument]);

  // Persist Groww account
  useEffect(() => {
    saveGrowwAccount(growwAccount);
  }, [growwAccount]);

  // Persist AI config
  const handleSaveAIConfig = (newConfig) => {
    setAiConfig(newConfig);
    try {
      localStorage.setItem("trade_ai_config", JSON.stringify(newConfig));
    } catch (_) {}
  };

  // Check SL / TP for active positions on price tick
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
            aiReview = "🎯 Target Hit! Mark Douglas Rule: Capital preserved & institutional profit realized. R:R discipline achieved.";
          } else if (pos.sl && price <= pos.sl) {
            isClosed = true;
            exitReason = "Stop Loss Hit (SL)";
            finalPnL = (pos.sl - pos.entryPrice) * pos.quantity;
            aiReview = "🛑 Disciplined Stop Loss: Dr. Alexander Elder 2% rule honored. You cut the loss cleanly without hoping or revenge trading.";
          }
        } else if (pos.side === 'SELL') {
          if (pos.tp && price <= pos.tp) {
            isClosed = true;
            exitReason = "Target Reached (TP)";
            finalPnL = (pos.entryPrice - pos.tp) * pos.quantity;
            aiReview = "🎯 Short Target Hit! Wyckoff Distribution played out according to plan.";
          } else if (pos.sl && price >= pos.sl) {
            isClosed = true;
            exitReason = "Stop Loss Hit (SL)";
            finalPnL = (pos.entryPrice - pos.sl) * pos.quantity;
            aiReview = "🛑 Structural SL Hit: Smart Money shifted momentum. Taking the loss promptly kept you in the game.";
          }
        }

        if (isClosed) {
          // Announce in voice coach
          if (voiceCoach.isEnabled) {
            voiceCoach.speak(`Trade closed on ${pos.name}. Result: ${exitReason}. Profit and loss: ${finalPnL >= 0 ? 'Profit' : 'Loss'} of ₹${Math.abs(finalPnL).toFixed(0)}.`);
          }

          if (finalPnL > 0) {
            try {
              confetti({ particleCount: 40, spread: 60 });
            } catch (_) {}
          }

          // Record in closed trades
          const closedItem = {
            ...pos,
            exitPrice: pos.tp && price >= pos.tp ? pos.tp : pos.sl,
            exitReason,
            finalPnL,
            aiReview,
            timeClosedFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          };

          setClosedTrades(hist => [closedItem, ...hist]);

          // Update Groww balance & realized PnL
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

  // Tick generator function
  const tickMarket = useCallback(() => {
    setCandles((prevCandles) => {
      if (!prevCandles || prevCandles.length === 0) return prevCandles;

      const lastIdx = prevCandles.length - 1;
      const lastCandle = { ...prevCandles[lastIdx] };

      // Micro-tick fluctuation
      const noise = (Math.random() - 0.49) * activeInstrument.volatility * lastCandle.close * 0.4;
      const newClose = Number((lastCandle.close + noise).toFixed(2));
      const newHigh = Number(Math.max(lastCandle.high, newClose).toFixed(2));
      const newLow = Number(Math.min(lastCandle.low, newClose).toFixed(2));
      const addedVolume = Math.floor(10 + Math.random() * 80);

      setCurrentPrice(newClose);
      setCurrentPrices(p => ({ ...p, [activeInstrument.id]: newClose }));

      // Check SL/TP triggers
      checkPositionTriggers(activeInstrument.id, newClose);

      // Bar completion logic (every 12 ticks forms a new candle)
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

  // Real-time ticking interval
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(200, 1000 / tickSpeed);
    const timer = setInterval(() => {
      tickMarket();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, tickSpeed, tickMarket]);

  // Execute trade handler
  const handleExecuteTrade = (trade) => {
    setActivePositions(prev => [trade, ...prev]);
    if (voiceCoach.isEnabled) {
      voiceCoach.speak(`Groww order placed. ${trade.side} ${trade.quantity} ${trade.name} at ₹${trade.entryPrice}. Stop Loss set at ₹${trade.sl}.`);
    }
  };

  // Close position manually
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
      aiReview: "Manual exit recorded. Followed professional discretion.",
      timeClosedFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setActivePositions(prev => prev.filter(p => p.id !== positionId));
    setClosedTrades(hist => [closedItem, ...hist]);
    setGrowwAccount(acc => ({
      ...acc,
      balance: acc.balance + finalPnL,
      realizedPnL: (acc.realizedPnL || 0) + finalPnL
    }));
  };

  // Prepare market context for AI query
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

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white font-sans">
      {/* Navigation Header */}
      <Navbar
        growwAccount={growwAccount}
        aiConfig={aiConfig}
        onOpenGrowwModal={() => setIsGrowwModalOpen(true)}
        onOpenAIConfig={() => setIsAIConfigModalOpen(true)}
        onOpenGyanLibrary={() => setIsGyanLibraryOpen(true)}
      />

      {/* Main Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 space-y-4">
        {/* Top Grid: Chart on Left, Mentor & Execution on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column (8 Cols): Candlestick Chart & Positions */}
          <div className="lg:col-span-8 space-y-4">
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
            />

            {/* Positions Table & Post-Trade Journal */}
            <PositionsJournal
              activePositions={activePositions}
              closedTrades={closedTrades}
              onClosePosition={handleManualClosePosition}
              currentPrices={currentPrices}
            />
          </div>

          {/* Right Column (4 Cols): AI Signal HUD & Execution Terminal */}
          <div className="lg:col-span-4 space-y-4">
            {/* Live AI Setup & Wisdom Radar */}
            <AIMentorPanel
              currentSetup={currentSetup}
              activeInstrument={activeInstrument}
              onApplySetupToOrder={(setup) => setPresetOrder(setup)}
              onOpenGyanLibrary={() => setIsGyanLibraryOpen(true)}
            />

            {/* Order Execution Terminal */}
            <OrderExecutionPanel
              activeInstrument={activeInstrument}
              currentPrice={currentPrice}
              growwAccount={growwAccount}
              onExecuteTrade={handleExecuteTrade}
              presetOrder={presetOrder}
              onClearPresetOrder={() => setPresetOrder(null)}
            />

            {/* AI Interactive Chat Mentor (Live Hinglish/English coach) */}
            <AIChatMentor
              marketContext={marketContext}
              aiConfig={aiConfig}
              onOpenAIConfig={() => setIsAIConfigModalOpen(true)}
              externalPrompt={chatExternalPrompt}
            />
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
        }}
      />
    </div>
  );
}
