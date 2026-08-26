import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Play, Pause, FastForward, Activity, Layers, RefreshCw, TrendingUp, TrendingDown, HelpCircle, Info, Sparkles, Volume2 } from 'lucide-react';
import { voiceCoach } from '../services/voiceCoach';

export default function ChartSection({
  candles,
  currentPrice,
  activeInstrument,
  onSelectInstrument,
  instruments,
  isPlaying,
  setIsPlaying,
  tickSpeed,
  setTickSpeed,
  activePosition,
  currentSetup,
  onManualTick,
  onInspectCandle
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredCandle, setHoveredCandle] = useState(null);
  const [selectedCandle, setSelectedCandle] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("5m");
  const [showIndicators, setShowIndicators] = useState({ ema9: true, ema21: true, vwap: true, volume: true });
  const [showIndicatorGuide, setShowIndicatorGuide] = useState(false);

  // Render high-res Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !candles || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = 480;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Dark Background
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);

    const padTop = 35;
    const padBottom = 75;
    const padRight = 85;
    const chartHeight = height - padTop - padBottom;
    const chartWidth = width - padRight;

    const visibleCount = Math.min(candles.length, Math.floor(chartWidth / 15));
    const visibleCandles = candles.slice(-visibleCount);
    if (visibleCandles.length === 0) return;

    // Bounds
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVol = 0;

    visibleCandles.forEach(c => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVol) maxVol = c.volume;
      if (showIndicators.ema9 && c.ema9) {
        if (c.ema9 < minPrice) minPrice = c.ema9;
        if (c.ema9 > maxPrice) maxPrice = c.ema9;
      }
      if (showIndicators.ema21 && c.ema21) {
        if (c.ema21 < minPrice) minPrice = c.ema21;
        if (c.ema21 > maxPrice) maxPrice = c.ema21;
      }
    });

    if (activePosition) {
      if (activePosition.sl < minPrice) minPrice = activePosition.sl;
      if (activePosition.tp < minPrice) minPrice = activePosition.tp;
      if (activePosition.sl > maxPrice) maxPrice = activePosition.sl;
      if (activePosition.tp > maxPrice) maxPrice = activePosition.tp;
    }

    const pricePadding = (maxPrice - minPrice) * 0.08 || 5;
    minPrice -= pricePadding;
    maxPrice += pricePadding;
    const priceRange = maxPrice - minPrice || 1;

    const getY = (p) => padTop + chartHeight - ((p - minPrice) / priceRange) * chartHeight;
    const getX = (idx) => (idx * (chartWidth / visibleCount)) + (chartWidth / visibleCount) * 0.5;
    const candleWidth = Math.max(4, (chartWidth / visibleCount) * 0.65);

    // Grid lines
    ctx.strokeStyle = '#1a2335';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);

    for (let i = 0; i <= 6; i++) {
      const p = minPrice + (priceRange * i) / 6;
      const y = getY(p);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText((activeInstrument.currency || '₹') + p.toFixed(2), chartWidth + 6, y + 4);
    }
    ctx.setLineDash([]);

    // Volume bars
    if (showIndicators.volume) {
      const volMaxH = 50;
      const volBase = height - 25;
      visibleCandles.forEach((c, idx) => {
        const x = getX(idx);
        const volH = (c.volume / (maxVol || 1)) * volMaxH;
        ctx.fillStyle = c.close >= c.open ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)';
        ctx.fillRect(x - candleWidth / 2, volBase - volH, candleWidth, volH);
      });
    }

    // Indicator Lines
    const drawLine = (key, color, lw = 1.5) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      let started = false;
      visibleCandles.forEach((c, idx) => {
        if (c[key]) {
          const x = getX(idx);
          const y = getY(c[key]);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    };

    if (showIndicators.ema9) drawLine('ema9', '#06b6d4', 1.5);
    if (showIndicators.ema21) drawLine('ema21', '#f97316', 1.8);
    if (showIndicators.vwap) drawLine('vwap', '#a855f7', 2);

    // Candlesticks
    visibleCandles.forEach((c, idx) => {
      const x = getX(idx);
      const isBull = c.close >= c.open;
      const bodyColor = isBull ? '#22c55e' : '#ef4444';
      const wickColor = isBull ? '#4ade80' : '#f87171';

      const yOpen = getY(c.open);
      const yClose = getY(c.close);
      const yHigh = getY(c.high);
      const yLow = getY(c.low);

      // Selected candle highlight halo
      if (selectedCandle && selectedCandle.time === c.time) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
        ctx.fillRect(x - candleWidth, padTop, candleWidth * 2, chartHeight);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - candleWidth, padTop, candleWidth * 2, chartHeight);
      }

      // Wick
      ctx.strokeStyle = wickColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      // Body
      ctx.fillStyle = bodyColor;
      const bodyTop = Math.min(yOpen, yClose);
      const bodyH = Math.max(2, Math.abs(yClose - yOpen));
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyH);

      // Time axis
      if (idx % 8 === 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(c.timeFormatted || '', x, height - 8);
      }
    });

    // Active Trade Lines (SL, TP, Entry)
    if (activePosition) {
      const yEntry = getY(activePosition.entryPrice);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, yEntry);
      ctx.lineTo(chartWidth, yEntry);
      ctx.stroke();
      ctx.fillStyle = '#3b82f6';
      ctx.fillText(`Entry: ${activePosition.entryPrice}`, chartWidth + 6, yEntry + 3);

      if (activePosition.sl) {
        const ySl = getY(activePosition.sl);
        ctx.strokeStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(0, ySl);
        ctx.lineTo(chartWidth, ySl);
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.fillText(`SL: ${activePosition.sl}`, chartWidth + 6, ySl + 3);
      }

      if (activePosition.tp) {
        const yTp = getY(activePosition.tp);
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(0, yTp);
        ctx.lineTo(chartWidth, yTp);
        ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.fillText(`TP: ${activePosition.tp}`, chartWidth + 6, yTp + 3);
      }
      ctx.setLineDash([]);
    }

    // Live Price Line & Right Badge
    const lastCandle = visibleCandles[visibleCandles.length - 1];
    const liveY = getY(currentPrice || lastCandle.close);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(0, liveY);
    ctx.lineTo(chartWidth, liveY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#16a34a';
    ctx.fillRect(chartWidth + 2, liveY - 11, 80, 22);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText((activeInstrument.currency || '₹') + (currentPrice || lastCandle.close).toFixed(2), chartWidth + 42, liveY + 4);

    // Crosshair
    if (mousePos && mousePos.x >= 0 && mousePos.x <= chartWidth) {
      const idx = Math.floor(mousePos.x / (chartWidth / visibleCount));
      if (idx >= 0 && idx < visibleCandles.length) {
        const x = getX(idx);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(x, padTop);
        ctx.lineTo(x, height - 25);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, mousePos.y);
        ctx.lineTo(chartWidth, mousePos.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [candles, currentPrice, showIndicators, mousePos, activePosition, selectedCandle]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !candles) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const chartWidth = rect.width - 85;
    const visibleCount = Math.min(candles.length, Math.floor(chartWidth / 15));
    const visibleCandles = candles.slice(-visibleCount);
    const idx = Math.floor(x / (chartWidth / visibleCount));
    if (idx >= 0 && idx < visibleCandles.length) {
      const chosen = visibleCandles[idx];
      const prev = idx > 0 ? visibleCandles[idx - 1] : chosen;
      setSelectedCandle(chosen);
      onInspectCandle(chosen, prev);
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const chartWidth = rect.width - 85;
    const visibleCount = Math.min(candles.length, Math.floor(chartWidth / 15));
    const visibleCandles = candles.slice(-visibleCount);
    const idx = Math.floor(x / (chartWidth / visibleCount));
    if (idx >= 0 && idx < visibleCandles.length) {
      setHoveredCandle(visibleCandles[idx]);
    }
  };

  const priceChange = useMemo(() => {
    if (!candles || candles.length < 2) return { amount: 0, pct: 0, isPositive: true };
    const first = candles[0].open;
    const current = currentPrice || candles[candles.length - 1].close;
    const diff = current - first;
    return {
      amount: diff.toFixed(2),
      pct: ((diff / first) * 100).toFixed(2),
      isPositive: diff >= 0
    };
  }, [candles, currentPrice]);

  return (
    <div className="bg-[#111827] border border-[#1f293d] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Instrument Bar */}
      <div className="p-3.5 border-b border-[#1f293d] flex flex-wrap items-center justify-between gap-3 bg-[#0d1322]/90">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex bg-[#162033] p-1 rounded-xl border border-[#243350] gap-1">
            {instruments.map((inst) => (
              <button
                key={inst.id}
                onClick={() => onSelectInstrument(inst)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeInstrument.id === inst.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2e48]'
                }`}
              >
                {inst.name}
                {inst.isRealFeed && (
                  <span className="text-[9px] bg-emerald-400/20 text-emerald-300 px-1 py-0.2 rounded">
                    REAL
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-white font-mono">
              {activeInstrument.currency}{currentPrice?.toFixed(2) || activeInstrument.basePrice.toFixed(2)}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
              priceChange.isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}>
              {priceChange.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {priceChange.isPositive ? '+' : ''}{priceChange.amount} ({priceChange.pct}%)
            </span>
          </div>
        </div>

        {/* Indicators & Tooltip Controls */}
        <div className="flex items-center gap-2">
          {/* Guide toggle button */}
          <button
            onClick={() => setShowIndicatorGuide(!showIndicatorGuide)}
            className="px-2.5 py-1 text-xs font-bold bg-[#162033] hover:bg-[#202e48] text-cyan-400 border border-cyan-500/30 rounded-lg transition-colors flex items-center gap-1"
            title="Learn how indicators work"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Indicators Guide</span>
          </button>

          {/* Indicators Toggles */}
          <div className="hidden lg:flex items-center gap-1 text-[11px]">
            <button
              onClick={() => setShowIndicators(p => ({ ...p, ema21: !p.ema21 }))}
              className={`px-2 py-1 rounded-md font-bold border transition-colors ${
                showIndicators.ema21 ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' : 'bg-[#162033] border-[#243350] text-slate-500'
              }`}
            >
              21 EMA (Brooks)
            </button>
            <button
              onClick={() => setShowIndicators(p => ({ ...p, vwap: !p.vwap }))}
              className={`px-2 py-1 rounded-md font-bold border transition-colors ${
                showIndicators.vwap ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-[#162033] border-[#243350] text-slate-500'
              }`}
            >
              VWAP (Institutions)
            </button>
          </div>

          {/* Playback */}
          <div className="flex items-center gap-1 bg-[#162033] p-1 rounded-xl border border-[#243350]">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1.5 rounded-lg ${isPlaying ? 'text-emerald-400' : 'text-amber-400'}`}
              title={isPlaying ? "Pause Feed" : "Resume Feed"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              onClick={onManualTick}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1a263e]"
              title="Next Tick"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Guide Dropdown if open */}
      {showIndicatorGuide && (
        <div className="bg-[#0f172a] border-b border-[#243350] p-3.5 text-xs grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in">
          <div className="bg-[#162033] p-2.5 rounded-xl border border-orange-500/30">
            <span className="font-bold text-orange-400 block mb-1">🟠 21 EMA (Al Brooks Dynamic Support):</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              प्राइस जब इसके ऊपर होता है तो ट्रेंड <strong>Uptrend</strong> है। बड़े बैंक इसके पास री-टेस्ट पर बाय करते हैं। अगर कैंडल इसके नीचे क्लोज हो जाए तो तुरंत अलर्ट हो जाएं।
            </p>
          </div>
          <div className="bg-[#162033] p-2.5 rounded-xl border border-purple-500/30">
            <span className="font-bold text-purple-400 block mb-1">🟣 VWAP (Volume Weighted Benchmark):</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              FII और DII के एल्गोरिदम VWAP के स्तर को फेयर वैल्यू मानते हैं। VWAP के ऊपर मार्केट में केवल बुल्स हावी रहते हैं।
            </p>
          </div>
          <div className="bg-[#162033] p-2.5 rounded-xl border border-amber-500/30">
            <span className="font-bold text-amber-400 block mb-1">🟡 Wicks & Candlestick Anatomy:</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              नीचे की लंबी विक = <strong>बायर्स आ गए (Demand)</strong>। ऊपर की लंबी विक = <strong>सेलर्स ने रिजेक्ट कर दिया (Supply Dump)</strong>। चार्ट पर किसी भी कैंडल पर क्लिक करके देखें!
            </p>
          </div>
        </div>
      )}

      {/* Main Canvas */}
      <div ref={containerRef} className="relative w-full h-[480px] bg-[#0b0f19] select-none">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { setMousePos(null); setHoveredCandle(null); }}
          className="cursor-pointer w-full h-full"
        />

        {/* OHLC Bar Top Left */}
        <div className="absolute top-3 left-4 pointer-events-none flex flex-wrap items-center gap-3 text-[11px] font-mono bg-[#0d1322]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#1e293b]">
          {hoveredCandle ? (
            <>
              <span className="text-slate-400">Time: <strong className="text-white">{hoveredCandle.timeFormatted}</strong></span>
              <span className="text-slate-400">O: <strong className="text-white">{hoveredCandle.open}</strong></span>
              <span className="text-slate-400">H: <strong className="text-emerald-400">{hoveredCandle.high}</strong></span>
              <span className="text-slate-400">L: <strong className="text-rose-400">{hoveredCandle.low}</strong></span>
              <span className="text-slate-400">C: <strong className="text-white">{hoveredCandle.close}</strong></span>
              <span className="text-slate-400">Vol: <strong className="text-cyan-400">{hoveredCandle.volume}</strong></span>
              <span className="text-amber-400 font-bold ml-1">👉 Click to Inspect</span>
            </>
          ) : candles.length > 0 ? (
            <>
              <span className="text-slate-400">Live Bar:</span>
              <span className="text-slate-400">O: <strong className="text-white">{candles[candles.length - 1].open}</strong></span>
              <span className="text-slate-400">H: <strong className="text-emerald-400">{candles[candles.length - 1].high}</strong></span>
              <span className="text-slate-400">L: <strong className="text-rose-400">{candles[candles.length - 1].low}</strong></span>
              <span className="text-slate-400">C: <strong className="text-white">{candles[candles.length - 1].close}</strong></span>
              <span className="text-slate-400">RSI: <strong className="text-amber-400">{candles[candles.length - 1].rsi || 50}</strong></span>
            </>
          ) : null}
        </div>

        {/* Tip on Chart */}
        <div className="absolute bottom-3 right-24 pointer-events-none text-[10px] text-slate-500 font-mono bg-[#0d1322]/80 px-2 py-0.5 rounded border border-[#1e293b]">
          💡 Click any candle to hear AI breakdown in Hinglish
        </div>
      </div>
    </div>
  );
}
