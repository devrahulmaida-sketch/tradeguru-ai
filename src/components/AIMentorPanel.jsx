import React, { useState } from 'react';
import { Sparkles, ShieldAlert, Target, BookOpen, Volume2, VolumeX, ArrowUpRight, ArrowDownRight, Compass, Flame } from 'lucide-react';
import { voiceCoach } from '../services/voiceCoach';

export default function AIMentorPanel({
  currentSetup,
  activeInstrument,
  onApplySetupToOrder,
  onOpenGyanLibrary,
  onOpenSetupsHub
}) {
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const toggleVoice = () => {
    const active = voiceCoach.toggle();
    setVoiceEnabled(active);
  };

  const handleSpeakSetup = () => {
    if (!currentSetup) return;
    const speech = `Real-time setup on ${activeInstrument.name}. Stance: ${currentSetup.bias}. ${currentSetup.setupName}. Entry at ${currentSetup.entry}, Stop Loss at ${currentSetup.sl}, Target at ${currentSetup.tp1}. Principle from ${currentSetup.bookRef}.`;
    voiceCoach.speak(speech, true);
  };

  if (!currentSetup) {
    return (
      <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-4 text-center text-slate-400">
        <Compass className="w-8 h-8 mx-auto mb-2 text-slate-500 animate-spin" />
        <p className="text-xs">Scanning real-time ticks for institutional setups...</p>
      </div>
    );
  }

  const isBuy = currentSetup.bias === 'BUY';
  const isSell = currentSetup.bias === 'SELL';

  return (
    <div className="bg-[#111827] border border-[#1f293d] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Top Banner */}
      <div className="p-3.5 border-b border-[#1f293d] bg-gradient-to-r from-[#0d1322] to-[#172033] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-white">Live AI Signal & Setup</h4>
              <span className="animate-pulse w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-[10px] text-slate-400">Real-Time Market Confluence Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenSetupsHub}
            className="px-2 py-1 rounded-lg text-xs font-semibold bg-[#162033] hover:bg-[#202e48] text-emerald-400 border border-emerald-500/30 flex items-center gap-1 transition-colors"
            title="Browse all 70%+ institutional setups"
          >
            <Target className="w-3.5 h-3.5" />
            <span className="text-[11px]">Setups</span>
          </button>

          <button
            onClick={onOpenGyanLibrary}
            className="px-2 py-1 rounded-lg text-xs font-semibold bg-[#162033] hover:bg-[#202e48] text-amber-400 border border-amber-500/30 flex items-center gap-1 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-[11px]">Books</span>
          </button>
        </div>
      </div>

      {/* Main Signal Card */}
      <div className="p-4 space-y-3.5">
        {/* Signal Direction & Setup Name */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1 tracking-wider ${
              isBuy
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : isSell
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}>
              {isBuy ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {currentSetup.bias}
            </span>
            <h4 className="text-xs font-bold text-white leading-tight">{currentSetup.setupName}</h4>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-mono">Risk/Reward</span>
            <span className="text-xs font-black text-emerald-400 font-mono">{currentSetup.rr}</span>
          </div>
        </div>

        {/* Execution Metrics Grid */}
        <div className="grid grid-cols-4 gap-2 text-center bg-[#0d1322] p-2.5 rounded-xl border border-[#1e293b]">
          <div>
            <span className="text-[10px] text-slate-400 block">Entry ({activeInstrument.currency || '₹'})</span>
            <span className="text-xs font-bold font-mono text-cyan-400">{currentSetup.entry}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Stop Loss</span>
            <span className="text-xs font-bold font-mono text-rose-400">{currentSetup.sl}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Target 1</span>
            <span className="text-xs font-bold font-mono text-emerald-400">{currentSetup.tp1}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Target 2</span>
            <span className="text-xs font-bold font-mono text-emerald-300">{currentSetup.tp2}</span>
          </div>
        </div>

        {/* Book Wisdom Citation */}
        <div className="bg-[#141b2c] p-3 rounded-xl border border-[#22314d] space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> {currentSetup.bookRef}
            </span>
            <button
              onClick={handleSpeakSetup}
              className="text-slate-400 hover:text-white"
              title="Speak this breakdown"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {currentSetup.rationale}
          </p>
        </div>

        {/* Mark Douglas Psychology Tip */}
        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[11px] text-purple-300 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
          <p className="leading-snug">
            {currentSetup.psychologyAdvice}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onApplySetupToOrder(currentSetup)}
          className={`w-full py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
            isBuy
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/20'
              : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-rose-500/20'
          }`}
        >
          <Target className="w-4 h-4" />
          Load Setup into Order Terminal ({isBuy ? 'BUY' : 'SELL'})
        </button>
      </div>
    </div>
  );
}
