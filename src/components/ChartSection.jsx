import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Play, Pause, FastForward, Activity, Layers, RefreshCw, TrendingUp, TrendingDown, HelpCircle, Info, Sparkles, Maximize2 } from 'lucide-react';
import { soundEngine } from '../services/voiceCoach';

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

  // Render high-precision HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !candles || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = 470;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Deep terminal background
    ctx.fillStyle = '#060911';
    ctx.fillRect(0, 0, width, height);

    const padTop = 30;
    const padBottom = 65;
    const padRight = 80;
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

    // Watermark symbol in background
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.font = '900 48px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${activeInstrument.name} • ${selectedTimeframe}`, chartWidth / 2, height / 2 - 10);
    ctx.restore();

    // Clean subtle grid lines
    ctx.strokeStyle = '#121824';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);

    for (let i = 0; i <= 6; i++) {
      const p = minPrice + (priceRange * i) / 6;
      const y = getY(p);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText((activeInstrument.currency || '₹') + p.toFixed(2), chartWidth + 6, y + 3);
    }
    ctx.setLineDash([]);

    // Volume histogram
    if (showIndicators.volume) {
      const volMaxH = 45;
      const volBase = height - 20;
      visibleCandles.forEach((c, idx) => {
        const x = getX(idx);
        const volH = (c.volume / (maxVol || 1)) * volMaxH;
        ctx.fillStyle = c.close >= c.open ? 'rgba(0, 192, 118, 0.22)' : 'rgba(255, 77, 79, 0.22)';
        ctx.fillRect(x - candleWidth / 2, volBase - volH, candleWidth, volH);
      });
    }

    // Indicator Lines (Thin, anti-aliased)
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

    if (showIndicators.ema9) drawLine('ema9', '#06b6d4', 1.2);
    if (showIndicators.ema21) drawLine('ema21', '#f59e0b', 1.5);
    if (showIndicators.vwap) drawLine('vwap', '#a855f7', 1.8);

    // Candlesticks (Clean Groww Emerald & Soft Red)
    visibleCandles.forEach((c, idx) => {
      const x = getX(idx);
      const isBull = c.close >= c.open;
      const bodyColor = isBull ? '#00c076' : '#ff4d4f';
      const wickColor = isBull ? '#00D09C' : '#ff7875';

      const yOpen = getY(c.open);
      const yClose = getY(c.close);
      const yHigh = getY(c.high);
      const yLow = getY(c.low);

      if (selectedCandle && selectedCandle.time === c.time) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.fillRect(x - candleWidth, padTop, candleWidth * 2, chartHeight);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - candleWidth, padTop, candleWidth * 2, chartHeight);
      }

      // Wick
      ctx.strokeStyle = wickColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      // Body
      ctx.fillStyle = bodyColor;
      const bodyTop = Math.min(yOpen, yClose);
      const bodyH = Math.max(1.5, Math.abs(yClose - yOpen));
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyH);

      // Time axis marks
      if (idx % 8 === 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(c.timeFormatted || '', x, height - 6);
      }
    });

    // Active Trade Lines
    if (activePosition) {
      const yEntry = getY(activePosition.entryPrice);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, yEntry);
      ctx.lineTo(chartWidth, yEntry);
      ctx.stroke();
      ctx.fillStyle = '#3b82f6';
      ctx.font = '10px JetBrains Mono, monospace';
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

    // Live Price Line & Right Badge (TradingView Style)
    const lastCandle = visibleCandles[visibleCandles.length - 1];
    const liveY = getY(currentPrice || lastCandle.close);
    ctx.strokeStyle = '#00c076';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(0, liveY);
    ctx.lineTo(chartWidth, liveY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#00a364';
    ctx.fillRect(chartWidth + 2, liveY - 10, 76, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText((activeInstrument.currency || '₹') + (currentPrice || lastCandle.close).toFixed(2), chartWidth + 40, liveY + 3.5);

    // Crosshair
    if (mousePos && mousePos.x >= 0 && mousePos.x <= chartWidth) {
      const idx = Math.floor(mousePos.x / (chartWidth / visibleCount));
      if (idx >= 0 && idx < visibleCandles.length) {
        const x = getX(idx);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(x, padTop);
        ctx.lineTo(x, height - 20);
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
    const chartWidth = rect.width - 80;
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

    const chartWidth = rect.width - 80;
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
    <div className="bg-[#080d19] border border-[#162236] rounded-xl overflow-hidden shadow-xl flex flex-col font-sans">
      {/* Chart Control Bar */}
      <div className="px-3 py-2 border-b border-[#162236] flex flex-wrap items-center justify-between gap-2.5 bg-[#0a101d]">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Instrument Switcher Tabs */}
          <div className="flex bg-[#0e1626] p-0.5 rounded-lg border border-[#1b293e]">
            {instruments.map((inst) => (
              <button
                key={inst.id}
                onClick={() => onSelectInstrument(inst)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeInstrument.id === inst.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {inst.name}
              </button>
            ))}
          </div>

          {/* Live Price Header */}
          <div className="flex items-baseline gap-2 pl-2">
            <span className="text-lg font-black text-white font-mono">
              {activeInstrument.currency}{currentPrice?.toFixed(2) || activeInstrument.basePrice.toFixed(2)}
            </span>
            <span className={`text-xs font-mono font-bold flex items-center ${
              priceChange.isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {priceChange.isPositive ? '+' : ''}{priceChange.amount} ({priceChange.pct}%)
            </span>
          </div>
        </div>

        {/* Indicators & Tooling */}
        <div className="flex items-center gap-1.5">
          {/* Timeframe selector */}
          <div className="flex bg-[#0e1626] p-0.5 rounded-lg border border-[#1b293e] text-[11px] font-mono">
            {['1m', '3m', '5m', '15m'].map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-2 py-0.5 rounded ${
                  selectedTimeframe === tf ? 'bg-[#1b293e] text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Indicator toggles */}
          <div className="hidden lg:flex items-center gap-1 text-[11px]">
            <button
              onClick={() => setShowIndicators(p => ({ ...p, ema21: !p.ema21 }))}
              className={`px-2 py-0.5 rounded border font-medium ${
                showIndicators.ema21 ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-[#0e1626] border-[#1b293e] text-slate-500'
              }`}
            >
              21 EMA
            </button>
            <button
              onClick={() => setShowIndicators(p => ({ ...p, vwap: !p.vwap }))}
              className={`px-2 py-0.5 rounded border font-medium ${
                showIndicators.vwap ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' : 'bg-[#0e1626] border-[#1b293e] text-slate-500'
              }`}
            >
              VWAP
            </button>
          </div>

          {/* Play/Pause */}
          <div className="flex items-center gap-1 bg-[#0e1626] p-0.5 rounded-lg border border-[#1b293e]">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1 rounded ${isPlaying ? 'text-emerald-400' : 'text-amber-400'}`}
              title={isPlaying ? "Pause Feed" : "Resume Feed"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
            <button
              onClick={onManualTick}
              className="p-1 text-slate-400 hover:text-white"
              title="Next Tick"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div ref={containerRef} className="relative w-full h-[470px] bg-[#060911] select-none">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { setMousePos(null); setHoveredCandle(null); }}
          className="cursor-crosshair w-full h-full"
        />

        {/* OHLC Bar Top Left */}
        <div className="absolute top-2.5 left-3 pointer-events-none flex flex-wrap items-center gap-2.5 text-[11px] font-mono bg-[#090e1a]/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#162236]">
          {hoveredCandle ? (
            <>
              <span className="text-slate-400">Time: <strong className="text-white">{hoveredCandle.timeFormatted}</strong></span>
              <span className="text-slate-400">O: <strong className="text-white">{hoveredCandle.open}</strong></span>
              <span className="text-slate-400">H: <strong className="text-emerald-400">{hoveredCandle.high}</strong></span>
              <span className="text-slate-400">L: <strong className="text-rose-400">{hoveredCandle.low}</strong></span>
              <span className="text-slate-400">C: <strong className="text-white">{hoveredCandle.close}</strong></span>
              <span className="text-slate-400">Vol: <strong className="text-cyan-400">{hoveredCandle.volume}</strong></span>
              <span className="text-amber-400 font-semibold ml-1">Click to Inspect</span>
            </>
          ) : candles.length > 0 ? (
            <>
              <span className="text-slate-400">Live:</span>
              <span className="text-slate-400">O: <strong className="text-white">{candles[candles.length - 1].open}</strong></span>
              <span className="text-slate-400">H: <strong className="text-emerald-400">{candles[candles.length - 1].high}</strong></span>
              <span className="text-slate-400">L: <strong className="text-rose-400">{candles[candles.length - 1].low}</strong></span>
              <span className="text-slate-400">C: <strong className="text-white">{candles[candles.length - 1].close}</strong></span>
              <span className="text-slate-400">RSI: <strong className="text-amber-400">{candles[candles.length - 1].rsi || 50}</strong></span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
