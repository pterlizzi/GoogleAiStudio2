import React, { useState } from 'react';
import { OptionProCon } from '../types/decision';
import { CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';

interface Props {
  data: OptionProCon[];
  winningOption: string;
}

export const ProsAndConsView: React.FC<Props> = ({ data, winningOption }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeOptionTab, setActiveOptionTab] = useState<string>(data[0]?.option || '');

  // Extract unique categories across all items
  const allCategories = Array.from(
    new Set(
      data.flatMap((item) => [
        ...(item.pros || []).map((p) => p.category),
        ...(item.cons || []).map((c) => c.category),
      ])
    )
  ).filter(Boolean);

  const activeOption = data.find((d) => d.option === activeOptionTab) || data[0];

  const filterItems = <T extends { category: string }>(items: T[] = []) => {
    const safeItems = items || [];
    if (selectedCategory === 'all') return safeItems;
    return safeItems.filter((item) => item.category === selectedCategory);
  };

  return (
    <div className="space-y-6">
      {/* Option Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg">
          {data.map((opt) => {
            const isWinner = opt.option === winningOption;
            const isActive = opt.option === activeOptionTab;
            return (
              <button
                key={opt.option}
                onClick={() => setActiveOptionTab(opt.option)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>{opt.option}</span>
                {isWinner && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Leading Choice" />
                )}
              </button>
            );
          })}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <span>Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-400"
          >
            <option value="all">All Categories</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Option Summary Card */}
      {activeOption && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <span>Core Trade-off Summary</span>
              <span>·</span>
              <span>{(activeOption.pros || []).length} Pros</span>
              <span>·</span>
              <span>{(activeOption.cons || []).length} Cons</span>
            </div>
            <p className="text-sm font-medium text-stone-800 italic">
              "{activeOption.summaryTakeaway}"
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-xs text-stone-400">Net Impact Score</div>
              <div
                className={`text-lg font-mono font-semibold ${
                  activeOption.netScore >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {activeOption.netScore > 0 ? `+${activeOption.netScore}` : activeOption.netScore}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pros & Cons Columns */}
      {activeOption && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pros Column */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Advantages & Upsides</span>
              </div>
              <span className="text-xs text-stone-400">
                {filterItems(activeOption.pros).length} points
              </span>
            </div>

            <div className="space-y-3">
              {filterItems(activeOption.pros).length === 0 ? (
                <p className="text-xs text-stone-400 py-4 text-center">
                  No pros found under "{selectedCategory}"
                </p>
              ) : (
                filterItems(activeOption.pros).map((pro, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100/80 hover:border-emerald-200 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-xs text-stone-800 leading-relaxed font-normal">
                        {pro.text}
                      </p>
                      <div className="flex items-center gap-1 shrink-0 text-emerald-700">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span className="text-xs font-mono font-medium">+{pro.impact}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-stone-400">
                      <span>{pro.category}</span>
                      <span>·</span>
                      <span>Impact Level {pro.impact}/5</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cons Column */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <div className="flex items-center gap-2 text-rose-800 font-semibold text-sm">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Drawbacks & Hidden Costs</span>
              </div>
              <span className="text-xs text-stone-400">
                {filterItems(activeOption.cons).length} points
              </span>
            </div>

            <div className="space-y-3">
              {filterItems(activeOption.cons).length === 0 ? (
                <p className="text-xs text-stone-400 py-4 text-center">
                  No cons found under "{selectedCategory}"
                </p>
              ) : (
                filterItems(activeOption.cons).map((con, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-rose-50/40 border border-rose-100/80 hover:border-rose-200 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-xs text-stone-800 leading-relaxed font-normal">
                        {con.text}
                      </p>
                      <div className="flex items-center gap-1 shrink-0 text-rose-700">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        <span className="text-xs font-mono font-medium">-{con.impact}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-stone-400">
                      <span>{con.category}</span>
                      <span>·</span>
                      <span>Severity {con.impact}/5</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cross-Option Summary Grid */}
      <div className="mt-8 pt-6 border-t border-stone-200">
        <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-3">
          All Options Quick Comparison
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((opt) => (
            <div
              key={opt.option}
              onClick={() => setActiveOptionTab(opt.option)}
              className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                opt.option === activeOptionTab
                  ? 'border-stone-400 bg-white shadow-xs'
                  : 'border-stone-200 bg-stone-50/50 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-stone-900 truncate">
                  {opt.option}
                </span>
                <span
                  className={`text-xs font-mono font-semibold ${
                    opt.netScore >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {opt.netScore > 0 ? `+${opt.netScore}` : opt.netScore}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 line-clamp-2">
                {opt.summaryTakeaway}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
