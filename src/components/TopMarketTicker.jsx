import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export default function TopMarketTicker({ currentPrices, activeInstrument, onSelectSymbol }) {
  const tickers = [
    { id: "NIFTY50", sym: "NIFTY 50", exch: "NSE", price: (currentPrices?.NIFTY50 || 24260.40).toFixed(2), chg: "+0.45%", isUp: true, curr: "₹" },
    { id: "BANKNIFTY", sym: "BANK NIFTY", exch: "NSE", price: (currentPrices?.BANKNIFTY || 57880.00).toFixed(2), chg: "+0.68%", isUp: true, curr: "₹" },
    { id: "BTCUSD", sym: "BTC/USDT", exch: "COINBASE", price: (currentPrices?.BTCUSD || 79050.00).toFixed(2), chg: "+1.34%", isUp: true, curr: "$" },
    { id: "RELIANCE", sym: "RELIANCE", exch: "NSE", price: (currentPrices?.RELIANCE || 1303.10).toFixed(2), chg: "+0.28%", isUp: true, curr: "₹" },
    { id: "HDFCBANK", sym: "HDFC BANK", exch: "NSE", price: (currentPrices?.HDFCBANK || 727.50).toFixed(2), chg: "-0.12%", isUp: false, curr: "₹" },
    { id: "MCXGOLD", sym: "GOLD MINI", exch: "MCX", price: "74,320.00", chg: "+0.52%", isUp: true, curr: "₹" },
    { id: "USDINR", sym: "USD/INR", exch: "FOREX", price: "87.45", chg: "+0.04%", isUp: true, curr: "₹" }
  ];

  return (
    <div className="bg-[#040711] border-b border-[#121b2b] px-3 sm:px-4 py-1.5 overflow-x-auto no-scrollbar select-none text-[11px]">
      <div className="flex items-center gap-5 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold tracking-wider text-[10px] uppercase shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>MARKET TAPE</span>
        </div>

        <div className="flex items-center gap-4">
          {tickers.map((t) => {
            const isActive = activeInstrument?.id === t.id;
            return (
              <div
                key={t.id}
                onClick={() => onSelectSymbol?.(t.id)}
                className={`flex items-center gap-2 px-2 py-0.5 rounded cursor-pointer transition-colors border ${
                  isActive
                    ? 'bg-[#10192b] border-emerald-500/40 text-white'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-[#0c1220]'
                }`}
              >
                <div className="flex items-baseline gap-1">
                  <span className="font-semibold text-white text-[11px]">{t.sym}</span>
                  <span className="text-[9px] text-slate-500 font-mono">{t.exch}</span>
                </div>
                <span className="font-mono font-bold text-slate-200 text-[11px]">{t.curr}{t.price}</span>
                <span className={`text-[10px] font-mono font-semibold flex items-center ${
                  t.isUp ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {t.chg}
                </span>
                <span className="text-slate-800 ml-1">|</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
