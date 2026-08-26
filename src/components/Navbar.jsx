import React, { useState, useEffect } from 'react';
import { Bot, BookOpen, Volume2, VolumeX, Shield, Wallet, Zap, Sparkles, TrendingUp } from 'lucide-react';
import { voiceCoach } from '../services/voiceCoach';

export default function Navbar({
  growwAccount,
  aiConfig,
  onOpenGrowwModal,
  onOpenAIConfig,
  onOpenGyanLibrary
}) {
  const [time, setTime] = useState("");
  const [voiceOn, setVoiceOn] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleVoice = () => {
    const active = voiceCoach.toggle();
    setVoiceOn(active);
  };

  return (
    <header className="bg-[#0c1220]/90 backdrop-blur-md border-b border-[#1f293d] sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Market Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-white">TradeGuru</span>
                <span className="text-base font-bold text-emerald-400">AI</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  GROWW SYNC
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none">
                Real-Time Institutional Masterclass • Dalal Street
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-[#1f293d]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold text-slate-300">NSE / BSE LIVE</span>
            <span className="text-[11px] font-mono text-slate-500">{time} IST</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Books Matrix Button */}
          <button
            onClick={onOpenGyanLibrary}
            className="px-3 py-1.5 rounded-xl bg-[#162033] hover:bg-[#202e48] text-amber-400 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Books Gyan (9+)</span>
          </button>

          {/* AI Brain Config Button */}
          <button
            onClick={onOpenAIConfig}
            className="px-3 py-1.5 rounded-xl bg-[#162033] hover:bg-[#202e48] text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">AI API:</span>
            <span className="font-mono text-[11px] text-purple-400 uppercase">
              {aiConfig.provider === 'builtin' ? 'Auto Alpha' : aiConfig.provider}
            </span>
          </button>

          {/* Voice Coach Toggle */}
          <button
            onClick={toggleVoice}
            className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
              voiceOn
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-emerald-500/20'
                : 'bg-[#162033] text-slate-400 border-[#243350] hover:text-white'
            }`}
            title="Toggle Live Spoken Voice Commentary"
          >
            {voiceOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Groww Demat Status / Connect Button */}
          <button
            onClick={onOpenGrowwModal}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <Wallet className="w-3.5 h-3.5" />
            <span>Groww Demat:</span>
            <span className="font-mono font-black">₹{(growwAccount.balance / 1000).toFixed(1)}k</span>
          </button>
        </div>
      </div>
    </header>
  );
}
