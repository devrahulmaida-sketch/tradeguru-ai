import React, { useState } from 'react';
import { X, Target, CheckCircle2, BookOpen, Sparkles, Volume2, ArrowRight, ShieldCheck, Flame, Percent } from 'lucide-react';
import { PRO_SETUPS } from '../data/setupsData';
import { voiceCoach } from '../services/voiceCoach';

export default function SetupsHubModal({
  isOpen,
  onClose,
  currentPrice,
  symbolCurrency = '₹',
  onApplySetupToOrder,
  onAskAIAboutSetup
}) {
  if (!isOpen) return null;

  const [selectedSetup, setSelectedSetup] = useState(PRO_SETUPS[0]);

  const handleSpeak = (setup) => {
    const text = `Pro setup: ${setup.name}. Win rate ${setup.winRate}. ${setup.hinglishLogic}`;
    voiceCoach.speak(text, true);
  };

  const handleApply = (setup) => {
    const isBuy = setup.bias === 'BUY';
    const entry = currentPrice;
    const sl = isBuy ? Number((currentPrice * 0.995).toFixed(2)) : Number((currentPrice * 1.005).toFixed(2));
    const risk = Math.abs(entry - sl);
    const tp1 = isBuy ? Number((entry + risk * 2).toFixed(2)) : Number((entry - risk * 2).toFixed(2));
    const tp2 = isBuy ? Number((entry + risk * 3).toFixed(2)) : Number((entry - risk * 3).toFixed(2));

    onApplySetupToOrder({
      bias: setup.bias,
      setupName: setup.name,
      bookRef: `${setup.book} (${setup.author})`,
      rationale: setup.hinglishLogic,
      entry,
      sl,
      tp1,
      tp2,
      rr: setup.avgRR,
      psychologyAdvice: "Mark Douglas: Setup execute karte waqt darr mat rakho, risk pehle se accept karo."
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#111827] border border-[#243350] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d1322] via-[#141e33] to-[#1c1833] p-4 sm:p-5 border-b border-[#243350] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Institutional Trading Setups Hub
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  70%+ Win Rate Setups
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Al Brooks H2, Wyckoff Spring, ICT FVG, Order Block Retests with 5-Point Confirmation Checklists
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#1a263e]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left: Setup Selection Tabs */}
          <div className="md:col-span-5 border-r border-[#1f293d] p-3.5 space-y-2.5 overflow-y-auto max-h-[65vh] bg-[#0c1220]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
              Select Institutional Strategy:
            </span>
            {PRO_SETUPS.map((setup) => {
              const isSelected = selectedSetup.id === setup.id;
              return (
                <div
                  key={setup.id}
                  onClick={() => setSelectedSetup(setup)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-[#1a2538] border-emerald-500/80 shadow-lg shadow-emerald-500/10'
                      : 'bg-[#121927] border-[#1f2a3e] hover:bg-[#182336]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase font-mono ${
                      setup.bias === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {setup.bias}
                    </span>
                    <span className="text-[11px] font-bold font-mono text-emerald-300 flex items-center gap-0.5">
                      <Percent className="w-3 h-3" /> Win Rate: {setup.winRate}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-white leading-tight mb-1">{setup.name}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{setup.hinglishLogic}</p>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Setup Deep Dive */}
          <div className="md:col-span-7 p-5 space-y-4 overflow-y-auto max-h-[65vh] bg-[#0b0f19]">
            {/* Title & Badge */}
            <div className="flex items-start justify-between gap-3 border-b border-[#1f293d] pb-3">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {selectedSetup.badge}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white mt-1">{selectedSetup.name}</h3>
                <p className="text-xs text-slate-400">
                  Book: <strong className="text-white">{selectedSetup.book}</strong> ({selectedSetup.author})
                </p>
              </div>

              <button
                onClick={() => handleSpeak(selectedSetup)}
                className="px-2.5 py-1.5 bg-[#162033] hover:bg-[#202e48] text-emerald-400 rounded-xl border border-[#243350] text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                title="Hear AI explain in Hinglish"
              >
                <Volume2 className="w-4 h-4" />
                <span>AI Voice</span>
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 bg-[#0f172a] p-3 rounded-xl border border-[#1e293b] text-center">
              <div>
                <span className="text-[10px] text-slate-400 block">Historical Win Rate</span>
                <span className="text-sm font-black text-emerald-400 font-mono">{selectedSetup.winRate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Average R:R</span>
                <span className="text-sm font-black text-cyan-400 font-mono">{selectedSetup.avgRR}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Trade Direction</span>
                <span className={`text-sm font-black font-mono ${selectedSetup.bias === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedSetup.bias}
                </span>
              </div>
            </div>

            {/* Hinglish Logic */}
            <div className="bg-[#141d30] p-3.5 rounded-xl border border-[#22314d] space-y-1">
              <h5 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Is Setup Ka Asli Order Flow Logic (Hinglish):
              </h5>
              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedSetup.hinglishLogic}
              </p>
            </div>

            {/* 5-Point Confirmation Checklist */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" /> 5-Point Confirmation Checklist:
              </h5>
              <div className="space-y-1.5">
                {selectedSetup.checklist.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-[#0f172a] p-2.5 rounded-xl border border-[#1e293b] text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleApply(selectedSetup)}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Target className="w-4 h-4" />
                Apply This Setup on Live Chart & Demat
              </button>

              <button
                onClick={() => {
                  onAskAIAboutSetup(`Explain the 5-point execution checklist and stop loss placement for: ${selectedSetup.name}`);
                  onClose();
                }}
                className="px-4 py-3 bg-[#1a263e] hover:bg-[#243454] text-purple-300 border border-purple-500/30 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Ask AI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
