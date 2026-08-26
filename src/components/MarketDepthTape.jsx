import React, { useMemo } from 'react';
import { Layers, Activity } from 'lucide-react';

export default function MarketDepthTape({ currentPrice, activeInstrument }) {
  const p = currentPrice || activeInstrument.basePrice;
  const tick = activeInstrument.tickSize || 0.05;

  // Generate 5 bids and 5 asks around current price
  const depth = useMemo(() => {
    const bids = [];
    const asks = [];
    let totBidQty = 0;
    let totAskQty = 0;

    for (let i = 1; i <= 5; i++) {
      const bidPrice = Number((p - i * tick).toFixed(2));
      const askPrice = Number((p + i * tick).toFixed(2));
      const bidQty = Math.floor(activeInstrument.lotSize * (2 + Math.random() * 8));
      const askQty = Math.floor(activeInstrument.lotSize * (2 + Math.random() * 8));
      totBidQty += bidQty;
      totAskQty += askQty;

      bids.push({ price: bidPrice, qty: bidQty, orders: Math.floor(1 + Math.random() * 6) });
      asks.push({ price: askPrice, qty: askQty, orders: Math.floor(1 + Math.random() * 6) });
    }

    return { bids, asks, totBidQty, totAskQty };
  }, [p, tick, activeInstrument.lotSize]);

  const bidRatio = Math.round((depth.totBidQty / (depth.totBidQty + depth.totAskQty || 1)) * 100);

  return (
    <div className="bg-[#0e1424] border border-[#1e2a3f] rounded-2xl overflow-hidden shadow-2xl flex flex-col font-mono text-xs">
      {/* Header */}
      <div data-guide="market_depth" className="p-3 border-b border-[#1e2a3f] bg-[#0c1220] flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white tracking-wide">Level 2 Market Depth (Groww Order Book)</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-emerald-400 font-bold">{bidRatio}% Buyers</span>
          <span className="text-slate-500">vs</span>
          <span className="text-rose-400 font-bold">{100 - bidRatio}% Sellers</span>
        </div>
      </div>

      {/* Buyer vs Seller Ratio Bar */}
      <div className="h-1.5 w-full flex bg-[#162033]">
        <div className="bg-emerald-500 transition-all duration-300" style={{ width: `${bidRatio}%` }} />
        <div className="bg-rose-500 transition-all duration-300" style={{ width: `${100 - bidRatio}%` }} />
      </div>

      {/* 2-Column Table */}
      <div className="grid grid-cols-2 divide-x divide-[#1e2a3f] p-2 bg-[#090e1a]">
        {/* Bids */}
        <div>
          <div className="flex justify-between text-[10px] text-slate-400 pb-1 border-b border-[#1e2a3f] px-1 font-sans">
            <span>Bids (Buy)</span>
            <span>Qty</span>
          </div>
          <div className="space-y-1 pt-1">
            {depth.bids.map((b, i) => (
              <div key={i} className="flex justify-between px-1 text-[11px] hover:bg-emerald-500/10 rounded">
                <span className="text-emerald-400 font-bold">{activeInstrument.currency}{b.price.toFixed(2)}</span>
                <span className="text-slate-300">{b.qty}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Asks */}
        <div>
          <div className="flex justify-between text-[10px] text-slate-400 pb-1 border-b border-[#1e2a3f] px-1 font-sans">
            <span>Asks (Sell)</span>
            <span>Qty</span>
          </div>
          <div className="space-y-1 pt-1">
            {depth.asks.map((a, i) => (
              <div key={i} className="flex justify-between px-1 text-[11px] hover:bg-rose-500/10 rounded">
                <span className="text-rose-400 font-bold">{activeInstrument.currency}{a.price.toFixed(2)}</span>
                <span className="text-slate-300">{a.qty}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
