import React, { useState } from 'react';
import { XCircle, CheckCircle, TrendingUp, TrendingDown, BookOpen, Award, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function PositionsJournal({
  activePositions,
  closedTrades,
  onClosePosition,
  currentPrices
}) {
  const [activeTab, setActiveTab] = useState("open"); // "open" | "closed"

  return (
    <div className="bg-[#111827] border border-[#1f293d] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-3.5 border-b border-[#1f293d] bg-[#0d1322] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("open")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "open"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Active Positions ({activePositions.length})
          </button>
          <button
            onClick={() => setActiveTab("closed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "closed"
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            AI Trade Journal ({closedTrades.length})
          </button>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400">Total Closed P&L: </span>
          <span className={`text-xs font-bold font-mono ${
            closedTrades.reduce((s, t) => s + (t.finalPnL || 0), 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            ₹{closedTrades.reduce((s, t) => s + (t.finalPnL || 0), 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-x-auto min-h-[160px] max-h-[260px] overflow-y-auto">
        {activeTab === "open" ? (
          activePositions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No open positions. Use the Execution Panel above or load an AI Setup to start practicing live!
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-[#1e293b] pb-2">
                  <th className="pb-2 font-medium">Instrument</th>
                  <th className="pb-2 font-medium">Side</th>
                  <th className="pb-2 font-medium">Qty</th>
                  <th className="pb-2 font-medium">Entry</th>
                  <th className="pb-2 font-medium">LTP</th>
                  <th className="pb-2 font-medium">SL / Target</th>
                  <th className="pb-2 font-medium text-right">P&L (₹)</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {activePositions.map((pos) => {
                  const ltp = currentPrices[pos.symbol] || pos.entryPrice;
                  const diff = pos.side === 'BUY' ? ltp - pos.entryPrice : pos.entryPrice - ltp;
                  const pnl = diff * pos.quantity;
                  const pnlPct = ((diff / pos.entryPrice) * 100).toFixed(2);
                  const isProfit = pnl >= 0;

                  return (
                    <tr key={pos.id} className="hover:bg-[#162033]/50">
                      <td className="py-2.5 font-bold text-white">{pos.name}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pos.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {pos.side}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-slate-300">{pos.quantity}</td>
                      <td className="py-2.5 font-mono text-slate-300">₹{pos.entryPrice}</td>
                      <td className="py-2.5 font-mono font-bold text-white">₹{ltp.toFixed(2)}</td>
                      <td className="py-2.5 font-mono text-[11px] text-slate-400">
                        <span className="text-rose-400">SL: {pos.sl}</span> / <span className="text-emerald-400">TP: {pos.tp}</span>
                      </td>
                      <td className={`py-2.5 text-right font-mono font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfit ? '+' : ''}₹{pnl.toFixed(2)} ({pnlPct}%)
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => onClosePosition(pos.id, 'MANUAL_EXIT')}
                          className="px-2.5 py-1 bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 rounded text-[11px] font-semibold transition-colors"
                        >
                          Square Off
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : (
          closedTrades.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No closed trades yet in today's journal.
            </div>
          ) : (
            <div className="space-y-2.5">
              {closedTrades.map((t) => (
                <div key={t.id} className="bg-[#0f172a] p-3 rounded-xl border border-[#1e293b] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        t.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {t.side}
                      </span>
                      <strong className="text-white text-xs">{t.name}</strong>
                      <span className="text-slate-400 font-mono text-[11px]">{t.quantity} Qty @ ₹{t.entryPrice} ➔ ₹{t.exitPrice}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e293b] text-slate-400 font-mono">
                        Exit: {t.exitReason}
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-300 mt-1 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <strong>AI Journal Audit:</strong> {t.aiReview || "Disciplined execution in line with Mark Douglas rule #2."}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-sm font-mono font-bold block ${t.finalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.finalPnL >= 0 ? '+' : ''}₹{t.finalPnL?.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{t.timeClosedFormatted}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
