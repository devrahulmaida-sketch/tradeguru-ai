import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import TopMarketTicker from './components/TopMarketTicker';
import RealTimeGrowwAuth from './components/RealTimeGrowwAuth';
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
  // 1. Core State
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

  const [growwAccount, setGrowwAccount] = useState(() => loadGrowwAccount());
  const [aiConfig, setAiConfig] = useState(() => {
    try {
      const saved = localStorage.getItem("trade_ai_config");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return { provider: "groq", apiKey: "", model: "llama-3.3-70b-versatile" };
  });

  const [currentSetup, setCurrentSetup] = useState(null);
  const [presetOrder, setPresetOrder] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [tickSpeed, setTickSpeed] = useState(1);
  const [ticksInCurrentCandle, setTicksInCurrentCandle] = useState(0);

  // Modals
  const [isGrowwModalOpen, setIsGrowwModalOpen] = useState(false);
  const [isAIConfigModalOpen, setIsAIConfigModalOpen] = useState(false);
  const [isGyanLibraryOpen, setIsGyanLibraryOpen] = useState(false);
  const [isSetupsHubOpen, setIsSetupsHubOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectedCandleData, setInspectedCandleData] = useState(null);
  const [chatExternalPrompt, setChatExternalPrompt] = useState("");

  // Load real candles
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

  // Persist Groww account
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

  // Check SL / TP for active positions
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
            aiReview = "🎯 Target Hit! Mark Douglas Rule: Capital preserved & compounded. R:R discipline achieved.";
          } else if (pos.sl && price <= pos.sl) {
            isClosed = true;
            exitReason = "Stop Loss Hit (SL)";
            finalPnL = (pos.sl - pos.entryPrice) * pos.quantity;
            aiReview = "🛑 Disciplined Stop Loss: Dr. Alexander Elder 2% rule honored. You cut the loss cleanly.";
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
            aiReview = "🛑 Structural SL Hit: Smart Money shifted momentum. Taking loss promptly kept you safe.";
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

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white font-sans antialiased">
      {/* Top Global Ticker Tape */}
      <TopMarketTicker
        currentPrices={currentPrices}
        activeInstrument={activeInstrument}
      />

      {/* Main Navigation */}
      <Navbar
        growwAccount={growwAccount}
        aiConfig={aiConfig}
        onOpenGrowwModal={() => setIsGrowwModalOpen(true)}
        onOpenAIConfig={() => setIsAIConfigModalOpen(true)}
        onOpenGyanLibrary={() => setIsGyanLibraryOpen(true)}
        onOpenSetupsHub={() => setIsSetupsHubOpen(true)}
      />

      {/* Main Terminal Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-4 space-y-3">
        {/* Real-time Interactive Groww Authorisation Card */}
        <RealTimeGrowwAuth
          growwAccount={growwAccount}
          onUpdateAccount={setGrowwAccount}
          onOpenFullModal={() => setIsGrowwModalOpen(true)}
        />

        {/* Institutional 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Left Column (8 Cols): Chart, Depth & Positions */}
          <div className="lg:col-span-8 space-y-3.5">
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

            {/* Level 2 Order Book Depth */}
            <MarketDepthTape
              currentPrice={currentPrice}
              activeInstrument={activeInstrument}
            />

            {/* Positions Table & Trade Journal */}
            <PositionsJournal
              activePositions={activePositions}
              closedTrades={closedTrades}
              onClosePosition={handleManualClosePosition}
              currentPrices={currentPrices}
            />
          </div>

          {/* Right Column (4 Cols): AI Auto-Trader, Signal & Execution Terminal */}
          <div className="lg:col-span-4 space-y-3.5">
            {/* AI Pattern Scanner & Capital Compounding Engine */}
            <AIPatternAutoTrader
              candles={candles}
              currentPrice={currentPrice}
              activeInstrument={activeInstrument}
              growwAccount={growwAccount}
              onAutoExecuteTrade={handleExecuteTrade}
              activePositions={activePositions}
            />

            {/* Live AI Setup Card */}
            <AIMentorPanel
              currentSetup={currentSetup}
              activeInstrument={activeInstrument}
              onApplySetupToOrder={(setup) => setPresetOrder(setup)}
              onOpenGyanLibrary={() => setIsGyanLibraryOpen(true)}
              onOpenSetupsHub={() => setIsSetupsHubOpen(true)}
            />

            {/* Manual Order Execution Terminal */}
            <OrderExecutionPanel
              activeInstrument={activeInstrument}
              currentPrice={currentPrice}
              growwAccount={growwAccount}
              onExecuteTrade={handleExecuteTrade}
              presetOrder={presetOrder}
              onClearPresetOrder={() => setPresetOrder(null)}
            />

            {/* AI Hinglish Live Chat Mentor */}
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

      <CandleInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        candleData={inspectedCandleData}
        onAskAIAboutCandle={(prompt) => {
          setChatExternalPrompt(prompt);
        }}
      />

      <SetupsHubModal
        isOpen={isSetupsHubOpen}
        onClose={() => setIsSetupsHubOpen(false)}
        currentPrice={currentPrice}
        symbolCurrency={activeInstrument.currency}
        onApplySetupToOrder={(setup) => setPresetOrder(setup)}
        onAskAIAboutSetup={(prompt) => {
          setChatExternalPrompt(prompt);
        }}
      />
    </div>
  );
}
