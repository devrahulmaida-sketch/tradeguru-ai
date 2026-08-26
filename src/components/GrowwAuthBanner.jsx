import React, { useState, useEffect } from 'react';
import { ShieldCheck, Key, RefreshCw, Wallet, CheckCircle2, Lock, ExternalLink } from 'lucide-react';

export default function GrowwAuthBanner({ growwAccount, onOpenGrowwModal }) {
  const [countdown, setCountdown] = useState("23h 54m 18s");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const sec = 59 - now.getSeconds();
      const min = 59 - now.getMinutes();
      setCountdown(`23h ${min}m ${sec < 10 ? '0' : ''}${sec}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-[#0d1424] via-[#101b30] to-[#0c1322] border border-[#1e2a3f] rounded-xl px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-lg">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-black text-white tracking-wide">
            Groww Demat Authorisation:
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            SEBI 2FA ACTIVE
          </span>
        </div>

        <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-300">
          <span>Client: <strong className="text-white">{growwAccount.clientId}</strong></span>
          <span>Demat: <strong className="text-slate-400">1208160019284729</strong></span>
          <span className="text-cyan-400 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Token Valid: {countdown}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-sans">Groww Available Margin</span>
          <span className="text-xs font-black font-mono text-emerald-400">
            ₹{growwAccount.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <button
          onClick={onOpenGrowwModal}
          className="px-2.5 py-1 bg-[#162033] hover:bg-[#202e48] text-slate-300 hover:text-white border border-[#243350] rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3 text-emerald-400" />
          <span>Re-Auth / Edit</span>
        </button>
      </div>
    </div>
  );
}
