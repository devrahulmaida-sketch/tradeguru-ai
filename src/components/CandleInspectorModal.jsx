import React, { useEffect } from 'react';
import { X, Volume2, Sparkles, BookOpen, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { voiceCoach } from '../services/voiceCoach';

export default function CandleInspectorModal({
  isOpen,
  onClose,
  candleData,
  onAskAIAboutCandle
}) {
  if (!isOpen || !candleData) return null;

  const handleSpeak = () => {
    if (candleData.speechText) {
      voiceCoach.speak(candleData.speechText + " " + candleData.actionAdvice, true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#111827] border border-[#243350] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d1322] to-[#172238] p-4 border-b border-[#243350] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              🔍
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                {candleData.candleType}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Bar Time: {candleData.time} | Vol: {candleData.volume}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeak}
              className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4" />
              <span>AI Se Suno</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1a263e]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* OHLC Bar Numbers */}
        <div className="grid grid-cols-4 gap-2 bg-[#0c1220] p-3 text-center border-b border-[#1f293d] font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">Open</span>
            <span className="text-white font-bold">₹{candleData.open}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">High</span>
            <span className="text-emerald-400 font-bold">₹{candleData.high}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Low</span>
            <span className="text-rose-400 font-bold">₹{candleData.low}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Close</span>
            <span className="text-white font-bold">₹{candleData.close}</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 space-y-3.5 max-h-[65vh] overflow-y-auto text-xs bg-[#0b0f19]">
          {/* Order Flow Meaning */}
          <div className="bg-[#141d30] p-3.5 rounded-xl border border-[#22314d] space-y-1.5">
            <h5 className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5" /> Is Candle Ka Asli Matlab (Order Flow Battle):
            </h5>
            <p className="text-slate-200 leading-relaxed text-[12px]">
              {candleData.orderFlowMeaning}
            </p>
          </div>

          {/* Indicators Confluence */}
          <div className="bg-[#0f172a] p-3.5 rounded-xl border border-[#1e293b] space-y-1.5">
            <h5 className="font-bold text-cyan-400 flex items-center gap-1.5 text-xs">
              <Layers className="w-3.5 h-3.5" /> Indicators Ka Signal:
            </h5>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <p>{candleData.emaContext}</p>
              <p>{candleData.vwapContext}</p>
              <p>{candleData.rsiContext}</p>
            </div>
          </div>

          {/* Pro Trader Rule */}
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-200 space-y-1">
            <h5 className="font-bold text-purple-300 flex items-center gap-1.5 text-xs">
              <BookOpen className="w-3.5 h-3.5" /> Professional Book Law:
            </h5>
            <p className="italic text-[11px] leading-relaxed">
              "{candleData.proRule}"
            </p>
          </div>

          {/* Actionable Advice */}
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-200 space-y-1">
            <h5 className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ab Agla Kadam Kya Hona Chahiye (Pro Move):
            </h5>
            <p className="text-[11px] leading-relaxed">
              {candleData.actionAdvice}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0d1322] border-t border-[#1f293d] flex gap-2">
          <button
            onClick={() => {
              onAskAIAboutCandle(`Explain this candle in detail: ${candleData.candleType} at time ${candleData.time}, Close: ${candleData.close}`);
              onClose();
            }}
            className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Groq AI Se Deep Chat Karo
          </button>
        </div>
      </div>
    </div>
  );
}
