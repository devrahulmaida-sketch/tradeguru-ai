import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Play, Pause, FastForward, Activity, Maximize2, Layers, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

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
  onManualTick
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredCandle, setHoveredCandle] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1m");
  const [showIndicators, setShowIndicators] = useState({ ema9: true, ema21: true, vwap: true, volume: true });

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

    // Clear background
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);

    // Padding
    const padTop = 30;
    const padBottom = 80; // space for volume & time axis
    const padRight = 75;  // space for price axis
    const chartHeight = height - padTop - padBottom;
    const chartWidth = width - padRight;

    // Visible candles (last 45 candles for comfortable viewing)
    const visibleCount = Math.min(candles.length, Math.floor(chartWidth / 14));
    const visibleCandles = candles.slice(-visibleCount);

    if (visibleCandles.length === 0) return;

    // Price bounds
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

    // Also include active position SL and TP in scale if active
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
    const candleWidth = Math.max(3, (chartWidth / visibleCount) * 0.65);

    // Draw Grid Lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);

    const gridSteps = 6;
    for (let i = 0; i <= gridSteps; i++) {
      const p = minPrice + (priceRange * i) / gridSteps;
      const y = getY(p);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Price Label
      ctx.fillStyle = '#64748b';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(p.toFixed(2), chartWidth + 6, y + 4);
    }
    ctx.setLineDash([]);

    // Draw Volume Bars
    if (showIndicators.volume) {
      const volMaxHeight = 55;
      const volYBase = height - 25;
      visibleCandles.forEach((c, idx) => {
        const x = getX(idx);
        const volH = (c.volume / (maxVol || 1)) * volMaxHeight;
        ctx.fillStyle = c.close >= c.open ? 'rgba(34, 197, 94, 0.22)' : 'rgba(239, 68, 68, 0.22)';
        ctx.fillRect(x - candleWidth / 2, volYBase - volH, candleWidth, volH);
      });
    }

    // Draw Indicator Lines (EMA 9, EMA 21, VWAP)
    const drawLine = (key, color, lineWidth = 1.5) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
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

    if (showIndicators.ema9) drawLine('ema9', '#06b6d4', 1.5);   // Cyan
    if (showIndicators.ema21) drawLine('ema21', '#f97316', 1.5); // Orange
    if (showIndicators.vwap) drawLine('vwap', '#a855f7', 1.8);   // Purple

    // Draw Candlesticks
    visibleCandles.forEach((c, idx) => {
      const x = getX(idx);
      const isBullish = c.close >= c.open;
      const bodyColor = isBullish ? '#22c55e' : '#ef4444';
      const wickColor = isBullish ? '#4ade80' : '#f87171';

      const yOpen = getY(c.open);
      const yClose = getY(c.close);
      const yHigh = getY(c.high);
      const yLow = getY(c.low);

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

      // Time axis labels every 8 candles
      if (idx % 8 === 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = '10px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(c.timeFormatted || '', x, height - 8);
      }
    });

    // Draw Active Position Lines (SL, TP, Entry)
    if (activePosition) {
      // Entry Line (Blue)
      const yEntry = getY(activePosition.entryPrice);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, yEntry);
      ctx.lineTo(chartWidth, yEntry);
      ctx.stroke();
      ctx.fillStyle = '#3b82f6';
      ctx.fillText(`Entry: ₹${activePosition.entryPrice}`, chartWidth + 6, yEntry + 3);

      // SL Line (Red)
      if (activePosition.sl) {
        const ySl = getY(activePosition.sl);
        ctx.strokeStyle = '#ef4444';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, ySl);
        ctx.lineTo(chartWidth, ySl);
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.fillText(`SL: ₹${activePosition.sl}`, chartWidth + 6, ySl + 3);
      }

      // TP Line (Green)
      if (activePosition.tp) {
        const yTp = getY(activePosition.tp);
        ctx.strokeStyle = '#10b981';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, yTp);
        ctx.lineTo(chartWidth, yTp);
        ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.fillText(`TP: ₹${activePosition.tp}`, chartWidth + 6, yTp + 3);
      }
      ctx.setLineDash([]);
    }

    // Current Price Pulsing Line
    const lastCandle = visibleCandles[visibleCandles.length - 1];
    const currentY = getY(currentPrice || lastCandle.close);

    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(0, currentY);
    ctx.lineTo(chartWidth, currentY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Right Badge for Current Price
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(chartWidth + 2, currentY - 11, 70, 22);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((currentPrice || lastCandle.close).toFixed(2), chartWidth + 37, currentY + 4);

    // Crosshair & Hover Tooltip
    if (mousePos && mousePos.x >= 0 && mousePos.x <= chartWidth) {
      const idx = Math.floor(mousePos.x / (chartWidth / visibleCount));
      if (idx >= 0 && idx < visibleCandles.length) {
        const c = visibleCandles[idx];
        const x = getX(idx);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);

        // Vertical line
        ctx.beginPath();
        ctx.moveTo(x, padTop);
        ctx.lineTo(x, height - 25);
        ctx.stroke();

        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(0, mousePos.y);
        ctx.lineTo(chartWidth, mousePos.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [candles, currentPrice, showIndicators, mousePos, activePosition]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const chartWidth = rect.width - 75;
    const visibleCount = Math.min(candles.length, Math.floor(chartWidth / 14));
    const visibleCandles = candles.slice(-visibleCount);
    const idx = Math.floor(x / (chartWidth / visibleCount));
    if (idx >= 0 && idx < visibleCandles.length) {
      setHoveredCandle(visibleCandles[idx]);
    }
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setHoveredCandle(null);
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
      {/* Top Chart Header */}
      <div className="p-4 border-b border-[#1f293d] flex flex-wrap items-center justify-between gap-3 bg-[#0d1322]/80 backdrop-blur-md">
        {/* Instrument Selector */}
        <div className="flex items-center gap-3">
          <div className="flex bg-[#162033] p-1 rounded-xl border border-[#243350]">
            {instruments.slice(0, 4).map((inst) => (
              <button
                key={inst.id}
                onClick={() => onSelectInstrument(inst)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeInstrument.id === inst.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2e48]'
                }`}
              >
                {inst.name}
              </button>
            ))}
          </div>

          {/* Price & Change Pill */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black tracking-tight text-white font-mono">
              ₹{currentPrice?.toFixed(2) || activeInstrument.basePrice.toFixed(2)}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 ${
              priceChange.isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}>
              {priceChange.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {priceChange.isPositive ? '+' : ''}{priceChange.amount} ({priceChange.pct}%)
            </span>
          </div>
        </div>

        {/* Timeframe & Indicators Toggle */}
        <div className="flex items-center gap-2">
          {/* Timeframes */}
          <div className="flex bg-[#162033] p-0.5 rounded-lg border border-[#243350] text-xs">
            {['1m', '3m', '5m', '15m', '1D'].map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-2.5 py-1 rounded-md font-medium ${
                  selectedTimeframe === tf ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Indicator Pills */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px]">
            <button
              onClick={() => setShowIndicators(p => ({ ...p, ema9: !p.ema9 }))}
              className={`px-2 py-1 rounded-md font-medium border transition-colors ${
                showIndicators.ema9 ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300' : 'bg-[#162033] border-[#243350] text-slate-500'
              }`}
            >
              EMA 9
            </button>
            <button
              onClick={() => setShowIndicators(p => ({ ...p, ema21: !p.ema21 }))}
              className={`px-2 py-1 rounded-md font-medium border transition-colors ${
                showIndicators.ema21 ? 'bg-orange-500/15 border-orange-500/40 text-orange-300' : 'bg-[#162033] border-[#243350] text-slate-500'
              }`}
            >
              EMA 21 (Brooks)
            </button>
            <button
              onClick={() => setShowIndicators(p => ({ ...p, vwap: !p.vwap }))}
              className={`px-2 py-1 rounded-md font-medium border transition-colors ${
                showIndicators.vwap ? 'bg-purple-500/15 border-purple-500/40 text-purple-300' : 'bg-[#162033] border-[#243350] text-slate-500'
              }`}
            >
              VWAP (Institutions)
            </button>
          </div>

          {/* Simulation Controls */}
          <div className="flex items-center gap-1 bg-[#162033] p-1 rounded-xl border border-[#243350]">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? "Pause Market Feed" : "Resume Real-Time Feed"}
              className={`p-1.5 rounded-lg transition-all ${
                isPlaying ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={() => setTickSpeed(s => (s === 1 ? 2 : s === 2 ? 5 : 1))}
              title="Change Speed (1x, 2x, 5x)"
              className="px-2 py-1 text-xs font-bold text-slate-300 hover:text-white bg-[#1a263e] rounded-md"
            >
              {tickSpeed}x
            </button>

            <button
              onClick={onManualTick}
              title="Trigger Next Tick Now"
              className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-[#1a263e]"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas Container */}
      <div ref={containerRef} className="relative w-full h-[480px] bg-[#0b0f19] select-none">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="cursor-crosshair w-full h-full"
        />

        {/* OHLC Bar Overlay at Top Left */}
        <div className="absolute top-3 left-4 pointer-events-none flex flex-wrap items-center gap-3 text-[11px] font-mono bg-[#0d1322]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#1e293b]">
          {hoveredCandle ? (
            <>
              <span className="text-slate-400">Time: <strong className="text-white">{hoveredCandle.timeFormatted}</strong></span>
              <span className="text-slate-400">O: <strong className="text-white">{hoveredCandle.open}</strong></span>
              <span className="text-slate-400">H: <strong className="text-emerald-400">{hoveredCandle.high}</strong></span>
              <span className="text-slate-400">L: <strong className="text-rose-400">{hoveredCandle.low}</strong></span>
              <span className="text-slate-400">C: <strong className={hoveredCandle.close >= hoveredCandle.open ? "text-emerald-400" : "text-rose-400"}>{hoveredCandle.close}</strong></span>
              <span className="text-slate-400">Vol: <strong className="text-cyan-400">{hoveredCandle.volume}</strong></span>
              {hoveredCandle.rsi && <span className="text-slate-400">RSI: <strong className="text-amber-400">{hoveredCandle.rsi}</strong></span>}
            </>
          ) : candles.length > 0 ? (
            <>
              <span className="text-slate-400">Live Candle:</span>
              <span className="text-slate-400">O: <strong className="text-white">{candles[candles.length - 1].open}</strong></span>
              <span className="text-slate-400">H: <strong className="text-emerald-400">{candles[candles.length - 1].high}</strong></span>
              <span className="text-slate-400">L: <strong className="text-rose-400">{candles[candles.length - 1].low}</strong></span>
              <span className="text-slate-400">C: <strong className="text-white">{candles[candles.length - 1].close}</strong></span>
              <span className="text-slate-400">RSI(14): <strong className="text-amber-400">{candles[candles.length - 1].rsi || 52}</strong></span>
            </>
          ) : null}
        </div>

        {/* Live Setup Banner if present */}
        {currentSetup && (
          <div className="absolute bottom-3 left-4 pointer-events-none max-w-lg bg-[#0f172a]/90 backdrop-blur-md p-2.5 rounded-xl border border-emerald-500/30 flex items-center gap-3 shadow-lg">
            <div className={`w-2.5 h-10 rounded-full ${currentSetup.bias === 'BUY' ? 'bg-emerald-500' : currentSetup.bias === 'SELL' ? 'bg-rose-500' : 'bg-amber-500'}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                  currentSetup.bias === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : currentSetup.bias === 'SELL' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  Live AI Radar: {currentSetup.bias}
                </span>
                <span className="text-xs font-bold text-white truncate">{currentSetup.setupName}</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                Target: ₹{currentSetup.tp1} | SL: ₹{currentSetup.sl} | R:R: {currentSetup.rr} ({currentSetup.bookRef.split('-')[0]})
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
