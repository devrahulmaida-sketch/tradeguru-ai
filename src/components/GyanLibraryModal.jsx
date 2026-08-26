import React, { useState } from 'react';
import { X, BookOpen, Search, CheckCircle, Sparkles, MessageSquare, Quote } from 'lucide-react';
import { BOOKS_KNOWLEDGE_BASE } from '../data/booksData';

export default function GyanLibraryModal({
  isOpen,
  onClose,
  onAskAIAboutBook
}) {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBook, setSelectedBook] = useState(BOOKS_KNOWLEDGE_BASE[0]);

  const categories = ["All", "Trading Psychology & Mindset", "Pure Price Action", "Candlestick Patterns", "Institutional Order Flow & VSA", "Modern Smart Money (SMC)"];

  const filteredBooks = BOOKS_KNOWLEDGE_BASE.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.hindiSummary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || b.category.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-[#243350] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d1322] via-[#141e33] to-[#1e1738] p-5 border-b border-[#243350] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white tracking-tight">
                  Grand Trading Gyan & Books Matrix
                </h3>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  9+ Master Books Ingrained
                </span>
              </div>
              <p className="text-xs text-slate-400">
                The institutional knowledge repository powering TradeGuru AI in real time (Mark Douglas, Al Brooks, Wyckoff, ICT)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-[#1a263e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Pills */}
        <div className="p-4 border-b border-[#1f293d] bg-[#0c1220] flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search books, author, or rules (e.g. Al Brooks, Mark Douglas, Spring)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#162033] border border-[#243350] rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-wrap gap-1 text-[11px]">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedCategory === c
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "bg-[#162033] text-slate-400 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Column: Book Cards List */}
          <div className="md:col-span-5 border-r border-[#1f293d] overflow-y-auto p-3 space-y-2 max-h-[60vh]">
            {filteredBooks.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBook(b)}
                className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                  selectedBook?.id === b.id
                    ? "bg-[#1e293b] border-amber-500/60 shadow-md"
                    : "bg-[#121927] border-[#1f2a3e] hover:bg-[#182235]"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-xs font-bold text-white leading-snug">{b.title}</h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#243350] text-slate-300 shrink-0">
                    {b.year}
                  </span>
                </div>
                <p className="text-[11px] text-amber-400 font-medium mb-1.5">{b.author}</p>
                <p className="text-[11px] text-slate-400 line-clamp-2">{b.corePhilosophy}</p>
              </div>
            ))}
          </div>

          {/* Right Column: Selected Book Deep Dive */}
          <div className="md:col-span-7 overflow-y-auto p-5 space-y-4 max-h-[60vh] bg-[#0b0f19]">
            {selectedBook && (
              <>
                <div className="flex items-start justify-between gap-3 border-b border-[#1e293b] pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {selectedBook.badge}
                    </span>
                    <h3 className="text-xl font-black text-white mt-1">{selectedBook.title}</h3>
                    <p className="text-xs text-slate-400">Author: <strong className="text-white">{selectedBook.author}</strong> ({selectedBook.category})</p>
                  </div>
                  <button
                    onClick={() => {
                      onAskAIAboutBook(selectedBook.title);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Ask AI This Setup
                  </button>
                </div>

                {/* Hindi Breakdown Quote */}
                <div className="bg-[#141b2d] p-4 rounded-xl border border-[#233150] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Quote className="w-4 h-4" /> हिंदी में मुख्य ज्ञान (Hindi Essence):
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedBook.hindiSummary}
                  </p>
                </div>

                {/* Core Philosophy */}
                <div>
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Core Institutional Edge:
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#0f172a] p-3 rounded-xl border border-[#1e293b]">
                    {selectedBook.corePhilosophy}
                  </p>
                </div>

                {/* 5 Truths or Key Concepts */}
                {selectedBook.fiveTruths && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Mark Douglas 5 Fundamental Truths:
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {selectedBook.fiveTruths.map((truth, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-[#121927] p-2 rounded-lg border border-[#1d273a]">
                          <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{truth}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedBook.keyConcepts && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Key Setups & Mechanics:
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {selectedBook.keyConcepts.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-[#121927] p-2 rounded-lg border border-[#1d273a]">
                          <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedBook.phases && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Wyckoff Market Cycle Phases:
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {selectedBook.phases.map((phase, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-[#121927] p-2 rounded-lg border border-[#1d273a]">
                          <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{phase}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Golden Rules */}
                {selectedBook.goldenRules && (
                  <div>
                    <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                      Non-Negotiable Golden Execution Rules:
                    </h5>
                    <div className="space-y-1.5">
                      {selectedBook.goldenRules.map((rule, idx) => (
                        <div key={idx} className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg text-xs text-emerald-200 font-medium">
                          ⚡ {rule}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
