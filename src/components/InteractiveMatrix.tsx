import React, { useState, useMemo } from 'react';
import { ComparisonCriterion } from '../types/decision';
import { Sliders, RotateCcw, Sparkles } from 'lucide-react';

interface Props {
  criteria: ComparisonCriterion[];
  options: string[];
  initialWinner: string;
}

export const InteractiveMatrix: React.FC<Props> = ({ criteria, options, initialWinner }) => {
  // Local state for weights, initialized from criteria
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    criteria.forEach((c) => {
      initial[c.name] = c.weightImportance;
    });
    return initial;
  });

  const resetWeights = () => {
    const reset: Record<string, number> = {};
    criteria.forEach((c) => {
      reset[c.name] = c.weightImportance;
    });
    setWeights(reset);
  };

  const handleWeightChange = (name: string, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Compute live weighted scores
  const calculatedScores = useMemo(() => {
    const scores: Record<string, number> = {};
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

    options.forEach((opt) => {
      let weightedSum = 0;
      criteria.forEach((c) => {
        const w = weights[c.name] ?? 1;
        const optScore = c.optionScores[opt]?.score ?? 5;
        weightedSum += optScore * w;
      });

      // Normalize to 100
      scores[opt] = totalWeight > 0 ? Math.round((weightedSum / (totalWeight * 10)) * 100) : 0;
    });

    return scores;
  }, [criteria, options, weights]);

  // Determine current live winner
  const liveWinner = useMemo(() => {
    let topOpt = options[0] || '';
    let topScore = -1;
    options.forEach((opt) => {
      if (calculatedScores[opt] > topScore) {
        topScore = calculatedScores[opt];
        topOpt = opt;
      }
    });
    return { option: topOpt, score: topScore };
  }, [calculatedScores, options]);

  const hasWinnerShifted = liveWinner.option !== initialWinner;

  return (
    <div className="space-y-6">
      {/* Intro Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
            <Sliders className="w-4 h-4 text-stone-700" />
            <span>Interactive Priority Sliders</span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Adjust the sliders below to reflect what truly matters to you today. Watch the live scores shift.
          </p>
        </div>
        <button
          onClick={resetWeights}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors w-fit"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Live Winner Banner */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          hasWinnerShifted
            ? 'bg-amber-50/70 border-amber-300 shadow-xs'
            : 'bg-stone-50 border-stone-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs">
              {hasWinnerShifted ? (
                <span className="font-semibold text-amber-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Priority Shift Detected!
                </span>
              ) : (
                <span className="text-stone-500 font-medium">Current Calculated Leader</span>
              )}
            </div>
            <div className="text-base font-semibold text-stone-900 mt-0.5">
              {liveWinner.option}
            </div>
            {hasWinnerShifted && (
              <p className="text-xs text-amber-800/90 mt-1">
                By adjusting your priorities, this option has overtaken the initial default winner ({initialWinner})!
              </p>
            )}
          </div>

          {/* Live Option Scores Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {options.map((opt) => {
              const isLead = opt === liveWinner.option;
              return (
                <div
                  key={opt}
                  className={`px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                    isLead
                      ? 'bg-stone-900 text-white font-bold shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700'
                  }`}
                >
                  <div className="text-[10px] uppercase font-sans tracking-wide opacity-80 truncate max-w-[130px]">
                    {opt}
                  </div>
                  <div className="text-sm font-semibold">{calculatedScores[opt]}/100</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Criteria Weight Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {criteria.map((c) => {
          const currentVal = weights[c.name] ?? c.weightImportance;

          return (
            <div
              key={c.name}
              className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 hover:border-stone-300 transition-colors shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-stone-900">{c.name}</span>
                  <div className="text-[11px] text-stone-400 line-clamp-1">{c.description}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-stone-800">
                    Weight: {currentVal}/5
                  </span>
                </div>
              </div>

              {/* Slider Control */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={currentVal}
                  onChange={(e) => handleWeightChange(c.name, Number(e.target.value))}
                  className="w-full accent-stone-900 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                  <span>1 (Low priority)</span>
                  <span>3 (Moderate)</span>
                  <span>5 (Crucial factor)</span>
                </div>
              </div>

              {/* Mini Option Scores on this criterion */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span>Scores on this factor:</span>
                <div className="flex items-center gap-3">
                  {options.map((opt) => (
                    <span key={opt} className="font-mono">
                      <span className="text-stone-400">{opt.slice(0, 10)}:</span>{' '}
                      <span className="font-semibold text-stone-800">
                        {c.optionScores[opt]?.score ?? '-'}/10
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
