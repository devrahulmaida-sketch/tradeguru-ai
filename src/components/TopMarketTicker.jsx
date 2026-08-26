import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function TopMarketTicker({ currentPrices, activeInstrument }) {
  const items = [
    { sym: "NIFTY 50", price: `₹${(currentPrices?.NIFTY50 || 24260.40).toFixed(2)}`, chg: "+0.45%", up: true },
    { sym: "BANK NIFTY", price: `₹${(currentPrices?.BANKNIFTY || 57880.00).toFixed(2)}`, chg: "+0.68%", up: true },
    { sym: "BTC / USDT", price: `$${(currentPrices?.BTCUSD || 79050.00).toFixed(2)}`, chg: "+1.34%", up: true },
    { sym: "RELIANCE", price: `₹${(currentPrices?.RELIANCE || 1303.10).toFixed(2)}`, chg: "+0.28%", up: true },
    { sym: "HDFC BANK", price: `₹${(currentPrices?.HDFCBANK || 727.50).toFixed(2)}`, chg: "-0.12%", up: false },
    { sym: "MCX GOLD", price: "₹74,320", chg: "+0.52%", up: true },
    { sym: "CRUDE OIL", price: "₹6,310", chg: "-0.40%", up: false },
    { sym: "USD / INR", price: "₹87.45", chg: "+0.04%", up: true }
  ];

  return (
    <div className="bg-[#050811] border-b border-[#141d2e] px-4 py-1.5 overflow-x-auto no-scrollbar select-none text-[11px] font-mono">
      <div className="flex items-center gap-6 whitespace-nowrap">
        <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          GLOBAL TERMINAL TAPE:
        </span>
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-slate-400 font-sans font-bold">{it.sym}</span>
            <span className="text-white font-bold">{it.price}</span>
            <span className={`text-[10px] font-bold flex items-center ${it.up ? 'text-emerald-400' : 'text-rose-400'}`}>
              {it.up ? '+' : ''}{it.chg}
            </span>
            <span className="text-slate-700">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}
