import React, { useState } from 'react';
import { X, Sparkles, Key, CheckCircle, AlertCircle, Eye, EyeOff, Bot, Zap, BookOpen, ExternalLink } from 'lucide-react';
import { AI_PROVIDERS, SYSTEM_PROMPT } from '../services/aiService';

export default function AIConfigModal({
  isOpen,
  onClose,
  aiConfig,
  onSaveConfig
}) {
  if (!isOpen) return null;

  const [provider, setProvider] = useState(aiConfig.provider || "groq");
  const [apiKey, setApiKey] = useState(aiConfig.apiKey || "");
  const [model, setModel] = useState(aiConfig.model || "llama-3.3-70b-versatile");
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
  const [testMessage, setTestMessage] = useState("");
  const [activeTab, setActiveTab] = useState("settings");

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    const obj = AI_PROVIDERS.find(p => p.id === newProvider);
    if (obj) {
      setModel(obj.defaultModel);
    }
  };

  const handleKeyInput = (val) => {
    setApiKey(val);
    if (val.trim().startsWith("gsk_")) {
      setProvider("groq");
      setModel("llama-3.3-70b-versatile");
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Testing Groq Llama-3.3 ultra-fast latency...');

    if (provider === 'builtin') {
      setTimeout(() => {
        setTestStatus('success');
        setTestMessage('TradeGuru Autonomous Engine Ready!');
      }, 300);
      return;
    }

    if (!apiKey.trim()) {
      setTestStatus('failed');
      setTestMessage('Pehle Groq ya OpenAI API key paste kijiye.');
      return;
    }

    try {
      const startTime = Date.now();
      const endpoint = provider === 'groq' || apiKey.startsWith('gsk_')
        ? "https://api.groq.com/openai/v1/chat/completions"
        : "https://api.openai.com/v1/chat/completions";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: model || "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: "Test ping: reply in 3 words in Hinglish" }],
          max_tokens: 20
        })
      });

      const elapsed = Date.now() - startTime;
      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content || "Connected!";
        setTestStatus('success');
        setTestMessage(`⚡ Connected! Latency: ${elapsed}ms | Reply: "${reply}"`);
      } else {
        const errorBody = await res.json().catch(() => ({}));
        setTestStatus('failed');
        setTestMessage(errorBody.error?.message || `HTTP ${res.status}: Verification failed`);
      }
    } catch (e) {
      setTestStatus('failed');
      setTestMessage(e.message || "Failed to reach provider endpoint.");
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveConfig({
      provider,
      apiKey: apiKey.trim(),
      model
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#111827] border border-[#243350] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d1322] to-[#172038] p-4 sm:p-5 border-b border-[#243350] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Groq AI Trading Setup</h3>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Hinglish Voice Coach
                </span>
              </div>
              <p className="text-xs text-slate-400">Paste your Groq Key (gsk_...) for real-time live trading guidance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#1a263e]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Groq Key Highlight Banner */}
          <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent border border-amber-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> Groq API Key (gsk_...)
              </span>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Get Free Groq Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Groq API Llama 3.3 70B model ko bijli ki speed se chalata hai. Yeh real-time me chart ke har candle ko Hinglish me bolkar samjhata hai.
            </p>
            <div className="relative pt-1">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => handleKeyInput(e.target.value)}
                placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-[#090e18] border border-[#2b3e63] rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Model and Provider Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Provider</label>
              <select
                value={provider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="w-full bg-[#0d1322] border border-[#243350] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="groq">⚡ Groq (Recommended)</option>
                <option value="builtin">TradeGuru Built-in (No Key Needed)</option>
                <option value="openai">OpenAI (GPT-4o)</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Model Name</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="llama-3.3-70b-versatile"
                className="w-full bg-[#0d1322] border border-[#243350] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Test Status Banner */}
          {testStatus && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              testStatus === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : testStatus === 'testing'
                ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
            }`}>
              {testStatus === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : testStatus === 'failed' ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              ) : (
                <span className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              )}
              <span className="truncate">{testMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="px-4 py-2.5 bg-[#1a263e] hover:bg-[#243454] text-slate-200 text-xs font-bold rounded-xl border border-[#2e4064] transition-colors"
            >
              Test API Speed
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all"
            >
              Save Groq API Setup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
