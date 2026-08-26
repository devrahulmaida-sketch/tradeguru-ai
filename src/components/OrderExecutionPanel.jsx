import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Calculator, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrderExecutionPanel({
  activeInstrument,
  currentPrice,
  growwAccount,
  onExecuteTrade,
  presetOrder,
  onClearPresetOrder
}) {
  const [orderSide, setOrderSide] = useState("BUY"); // "BUY" | "SELL"
  const [orderType, setOrderType] = useState("MARKET"); // "MARKET" | "LIMIT"
  const [quantity, setQuantity] = useState(activeInstrument.lotSize);
  const [limitPrice, setLimitPrice] = useState(currentPrice || activeInstrument.basePrice);
  const [slPrice, setSlPrice] = useState(Number((currentPrice * 0.995).toFixed(2)));
  const [tpPrice, setTpPrice] = useState(Number((currentPrice * 1.015).toFixed(2)));
  const [riskPercent, setRiskPercent] = useState(1.0); // 1% default

  // When active instrument changes, update defaults
  useEffect(() => {
    setQuantity(activeInstrument.lotSize);
    const p = currentPrice || activeInstrument.basePrice;
    setLimitPrice(p);
    if (orderSide === 'BUY') {
      setSlPrice(Number((p * 0.995).toFixed(2)));
      setTpPrice(Number((p * 1.015).toFixed(2)));
    } else {
      setSlPrice(Number((p * 1.005).toFixed(2)));
      setTpPrice(Number((p * 0.985).toFixed(2)));
    }
  }, [activeInstrument]);

  // When a preset order is pushed from AI Mentor
  useEffect(() => {
    if (presetOrder) {
      setOrderSide(presetOrder.bias === 'BUY' ? 'BUY' : 'SELL');
      setLimitPrice(presetOrder.entry);
      setSlPrice(presetOrder.sl);
      setTpPrice(presetOrder.tp1);
      // Recalculate safe quantity based on 1% risk
      autoCalculateQuantity(1.0, presetOrder.entry, presetOrder.sl);
      onClearPresetOrder?.();
    }
  }, [presetOrder]);

  // Auto calculate quantity using 1% or 2% Risk Rule (Alexander Elder / Van Tharp)
  const autoCalculateQuantity = (pct = riskPercent, entry = (orderType === 'MARKET' ? currentPrice : limitPrice), sl = slPrice) => {
    const slDist = Math.abs(entry - sl) || 1;
    const maxRiskInRupees = (growwAccount.balance * (pct / 100));
    let calculatedQty = Math.floor(maxRiskInRupees / slDist);

    // Round to lot size
    const lotSize = activeInstrument.lotSize || 1;
    calculatedQty = Math.max(lotSize, Math.floor(calculatedQty / lotSize) * lotSize);

    // Make sure margin doesn't exceed 80% balance
    const estMargin = (calculatedQty * entry) * 0.15; // ~15% intraday margin
    if (estMargin > growwAccount.balance * 0.8) {
      calculatedQty = Math.max(lotSize, Math.floor((growwAccount.balance * 0.8) / (entry * 0.15 * lotSize)) * lotSize);
    }

    setQuantity(calculatedQty);
  };

  const handleSideChange = (side) => {
    setOrderSide(side);
    const p = currentPrice || activeInstrument.basePrice;
    if (side === 'BUY') {
      setSlPrice(Number((p * 0.995).toFixed(2)));
      setTpPrice(Number((p * 1.015).toFixed(2)));
    } else {
      setSlPrice(Number((p * 1.005).toFixed(2)));
      setTpPrice(Number((p * 0.985).toFixed(2)));
    }
  };

  const executionPrice = orderType === 'MARKET' ? currentPrice : limitPrice;
  const slDist = Math.abs(executionPrice - slPrice);
  const tpDist = Math.abs(tpPrice - executionPrice);
  const riskAmount = (slDist * quantity).toFixed(2);
  const rewardAmount = (tpDist * quantity).toFixed(2);
  const rrRatio = slDist > 0 ? (tpDist / slDist).toFixed(1) : "0.0";
  const requiredMargin = ((executionPrice * quantity) * 0.15).toFixed(2); // 15% leverage requirement

  const handleSubmitOrder = (e) => {
    e.preventDefault();

    const trade = {
      id: `TRD-${Date.now()}`,
      symbol: activeInstrument.id,
      name: activeInstrument.name,
      side: orderSide,
      quantity,
      entryPrice: executionPrice,
      currentPrice: executionPrice,
      sl: slPrice,
      tp: tpPrice,
      requiredMargin: Number(requiredMargin),
      riskAmount: Number(riskAmount),
      rewardAmount: Number(rewardAmount),
      rrRatio: `1:${rrRatio}`,
      timestamp: Date.now(),
      timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    onExecuteTrade(trade);

    // Fire mild celebration confetti
    try {
      confetti({
        particleCount: 25,
        spread: 40,
        origin: { y: 0.8 }
      });
    } catch (_) {}
  };

  return (
    <div className="bg-[#111827] border border-[#1f293d] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-3.5 border-b border-[#1f293d] bg-[#0d1322] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white">Groww Execution Terminal</h4>
            <p className="text-[10px] text-slate-400">Direct Demat Order Placement</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Demat Margin</span>
          <span className="text-xs font-bold font-mono text-emerald-400">
            ₹{growwAccount.balance?.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmitOrder} className="p-4 space-y-3.5">
        {/* BUY / SELL Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#0c1220] rounded-xl border border-[#1f293d]">
          <button
            type="button"
            onClick={() => handleSideChange("BUY")}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              orderSide === "BUY"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowUpRight className="w-4 h-4" /> BUY / CALL
          </button>
          <button
            type="button"
            onClick={() => handleSideChange("SELL")}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              orderSide === "SELL"
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowDownRight className="w-4 h-4" /> SELL / PUT
          </button>
        </div>

        {/* Order Type & Auto Position Sizer */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex bg-[#162033] p-0.5 rounded-lg border border-[#243350]">
            <button
              type="button"
              onClick={() => setOrderType("MARKET")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${orderType === 'MARKET' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}
            >
              Market
            </button>
            <button
              type="button"
              onClick={() => setOrderType("LIMIT")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${orderType === 'LIMIT' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}
            >
              Limit
            </button>
          </div>

          {/* 1% / 2% Risk Button */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
              <Calculator className="w-3 h-3 text-amber-400" /> Elder Rule:
            </span>
            <button
              type="button"
              onClick={() => { setRiskPercent(1.0); autoCalculateQuantity(1.0); }}
              className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 rounded border border-purple-500/30 hover:bg-purple-500/30"
              title="1% Capital Risk (Mark Douglas & Alexander Elder)"
            >
              1% Risk
            </button>
            <button
              type="button"
              onClick={() => { setRiskPercent(2.0); autoCalculateQuantity(2.0); }}
              className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 rounded border border-purple-500/30 hover:bg-purple-500/30"
              title="2% Capital Risk"
            >
              2% Risk
            </button>
          </div>
        </div>

        {/* Quantity and Price Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-slate-400">
                Quantity (Lot: {activeInstrument.lotSize})
              </label>
            </div>
            <input
              type="number"
              min={activeInstrument.lotSize}
              step={activeInstrument.lotSize}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || activeInstrument.lotSize)}
              className="w-full bg-[#0d1322] border border-[#243350] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">
              {orderType === 'MARKET' ? 'Market Execution (₹)' : 'Limit Price (₹)'}
            </label>
            <input
              type="number"
              step={activeInstrument.tickSize}
              disabled={orderType === 'MARKET'}
              value={orderType === 'MARKET' ? currentPrice?.toFixed(2) : limitPrice}
              onChange={(e) => setLimitPrice(Number(e.target.value))}
              className={`w-full bg-[#0d1322] border border-[#243350] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none ${orderType === 'MARKET' ? 'text-slate-400 bg-[#0a0f1a]' : 'text-white focus:border-emerald-500'}`}
            />
          </div>
        </div>

        {/* SL and Target Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-medium text-rose-400 block mb-1">
              🛑 Stop Loss (SL ₹)
            </label>
            <input
              type="number"
              step={activeInstrument.tickSize}
              value={slPrice}
              onChange={(e) => setSlPrice(Number(e.target.value))}
              className="w-full bg-[#0d1322] border border-rose-500/40 rounded-xl px-3 py-2 text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-emerald-400 block mb-1">
              🎯 Take Profit (TP ₹)
            </label>
            <input
              type="number"
              step={activeInstrument.tickSize}
              value={tpPrice}
              onChange={(e) => setTpPrice(Number(e.target.value))}
              className="w-full bg-[#0d1322] border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
        </div>

        {/* Risk / Reward & Margin Summary */}
        <div className="bg-[#0f172a] p-3 rounded-xl border border-[#1e293b] space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Max Risk (If SL hit):</span>
            <span className="font-mono font-bold text-rose-400">₹{riskAmount} ({((Number(riskAmount) / growwAccount.balance) * 100).toFixed(1)}%)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Max Reward (If TP hit):</span>
            <span className="font-mono font-bold text-emerald-400">₹{rewardAmount}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
            <span className="text-slate-400">Risk-to-Reward Ratio:</span>
            <span className={`font-mono font-bold ${Number(rrRatio) >= 2.0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              1:{rrRatio} {Number(rrRatio) >= 2.0 ? '✅ Institutional Grade' : '⚠️ Low R:R'}
            </span>
          </div>
        </div>

        {/* Submit Execution Button */}
        <button
          type="submit"
          className={`w-full py-3 rounded-xl font-bold text-xs shadow-xl transition-all flex items-center justify-center gap-2 ${
            orderSide === 'BUY'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/25'
              : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-rose-500/25'
          }`}
        >
          {orderSide === 'BUY' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          Execute {orderSide} Order on Groww Demat
        </button>
      </form>
    </div>
  );
}
