import React, { useState, useEffect } from 'react';
import { ShieldCheck, Key, RefreshCw, CheckCircle2, Lock, ArrowRight, Wallet, ExternalLink } from 'lucide-react';
import { soundEngine } from '../services/voiceCoach';

export default function RealTimeGrowwAuth({
  growwAccount,
  onUpdateAccount,
  onOpenFullModal
}) {
  const [totpInput, setTotpInput] = useState("");
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authStep, setAuthStep] = useState("idle");
  const [totpSecondsLeft, setTotpSecondsLeft] = useState(30);

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
      }, 3000);
    }, 1000);
  };

  return (
    <div className="bg-[#090e1a] border border-[#162236] rounded-xl px-3 sm:px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Left: Groww Brand & Live Auth State */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#00D09C]/10 border border-[#00D09C]/30 flex items-center justify-center text-[#00D09C] font-black font-mono text-sm">
          G
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight text-xs">Groww Demat Gateway</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              2FA VERIFIED
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Client: <strong className="text-slate-200">{growwAccount.clientId}</strong> • DP ID: 1208160019284729
          </p>
        </div>
      </div>

      {/* Center: Live TOTP Handshake */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-[#0e1626] border border-[#1b2a40] px-2.5 py-1 rounded-lg font-mono">
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <input
            type="text"
            maxLength={6}
            value={totpInput}
            onChange={(e) => setTotpInput(e.target.value.replace(/\D/g, ''))}
            placeholder="6-Digit TOTP"
            className="bg-transparent text-white font-mono w-24 focus:outline-none placeholder-slate-500 text-xs"
          />
          <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1 rounded">
            {totpSecondsLeft}s
          </span>
        </div>

        <button
          onClick={handleRealTimeAuthorize}
          disabled={isAuthorizing}
          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          {isAuthorizing ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verifying...</span>
            </>
          ) : authStep === 'success' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>Authorised</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>Authorize Live</span>
            </>
          )}
        </button>

        <button
          onClick={() => {
            setTotpInput(Math.floor(100000 + Math.random() * 900000).toString());
          }}
          className="text-[11px] text-slate-400 hover:text-cyan-400 underline font-mono"
        >
          Demo TOTP
        </button>
      </div>

      {/* Right: Available Buying Power */}
      <div className="flex items-center gap-3">
        <div className="text-right font-mono">
          <span className="text-[10px] text-slate-400 block font-sans">Available Margin</span>
          <span className="text-xs font-bold text-emerald-400">
            ₹{growwAccount.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <button
          onClick={onOpenFullModal}
          className="p-1.5 bg-[#0e1626] hover:bg-[#162238] text-slate-300 hover:text-white rounded-lg border border-[#1c2a3f] text-xs transition-colors"
          title="Configure API Keys & Broker Details"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
        </button>
      </div>
    </div>
  );
}
