import React, { useState, useEffect } from 'react';
import { Bot, BookOpen, Wallet, Zap, Target, Bell, BellOff, ArrowUpRight, ShieldCheck, ChevronDown } from 'lucide-react';
import { soundEngine } from '../services/voiceCoach';

export default function Navbar({
  growwAccount,
  aiConfig,
  onOpenGrowwModal,
  onOpenAIConfig,
  onOpenGyanLibrary,
  onOpenSetupsHub
}) {
  const [time, setTime] = useState("");
  const [soundMode, setSoundMode] = useState("CHIMES_ONLY");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const next = soundMode === 'CHIMES_ONLY' ? 'MUTED' : 'CHIMES_ONLY';
    setSoundMode(next);
    soundEngine.setMode(next);
  };

  const hasGroqKey = Boolean(aiConfig.apiKey && (aiConfig.provider === 'groq' || aiConfig.apiKey.startsWith('gsk_')));

  return (
    <header className="bg-[#070b14]/95 backdrop-blur-md border-b border-[#141d2e] sticky top-0 z-40 px-3 sm:px-4 py-2 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Market Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black">
              <span className="font-mono text-sm tracking-tighter">TG</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-white tracking-tight">TradeGuru</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono block leading-none mt-0.5">
                NSE / BSE Institutional Engine
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-[#162236] text-[11px] font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-semibold">FEED LIVE</span>
            <span className="text-slate-500">{time} IST</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Institutional Setups Hub */}
          <button
            onClick={onOpenSetupsHub}
            className="px-2.5 py-1.5 rounded-lg bg-[#0e1626] hover:bg-[#162238] text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Target className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Setups Hub (70%+)</span>
          </button>

          {/* Groq Key Button */}
          <button
            onClick={onOpenAIConfig}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border shadow-sm ${
              hasGroqKey
                ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{hasGroqKey ? 'Groq Active' : 'Paste Groq Key'}</span>
          </button>

          {/* Audio Chime Mode Toggle */}
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
              soundMode === 'CHIMES_ONLY'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-[#0e1626] text-slate-500 border-[#1c283d]'
            }`}
            title={soundMode === 'CHIMES_ONLY' ? "Sound Chimes Active" : "Sound Muted"}
          >
            {soundMode === 'CHIMES_ONLY' ? <Bell className="w-4 h-4 text-emerald-400" /> : <BellOff className="w-4 h-4" />}
          </button>

          {/* Books Gyan Button */}
          <button
            onClick={onOpenGyanLibrary}
            className="px-2.5 py-1.5 rounded-lg bg-[#0e1626] hover:bg-[#162238] text-slate-300 hover:text-white border border-[#1e2a3f] text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Books Matrix</span>
          </button>

          {/* Groww Demat Status */}
          <button
            onClick={onOpenGrowwModal}
            className="px-3 py-1.5 rounded-lg bg-[#0e1626] hover:bg-[#162238] text-white text-xs font-semibold transition-all flex items-center gap-2 border border-emerald-500/40 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 hidden sm:inline">Groww:</span>
            <span className="font-mono font-bold text-emerald-400">
              ₹{growwAccount.balance?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
