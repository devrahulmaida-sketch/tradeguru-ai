import React, { useState } from 'react';
import { X, ShieldCheck, Key, RefreshCw, CheckCircle2, Wallet, UserCheck, AlertTriangle, ExternalLink } from 'lucide-react';

export default function GrowwAuthModal({
  isOpen,
  onClose,
  growwAccount,
  onUpdateAccount
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState("connect"); // "connect" | "credentials" | "holdings"
  const [formData, setFormData] = useState({
    clientId: growwAccount.clientId || "GRW-782491",
    accountName: growwAccount.accountName || "Arjun Trader",
    apiKey: growwAccount.apiKey || "",
    apiSecret: growwAccount.apiSecret || "",
    totp: growwAccount.totp || "",
    mode: growwAccount.mode || "SANDBOX_SYNC",
    balance: growwAccount.balance || 250000
  });

  const [notification, setNotification] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateAccount({
      ...growwAccount,
      ...formData,
      isConnected: true
    });
    setNotification("Groww Demat Account Connected Successfully!");
    setTimeout(() => {
      setNotification(null);
      onClose();
    }, 1200);
  };

  const handleDisconnect = () => {
    onUpdateAccount({
      ...growwAccount,
      isConnected: false
    });
    setNotification("Demat Disconnected.");
    setTimeout(() => {
      setNotification(null);
      onClose();
    }, 1000);
  };

  const handleResetCapital = (amount) => {
    onUpdateAccount({
      ...growwAccount,
      balance: amount,
      initialBalance: amount,
      marginUsed: 0,
      realizedPnL: 0
    });
    setNotification(`Trading Capital Reset to ₹${amount.toLocaleString('en-IN')}!`);
    setTimeout(() => setNotification(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-[#243350] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d1322] to-[#131d31] p-5 border-b border-[#243350] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-xl">
              G
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Groww Demat Integration</h3>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  SEBI Compliant API
                </span>
              </div>
              <p className="text-xs text-slate-400">Direct Broker Sync & Practice Execution Terminal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#1a263e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1f293d] bg-[#0c1220] px-4">
          <button
            onClick={() => setActiveTab("connect")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "connect"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            1-Click Connect & Balance
          </button>
          <button
            onClick={() => setActiveTab("credentials")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "credentials"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Live Groww API Keys (TOTP)
          </button>
          <button
            onClick={() => setActiveTab("holdings")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "holdings"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Demat Holdings ({growwAccount.holdings?.length || 0})
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
          {notification && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {notification}
            </div>
          )}

          {/* TAB 1: 1-Click Connect & Account Summary */}
          {activeTab === "connect" && (
            <div className="space-y-4">
              <div className="bg-[#162033] p-4 rounded-xl border border-[#243350] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{growwAccount.accountName}</h4>
                    <p className="text-xs text-slate-400">Client ID: <span className="font-mono text-emerald-400">{growwAccount.clientId}</span></p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    {growwAccount.isConnected ? "Active & Linked" : "Disconnected"}
                  </span>
                </div>
              </div>

              {/* Capital & Margin Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0f172a] p-3.5 rounded-xl border border-[#1e293b]">
                  <span className="text-[11px] text-slate-400">Available Buying Power</span>
                  <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    ₹{growwAccount.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] text-slate-500">Instant Execution Margin</span>
                </div>
                <div className="bg-[#0f172a] p-3.5 rounded-xl border border-[#1e293b]">
                  <span className="text-[11px] text-slate-400">Realized P&L Today</span>
                  <p className={`text-xl font-bold font-mono mt-1 ${growwAccount.realizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {growwAccount.realizedPnL >= 0 ? '+' : ''}₹{growwAccount.realizedPnL?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] text-slate-500">Live Demat Ledger</span>
                </div>
              </div>

              {/* Quick Reset Capital for Practice */}
              <div className="bg-[#141e30] p-3.5 rounded-xl border border-[#22314e]">
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Paper Trading / Simulation Capital Presets:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[50000, 100000, 250000, 500000, 1000000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => handleResetCapital(amt)}
                      className="px-3 py-1 text-xs font-bold bg-[#1d2a44] hover:bg-emerald-600 hover:text-white text-slate-300 rounded-lg transition-colors border border-[#2b3e64]"
                    >
                      ₹{(amt / 1000).toFixed(0)}K
                    </button>
                  ))}
                </div>
              </div>

              {/* Disconnect or Re-sync */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateAccount({ ...growwAccount, isConnected: true });
                    setNotification("Groww Demat synced with live market ticks!");
                  }}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Re-Sync Demat Feed
                </button>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="py-2.5 px-4 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/30 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Live Groww API Credentials */}
          {activeTab === "credentials" && (
            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-300 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Groww OpenAPI authentication uses <strong>Client ID</strong>, <strong>API Key</strong>, and <strong>TOTP 2FA</strong>. Your credentials remain strictly in your browser session and are never transmitted to third parties.
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Groww Client ID</label>
                <input
                  type="text"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  placeholder="e.g. GRW-782491"
                  className="w-full bg-[#0d1322] border border-[#243350] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">API Key / App ID</label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="grw_live_xxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-[#0d1322] border border-[#243350] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">API Secret</label>
                <input
                  type="password"
                  value={formData.apiSecret}
                  onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                  placeholder="grw_sec_xxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-[#0d1322] border border-[#243350] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">TOTP 2FA Secret Key (Google Authenticator)</label>
                <input
                  type="text"
                  value={formData.totp}
                  onChange={(e) => setFormData({ ...formData, totp: e.target.value })}
                  placeholder="Base32 TOTP secret for automated token generation"
                  className="w-full bg-[#0d1322] border border-[#243350] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Execution Mode</label>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                  className="w-full bg-[#0d1322] border border-[#243350] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="SANDBOX_SYNC">Practice Mode (Groww Sandbox - Safe Live Simulator)</option>
                  <option value="LIVE_BROKER">Live Broker Execution (Groww Trading API Live)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
                >
                  Save & Connect Groww API
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Holdings */}
          {activeTab === "holdings" && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Demat Equity Assets</span>
                <span className="text-emerald-400 font-semibold font-mono">
                  Total Value: ₹{growwAccount.holdings?.reduce((sum, h) => sum + h.qty * h.ltp, 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="space-y-2">
                {growwAccount.holdings?.map((h) => {
                  const pnl = (h.ltp - h.avgPrice) * h.qty;
                  const pnlPct = ((h.ltp - h.avgPrice) / h.avgPrice) * 100;
                  return (
                    <div key={h.symbol} className="bg-[#0f172a] p-3 rounded-xl border border-[#1e293b] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white text-xs">{h.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {h.qty} shares • Avg ₹{h.avgPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xs font-bold text-white">₹{(h.qty * h.ltp).toLocaleString('en-IN')}</div>
                        <div className={`text-[11px] font-mono font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)} ({pnlPct.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
