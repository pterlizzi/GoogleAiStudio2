import React, { useState } from 'react';
import { OptionSWOT } from '../types/decision';
import { ShieldCheck, AlertTriangle, Sparkles, Flame } from 'lucide-react';

interface Props {
  data: OptionSWOT[];
  winningOption: string;
}

export const SWOTView: React.FC<Props> = ({ data, winningOption }) => {
  const [activeOptionTab, setActiveOptionTab] = useState<string>(data[0]?.option || '');

  const activeSWOT = data.find((d) => d.option === activeOptionTab) || data[0];

  return (
    <div className="space-y-6">
      {/* Option Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg">
          {data.map((item) => {
            const isWinner = item.option === winningOption;
            const isActive = item.option === activeOptionTab;

            return (
              <button
                key={item.option}
                onClick={() => setActiveOptionTab(item.option)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>{item.option}</span>
                {isWinner && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Tiebreaker Winner" />
                )}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-stone-500">
          <span>Strategic 2x2 Matrix</span>
          <span className="mx-2">·</span>
          <span>Internal vs. External Drivers</span>
        </div>
      </div>

      {activeSWOT && (
        <div className="space-y-6">
          <div className="text-xs text-stone-600 font-medium">
            Strategic Landscape for: <span className="font-bold text-stone-900">{activeSWOT.option}</span>
          </div>

          {/* 4 Quadrants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* STRENGTHS */}
            <div className="bg-white border border-emerald-200/80 rounded-xl p-5 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 opacity-50" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs tracking-wide uppercase">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Strengths</span>
                  </div>
                  <span className="text-[11px] text-stone-400">Internal · Advantage</span>
                </div>
                <ul className="space-y-2.5">
                  {(activeSWOT.strengths || []).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* WEAKNESSES */}
            <div className="bg-white border border-rose-200/80 rounded-xl p-5 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-0 opacity-50" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-100">
                  <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs tracking-wide uppercase">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Weaknesses</span>
                  </div>
                  <span className="text-[11px] text-stone-400">Internal · Limitation</span>
                </div>
                <ul className="space-y-2.5">
                  {(activeSWOT.weaknesses || []).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* OPPORTUNITIES */}
            <div className="bg-white border border-sky-200/80 rounded-xl p-5 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-bl-full -z-0 opacity-50" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-sky-100">
                  <div className="flex items-center gap-2 text-sky-800 font-semibold text-xs tracking-wide uppercase">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span>Opportunities</span>
                  </div>
                  <span className="text-[11px] text-stone-400">External · Potential</span>
                </div>
                <ul className="space-y-2.5">
                  {(activeSWOT.opportunities || []).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* THREATS */}
            <div className="bg-white border border-amber-200/80 rounded-xl p-5 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-0 opacity-50" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-100">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs tracking-wide uppercase">
                    <Flame className="w-4 h-4 text-amber-600" />
                    <span>Threats</span>
                  </div>
                  <span className="text-[11px] text-stone-400">External · Vulnerability</span>
                </div>
                <ul className="space-y-2.5">
                  {(activeSWOT.threats || []).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
