import React, { useState, useEffect } from 'react';
import { HelpCircle, Smartphone, Sparkles, CheckCircle2, Info } from 'lucide-react';
import { GUIDE_DICTIONARY } from '../data/guideDictionary';

export default function ProHinglishTooltip({ isEnabled = true }) {
  const [activeKey, setActiveKey] = useState(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [pinnedInfo, setPinnedInfo] = useState(null);

  useEffect(() => {
    if (!isEnabled) {
      setActiveKey(null);
      return;
    }

    const handleMouseOver = (e) => {
      const target = e.target.closest('[data-guide]');
      if (target) {
        const key = target.getAttribute('data-guide');
        if (GUIDE_DICTIONARY[key]) {
          setActiveKey(key);
          setPinnedInfo(GUIDE_DICTIONARY[key]);
          setCoords({
            x: Math.min(window.innerWidth - 360, Math.max(20, e.clientX + 15)),
            y: Math.min(window.innerHeight - 260, Math.max(60, e.clientY + 15))
          });
        }
      }
    };

    const handleMouseMove = (e) => {
      if (activeKey) {
        setCoords({
          x: Math.min(window.innerWidth - 360, Math.max(20, e.clientX + 15)),
          y: Math.min(window.innerHeight - 260, Math.max(60, e.clientY + 15))
        });
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target.closest('[data-guide]');
      if (target) {
        setActiveKey(null);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [isEnabled, activeKey]);

  if (!isEnabled) return null;

  const currentData = activeKey ? GUIDE_DICTIONARY[activeKey] : null;

  return (
    <>
      {/* 1. Floating Glassmorphic Tooltip beside cursor */}
      {currentData && (
        <div
          className="fixed z-50 pointer-events-none w-80 max-w-[90vw] animate-in fade-in zoom-in-95 duration-100"
          style={{ left: `${coords.x}px`, top: `${coords.y}px` }}
        >
          <div className="bg-[#090e1b]/95 backdrop-blur-xl border border-emerald-500/50 rounded-xl p-3.5 shadow-2xl shadow-black/80 space-y-2.5 text-xs text-slate-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 border-b border-[#1b2a40] pb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-bold text-white text-xs leading-tight">{currentData.title}</h4>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                GROWW GUIDE
              </span>
            </div>

            {/* Kaam (What does it do?) */}
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                ⚙️ Yeh Kya Kaam Karta Hai?
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {currentData.kaam}
              </p>
            </div>

            {/* Real Groww Me Kaise Kaam Karta Hai */}
            <div className="bg-[#121c2e] p-2.5 rounded-lg border border-[#1e2f49] space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-emerald-400 shrink-0" />
                Real Groww Me Kaise Kaam Karta Hai?
              </span>
              <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                {currentData.growwGuide}
              </p>
            </div>

            {/* Pro Tip */}
            {currentData.proTip && (
              <div className="text-[10px] text-amber-300 flex items-start gap-1 pt-0.5">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Pro Tip:</strong> {currentData.proTip}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Persistent Bottom Beginner Guide Bar (Shows last inspected element clearly) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#070b16]/95 backdrop-blur-md border-t border-[#162338] px-3 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs select-none">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-6 h-6 rounded-md bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Info className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            {pinnedInfo ? (
              <p className="text-slate-300 text-[11px] truncate">
                <strong className="text-white">{pinnedInfo.title}:</strong> {pinnedInfo.kaam} <span className="text-emerald-400 font-semibold">• Groww: {pinnedInfo.growwGuide}</span>
              </p>
            ) : (
              <p className="text-slate-400 text-[11px]">
                💡 <strong className="text-emerald-400">Beginner Mode Active:</strong> Screen par kisi bhi button, timeframe, indicator ya balance par cursor le jayein — uska naam, kaam aur Groww me use turant Hinglish me dikhega!
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">Cursor Explainer Active</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>
    </>
  );
}
