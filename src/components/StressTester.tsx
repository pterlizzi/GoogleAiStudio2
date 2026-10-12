import React, { useState } from 'react';
import { StressTestResult } from '../types/decision';
import { Zap, AlertTriangle, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

interface Props {
  decisionTitle: string;
  options: string[];
  currentWinner: string;
}

export const StressTester: React.FC<Props> = ({ decisionTitle, options, currentWinner }) => {
  const [customScenario, setCustomScenario] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StressTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const PRESET_SCENARIOS = [
    'What if economic conditions worsen and personal finances drop by 30%?',
    'What if workload/stress doubles for the first 12 months?',
    'What if I need to reverse this decision after just 6 months?',
    'What if key leadership or personal support systems change unexpectedly?',
  ];

  const runTest = async (scenarioToTest: string) => {
    if (!scenarioToTest.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/stress-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionTitle,
          options,
          currentWinner,
          scenario: scenarioToTest,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to stress-test scenario');
      }

      const data: StressTestResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong during the stress-test.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-6">
      {/* Intro */}
      <div className="border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
          <Zap className="w-4 h-4 text-amber-600" />
          <span>Scenario Stress-Tester ("What-If" Analysis)</span>
        </div>
        <p className="text-xs text-stone-500 mt-1">
          Decisions often fail when fragile assumptions break. Introduce a shock or constraint to test which option holds up best under pressure.
        </p>
      </div>

      {/* Preset shock ideas */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">
          Quick Stress-Test Scenarios:
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_SCENARIOS.map((scenario, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCustomScenario(scenario);
                runTest(scenario);
              }}
              disabled={loading}
              className="text-xs text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-lg text-left transition-colors disabled:opacity-50"
            >
              {scenario}
            </button>
          ))}
        </div>
      </div>

      {/* Custom scenario input */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-stone-700 block">
          Or Enter a Custom What-If Scenario:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customScenario}
            onChange={(e) => setCustomScenario(e.target.value)}
            placeholder="e.g. What if my partner receives a job offer in a different city?"
            className="flex-1 text-xs border border-stone-200 rounded-lg px-3 py-2 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') runTest(customScenario);
            }}
          />
          <button
            onClick={() => runTest(customScenario)}
            disabled={!customScenario.trim() || loading}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
            <span>Simulate</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Stress-Test Result Output */}
      {result && (
        <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
            <div>
              <div className="text-[11px] uppercase font-semibold text-stone-500">
                Stress-Test Scenario
              </div>
              <div className="text-sm font-semibold text-stone-900 italic">
                "{result.scenario}"
              </div>
            </div>
            <div className="bg-white px-3 py-1.5 rounded-lg border border-stone-200 text-right">
              <span className="text-[10px] text-stone-400 block uppercase">Resilient Winner</span>
              <span className="text-xs font-bold text-emerald-800">
                {result.newRecommendedOption}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <h5 className="text-xs font-semibold text-stone-700">Impact on Dilemma:</h5>
            <p className="text-xs text-stone-600 leading-relaxed">{result.impactSummary}</p>
          </div>

          {result.shiftsInAdvantage && result.shiftsInAdvantage.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Shifts in Dynamics & Vulnerabilities:</span>
              </h5>
              <ul className="space-y-1.5 text-xs text-stone-600">
                {result.shiftsInAdvantage.map((shift, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400 mt-1.5 shrink-0" />
                    <span>{shift}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-3 border-t border-stone-200">
            <div className="flex items-start gap-2 bg-emerald-50/60 border border-emerald-200/80 p-3 rounded-lg text-xs text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Contingency Armor:</span>
                <span>{result.contingencyAdvice}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
