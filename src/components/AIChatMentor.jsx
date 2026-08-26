import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Volume2, Sparkles, AlertCircle, RefreshCw, Trash2, CheckCircle } from 'lucide-react';
import { askTradingAI } from '../services/aiService';
import { voiceCoach } from '../services/voiceCoach';

export default function AIChatMentor({
  marketContext,
  aiConfig,
  onOpenAIConfig,
  externalPrompt
}) {
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      sender: "ai",
      text: `Namaste Trader! 🙏 Main hoon aapka **TradeGuru AI Live Mentor**.\n\nMere paas duniya ki saari mahan trading books (**Mark Douglas, Al Brooks, Richard Wyckoff, Steve Nison, ICT, Alexander Elder**) ka poora gyan ingrained hai.\n\nReal-time me chart dekhkar mujhse puchiye:\n- *"Nifty me call lu ya put?"*\n- *"Al Brooks ke 20 EMA pullback setup ka kya rule hai?"*\n- *"Mera stop loss hit ho gaya, psychology kaise sambhalu?"*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle external prompt passed from Gyan Library or other components
  useEffect(() => {
    if (externalPrompt) {
      handleSendMessage(`Explain the real-time trading application of: ${externalPrompt}`);
    }
  }, [externalPrompt]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsTyping(true);

    try {
      const response = await askTradingAI({
        userMessage: userMsg.text,
        marketContext,
        config: aiConfig
      });

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);

      // Automatically speak summary if voice is enabled
      if (voiceCoach.isEnabled) {
        voiceCoach.speak(response.split('\n')[0] || response);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: `⚠️ Maaf kijiye, query process karne me dikkat aayi: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSpeak = (text) => {
    voiceCoach.speak(text, true);
  };

  const clearChat = () => {
    setMessages([
      {
        id: "cleared-1",
        sender: "ai",
        text: "Trading session chat reset. Chart is live. Ask any setup or strategy question!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const quickChips = [
    "Nifty: Call lu ya Put?",
    "Calculate My Position Size (1% Rule)",
    "Mark Douglas: Stop Loss hit hua, kya karu?",
    "Al Brooks 20 EMA Setup Explain Karo",
    "Wyckoff Spring vs Upthrust"
  ];

  return (
    <div className="bg-[#111827] border border-[#1f293d] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[580px]">
      {/* Header */}
      <div className="p-3.5 border-b border-[#1f293d] bg-[#0d1322] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0d1322]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-white">TradeGuru AI Live Mentor</h4>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                {aiConfig.provider === 'builtin' ? 'Autonomous Alpha' : aiConfig.provider.toUpperCase()}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">All Master Books Ingrained • Live Advice</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={clearChat}
            title="Clear Chat"
            className="p-1 text-slate-400 hover:text-rose-400 rounded-md hover:bg-[#1a263e] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-[#0b0f19]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-[#1f293d] border border-[#2b3b55] flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] rounded-2xl p-3 shadow-md ${
              m.sender === 'user'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none'
                : 'bg-[#151e30] border border-[#22314d] text-slate-200 rounded-bl-none'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">
                {m.text}
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                <span>{m.timestamp}</span>
                {m.sender === 'ai' && (
                  <button
                    onClick={() => handleSpeak(m.text)}
                    className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors"
                    title="Read aloud with Voice Coach"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Speak
                  </button>
                )}
              </div>
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2.5 items-center">
            <div className="w-7 h-7 rounded-lg bg-[#1f293d] flex items-center justify-center text-purple-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#151e30] border border-[#22314d] rounded-2xl px-3.5 py-2 text-slate-400 flex items-center gap-2">
              <span className="text-xs">Consulting Mark Douglas & Al Brooks...</span>
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3 py-2 bg-[#0e1422] border-t border-[#1b2538] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="whitespace-nowrap text-[10px] font-medium bg-[#162033] hover:bg-[#202e48] text-slate-300 hover:text-white px-2.5 py-1 rounded-full border border-[#243350] transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2.5 bg-[#0d1322] border-t border-[#1f293d] flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask in Hindi or English (e.g. Stop loss kahan rakhu?)..."
          className="flex-1 bg-[#162033] border border-[#243350] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isTyping}
          className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl shadow transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
