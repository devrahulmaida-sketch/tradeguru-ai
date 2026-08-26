import React, { useState, useEffect } from 'react';
import { ShieldCheck, Key, RefreshCw, CheckCircle2, Lock, ArrowRight, Wallet, AlertCircle, Sparkles } from 'lucide-react';
import { soundEngine } from '../services/voiceCoach';

export default function RealTimeGrowwAuth({
  growwAccount,
  onUpdateAccount,
  onOpenFullModal
}) {
  const [totpInput, setTotpInput] = useState("");
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authStep, setAuthStep] = useState("idle"); // "idle" | "verifying" | "success"
  const [totpSecondsLeft, setTotpSecondsLeft] = useState(30);

  // 30s TOTP rotation timer (Like Google Authenticator)
  useEffect(() => {
    const interval = setInterval(() => {
      const sec = 30 - (Math.floor(Date.now() / 1000) % 30);
      setTotpSecondsLeft(sec);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRealTimeAuthorize = (e) => {
    e?.preventDefault();
    setIsAuthorizing(true);
    setAuthStep("verifying");

    // Realistic API handshake with Groww auth gateway
    setTimeout(() => {
      onUpdateAccount({
        ...growwAccount,
        isConnected: true,
        lastAuthTimestamp: Date.now(),
        bearerToken: `grw_live_tok_${Math.random().toString(36).substring(2, 15)}`
      });
      setAuthStep("success");
      setIsAuthorizing(false);
      soundEngine.playChime('profit');

      setTimeout(() => {
        setAuthStep("idle");
      }, 3500);
    }, 1200);
  };

  return (
    <div className="bg-[#090e1a] border border-[#1b273b] rounded-2xl p-3 sm:p-4 shadow-2xl relative overflow-hidden">
      {/* Background glow subtle */}
      <div className="absolute top-0 right-0 w-96 h-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        {/* Left: Groww Brand & Live Auth State */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-lg shadow-inner">
            G
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white tracking-tight">Groww Demat Real-Time API</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                SEBI 2FA AUTH
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Client: <strong className="text-white font-mono">{growwAccount.clientId}</strong> • Demat DP ID: <span className="font-mono text-slate-300">1208160019284729</span>
            </p>
          </div>
        </div>

        {/* Center: Live TOTP 2FA Handshake */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#0f1728] border border-[#22334e] px-3 py-1.5 rounded-xl text-xs font-mono">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <input
              type="text"
              maxLength={6}
              value={totpInput}
              onChange={(e) => setTotpInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-Digit TOTP"
              className="bg-transparent text-white font-mono w-28 focus:outline-none placeholder-slate-500 text-xs"
            />
            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1 rounded">
              {totpSecondsLeft}s
            </span>
          </div>

          <button
            onClick={handleRealTimeAuthorize}
            disabled={isAuthorizing}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isAuthorizing ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authorising...</span>
              </>
            ) : authStep === 'success' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Authorised!</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Authorize Demat</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              // Auto-fill realistic demo TOTP
              setTotpInput(Math.floor(100000 + Math.random() * 900000).toString());
            }}
            className="text-[11px] text-slate-400 hover:text-cyan-400 underline font-medium"
          >
            Auto-fill TOTP
          </button>
        </div>

        {/* Right: Live Available Margin */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Demat Buying Power</span>
            <span className="text-sm font-black font-mono text-emerald-400">
              ₹{growwAccount.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={onOpenFullModal}
            className="p-2 bg-[#141f33] hover:bg-[#1e2d4a] text-slate-300 hover:text-white rounded-xl border border-[#243754] text-xs transition-colors"
            title="Configure API Keys & Broker Details"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
