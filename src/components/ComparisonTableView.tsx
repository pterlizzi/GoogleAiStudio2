import React, { useState } from 'react';
import { ComparisonCriterion } from '../types/decision';
import { Award, ChevronDown, ChevronUp, Star } from 'lucide-react';

interface Props {
  criteria: ComparisonCriterion[];
  overallScores: Record<string, number>;
  options: string[];
  winningOption: string;
}

export const ComparisonTableView: React.FC<Props> = ({
  criteria,
  overallScores,
  options,
  winningOption,
}) => {
  const [expandedCriterion, setExpandedCriterion] = useState<string | null>(null);

  const toggleExpand = (name: string) => {
    setExpandedCriterion(expandedCriterion === name ? null : name);
  };

  return (
    <div className="space-y-6">
      {/* Table Header Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500 pb-2 border-b border-stone-200">
        <div>
          <span>Multi-Criteria Matrix</span>
          <span className="mx-2">·</span>
          <span>Normalized on 1–10 Scale</span>
          <span className="mx-2">·</span>
          <span>Click any row to reveal detailed reasoning</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Dimension Winner Highlighted</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto border border-stone-200 rounded-xl bg-white shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-600 text-xs font-semibold">
              <th className="py-3.5 px-4 min-w-[200px]">Evaluation Dimension</th>
              <th className="py-3.5 px-3 w-24 text-center">Weight</th>
              {options.map((opt) => {
                const isOverallWinner = opt === winningOption;
                return (
                  <th
                    key={opt}
                    className={`py-3.5 px-4 min-w-[180px] ${
                      isOverallWinner ? 'bg-amber-50/50 text-stone-900 font-bold' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="truncate">{opt}</span>
                      {isOverallWinner && (
                        <span title="Tiebreaker Winner" className="inline-flex">
                          <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-xs">
            {criteria.map((crit) => {
              const isExpanded = expandedCriterion === crit.name;

              return (
                <React.Fragment key={crit.name}>
                  <tr
                    onClick={() => toggleExpand(crit.name)}
                    className="hover:bg-stone-50/60 cursor-pointer transition-colors group"
                  >
                    {/* Dimension Name */}
                    <td className="py-3 px-4 font-medium text-stone-800">
                      <div className="flex items-center gap-2">
                        <span>{crit.name}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600" />
                        )}
                      </div>
                      <div className="text-[11px] text-stone-400 font-normal line-clamp-1 mt-0.5">
                        {crit.description}
                      </div>
                    </td>

                    {/* Weight Stars */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-0.5 text-stone-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < crit.weightImportance
                                ? 'text-stone-700 fill-stone-700'
                                : 'text-stone-200 fill-stone-100'
                            }`}
                          />
                        ))}
                      </div>
                    </td>

                    {/* Scores per Option */}
                    {options.map((opt) => {
                      const scoreData = crit.optionScores[opt];
                      const score = scoreData ? scoreData.score : 0;
                      const isCriterionWinner = crit.winner === opt;

                      return (
                        <td
                          key={opt}
                          className={`py-3 px-4 ${
                            isCriterionWinner
                              ? 'bg-amber-50/30 font-semibold text-stone-900'
                              : 'text-stone-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">{score}/10</span>
                              {isCriterionWinner && (
                                <span className="text-[10px] text-amber-700 font-medium">
                                  Top
                                </span>
                              )}
                            </div>
                            {/* Visual Progress Bar */}
                            <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden hidden sm:block">
                              <div
                                className={`h-full rounded-full ${
                                  isCriterionWinner ? 'bg-amber-500' : 'bg-stone-400'
                                }`}
                                style={{ width: `${score * 10}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Expanded Row Explaining Rationale */}
                  {isExpanded && (
                    <tr className="bg-stone-50/80">
                      <td colSpan={2 + options.length} className="py-3 px-4">
                        <div className="p-3 bg-white border border-stone-200 rounded-lg text-xs space-y-2">
                          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">
                            Dimension Analysis: {crit.name}
                          </div>
                          <p className="text-stone-600 mb-3">{crit.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-stone-100">
                            {options.map((opt) => {
                              const scoreData = crit.optionScores[opt];
                              return (
                                <div key={opt} className="bg-stone-50 p-2.5 rounded-md">
                                  <div className="font-medium text-stone-800 text-[11px] mb-1">
                                    {opt}: {scoreData?.score ?? '-'}/10
                                  </div>
                                  <p className="text-stone-600 text-[11px] leading-relaxed">
                                    {scoreData?.comment || 'No specific comment'}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {/* Total / Overall Scores Row */}
            <tr className="bg-stone-100/70 font-semibold text-stone-900 border-t-2 border-stone-200">
              <td className="py-4 px-4 text-xs font-bold uppercase tracking-wider">
                Overall AI Composite Score
              </td>
              <td className="py-4 px-3 text-center text-stone-400 text-xs">Composite</td>
              {options.map((opt) => {
                const total = overallScores[opt] || 0;
                const isOverallWinner = opt === winningOption;

                return (
                  <td
                    key={opt}
                    className={`py-4 px-4 font-mono text-sm ${
                      isOverallWinner
                        ? 'bg-amber-100/60 text-amber-950 font-bold'
                        : 'text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{total}</span>
                      <span className="text-[11px] font-normal text-stone-400">/100</span>
                      {isOverallWinner && (
                        <span className="ml-1 text-[11px] font-semibold text-amber-800">
                          Winner
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
