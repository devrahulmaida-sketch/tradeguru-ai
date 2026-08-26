import React, { useState } from 'react';
import { X, Sparkles, Key, CheckCircle, AlertCircle, Eye, EyeOff, Bot, Zap, BookOpen } from 'lucide-react';
import { AI_PROVIDERS, SYSTEM_PROMPT } from '../services/aiService';

export default function AIConfigModal({
  isOpen,
  onClose,
  aiConfig,
  onSaveConfig
}) {
  if (!isOpen) return null;

  const [provider, setProvider] = useState(aiConfig.provider || "builtin");
  const [apiKey, setApiKey] = useState(aiConfig.apiKey || "");
  const [model, setModel] = useState(aiConfig.model || "llama-3.3-70b-versatile");
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // 'testing' | 'success' | 'failed'
  const [testMessage, setTestMessage] = useState("");
  const [activeTab, setActiveTab] = useState("settings"); // "settings" | "prompt"

  const selectedProviderObj = AI_PROVIDERS.find(p => p.id === provider) || AI_PROVIDERS[0];

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    const obj = AI_PROVIDERS.find(p => p.id === newProvider);
    if (obj) {
      setModel(obj.defaultModel);
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Testing API response & latency...');

    if (provider === 'builtin') {
      setTimeout(() => {
        setTestStatus('success');
        setTestMessage('Autonomous TradeGuru Engine active! Instant zero-latency responses.');
      }, 400);
      return;
    }

    if (!apiKey) {
      setTestStatus('failed');
      setTestMessage('Please enter an API key first.');
      return;
    }

    try {
      const startTime = Date.now();
      let res;
      if (provider === 'groq') {
        res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey.trim()}`
          },
          body: JSON.stringify({
            model: model || "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: "ping" }],
            max_tokens: 5
          })
        });
      } else if (provider === 'openai') {
        res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey.trim()}`
          },
          body: JSON.stringify({
            model: model || "gpt-4o-mini",
            messages: [{ role: "user", content: "ping" }],
            max_tokens: 5
          })
        });
      } else if (provider === 'gemini') {
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey.trim()}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "ping" }] }]
          })
        });
      }

      const elapsed = Date.now() - startTime;
      if (res && res.ok) {
        setTestStatus('success');
        setTestMessage(`Connected successfully! Latency: ${elapsed}ms`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-[#243350] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d1322] to-[#131d31] p-5 border-b border-[#243350] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">AI Trading Brain Setup</h3>
                <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-500/30">
                  Custom LLM & Books Matrix
                </span>
              </div>
              <p className="text-xs text-slate-400">Connect your OpenAI, Groq, or Claude API or use the Built-in Coach</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#1a263e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#1f293d] bg-[#0c1220] px-4">
          <button
            onClick={() => setActiveTab("settings")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "settings"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> API Configuration
          </button>
          <button
            onClick={() => setActiveTab("prompt")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "prompt"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Ingrained Books Prompt
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
          {activeTab === "settings" ? (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Provider Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Select AI Provider
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AI_PROVIDERS.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => handleProviderChange(p.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        provider === p.id
                          ? "bg-purple-500/15 border-purple-500 text-white shadow-md"
                          : "bg-[#0f172a] border-[#1e293b] text-slate-400 hover:bg-[#162033]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{p.name.split('(')[0]}</span>
                        {p.free && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                            Ready
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 truncate">
                        {p.free ? "Autonomous client reasoning" : "Bring Your Own Key (BYOK)"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key (if not builtin) */}
              {provider !== 'builtin' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      {selectedProviderObj.name.split('(')[0]} API Key
                    </label>
                    <span className="text-[11px] text-slate-500">Stored safely in browser</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={`Paste your ${provider.toUpperCase()} API Key`}
                      className="w-full bg-[#0d1322] border border-[#243350] rounded-xl px-3.5 py-2.5 pr-10 text-sm text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Model Choice */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Selected Model
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Model name"
                  className="w-full bg-[#0d1322] border border-[#243350] rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-purple-500"
                />
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
                  {testMessage}
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
                  Test Connection
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 transition-all"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                This comprehensive master system prompt is delivered to the AI model so it thinks, reasons, and speaks like an institutional mentor trained on the greatest trading books:
              </p>
              <pre className="p-3 bg-[#0d1322] border border-[#1e293b] rounded-xl text-[11px] font-mono text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                {SYSTEM_PROMPT}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
