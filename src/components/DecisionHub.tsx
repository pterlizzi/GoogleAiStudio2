import React, { useState } from 'react';
import { DecisionAnalysis } from '../types/decision';
import { ProsAndConsView } from './ProsAndConsView';
import { ComparisonTableView } from './ComparisonTableView';
import { SWOTView } from './SWOTView';
import { InteractiveMatrix } from './InteractiveMatrix';
import { GutCheckCoin } from './GutCheckCoin';
import { StressTester } from './StressTester';
import {
  Award,
  Clock,
  DoorOpen,
  AlertOctagon,
  Footprints,
  Copy,
  Check,
  ChevronLeft,
  Share2,
  FileText,
  Sliders,
  Scale,
  Table,
  Grid2X2,
  Coins,
  Zap,
} from 'lucide-react';

interface Props {
  analysis: DecisionAnalysis;
  onReset: () => void;
}

export const DecisionHub: React.FC<Props> = ({ analysis, onReset }) => {
  type TabType = 'prosCons' | 'comparison' | 'swot' | 'matrix' | 'gutCheck' | 'stressTest';
  const [activeTab, setActiveTab] = useState<TabType>('prosCons');
  const [copied, setCopied] = useState(false);

  const { verdict, input, prosAndCons, comparisonTable, swotAnalysis, blindSpots } = analysis;

  const tenTenTen = verdict?.tenTenTen || {
    tenMinutes: 'Initial emotional reaction settles.',
    tenMonths: 'Progress and compounding results become clear.',
    tenYears: 'Valuable milestone and learning experience in hindsight.',
  };

  const reversibility = verdict?.reversibility || {
    doorType: 'Type 2 (Two-Way Door)',
    explanation: 'This decision can be adjusted or pivoted if outcomes deviate from expectations.',
    fallbackSafetyNet: 'Re-evaluate at 90-day milestone and pivot if needed.',
  };

  const handleCopyMarkdown = () => {
    const md = `# The Tiebreaker: ${input.title}
**Verdict Winner:** ${verdict.winner} (${verdict.confidenceScore}% confidence)
**Core Rationale:** ${verdict.rationale}
**Key Differentiator:** ${verdict.keyDifferentiator}

## 10-10-10 Test
- In 10 Minutes: ${tenTenTen.tenMinutes}
- In 10 Months: ${tenTenTen.tenMonths}
- In 10 Years: ${tenTenTen.tenYears}

## Reversibility (${reversibility.doorType})
${reversibility.explanation}
**Safety Net:** ${reversibility.fallbackSafetyNet}

## Devil's Advocate Critique
${verdict.devilsAdvocate}

## Next 48-Hour Action
${verdict.immediateNextStep}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>New Decision / Back to Inputs</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:border-stone-400 rounded-lg transition-all"
            title="Copy structured summary to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Summary!' : 'Copy Summary'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:border-stone-400 rounded-lg transition-all hidden sm:inline-flex"
            title="Print decision document"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Decision Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-stone-400 font-mono">
          <span>DECISION ANALYSIS</span>
          <span>·</span>
          <span>{analysis.createdAt}</span>
          {input.category && (
            <>
              <span>·</span>
              <span className="uppercase text-stone-500 font-sans font-medium">{input.category}</span>
            </>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
          {input.title}
        </h1>
        {input.description && (
          <p className="text-sm text-stone-600 leading-relaxed max-w-3xl">
            {input.description}
          </p>
        )}
      </div>

      {/* HERO VERDICT CARD */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 shadow-md space-y-6 border border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-wider mb-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>THE TIEBREAKER VERDICT</span>
            </div>
            <div className="text-xs text-stone-400">Winning Recommendation:</div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              {verdict.winner}
            </h2>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0 bg-stone-800/80 px-4 py-2.5 rounded-xl border border-stone-700/60">
            <span className="text-[11px] text-stone-400">Decision Confidence</span>
            <span className="text-xl font-mono font-bold text-emerald-400">
              {verdict.confidenceScore}%
            </span>
          </div>
        </div>

        {/* Headline & Core Rationale */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-amber-200">
            "{verdict.headline}"
          </h3>
          <p className="text-sm text-stone-300 leading-relaxed">
            {verdict.rationale}
          </p>
        </div>

        {/* Pivot Point */}
        <div className="bg-stone-800/60 border border-stone-700/80 rounded-xl p-4 text-xs space-y-1">
          <span className="text-stone-400 font-semibold block uppercase tracking-wide text-[10px]">
            The Deciding Pivot Factor
          </span>
          <p className="text-stone-200 leading-relaxed font-medium">
            {verdict.keyDifferentiator}
          </p>
        </div>

        {/* 10-10-10 & Reversibility Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* 10-10-10 Rule */}
          <div className="bg-stone-800/40 border border-stone-700/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-300 uppercase tracking-wide">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>The 10-10-10 Perspective</span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-stone-400 font-medium">In 10 Minutes: </span>
                <span className="text-stone-300">{tenTenTen.tenMinutes}</span>
              </div>
              <div>
                <span className="text-stone-400 font-medium">In 10 Months: </span>
                <span className="text-stone-300">{tenTenTen.tenMonths}</span>
              </div>
              <div>
                <span className="text-stone-400 font-medium">In 10 Years: </span>
                <span className="text-stone-300">{tenTenTen.tenYears}</span>
              </div>
            </div>
          </div>

          {/* Reversibility Door */}
          <div className="bg-stone-800/40 border border-stone-700/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-300 uppercase tracking-wide">
              <DoorOpen className="w-3.5 h-3.5 text-stone-400" />
              <span>Door Test: {reversibility.doorType}</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {reversibility.explanation}
            </p>
            <div className="pt-2 border-t border-stone-700/60 text-xs">
              <span className="text-stone-400 font-medium">Fallback Safety Net: </span>
              <span className="text-stone-300">{reversibility.fallbackSafetyNet}</span>
            </div>
          </div>
        </div>

        {/* Devil's Advocate & 48-Hour Action */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-800">
          <div className="flex items-start gap-3 bg-rose-950/20 border border-rose-900/30 p-3.5 rounded-xl">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-semibold text-rose-300 uppercase tracking-wide text-[10px] block">
                Devil's Advocate Challenge
              </span>
              <p className="text-rose-200/90 leading-relaxed">
                {verdict.devilsAdvocate}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-emerald-950/20 border border-emerald-900/30 p-3.5 rounded-xl">
            <Footprints className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-semibold text-emerald-300 uppercase tracking-wide text-[10px] block">
                48-Hour Micro Experiment
              </span>
              <p className="text-emerald-200/90 leading-relaxed">
                {verdict.immediateNextStep}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* LENSES & TOOLS NAVIGATION BAR */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Evaluation Lenses & Decision Tools
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('prosCons')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'prosCons'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Pros & Cons List</span>
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'comparison'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Comparison Table</span>
          </button>

          <button
            onClick={() => setActiveTab('swot')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'swot'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Grid2X2 className="w-3.5 h-3.5" />
            <span>SWOT Analysis</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'matrix'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Priority Sliders</span>
          </button>

          <button
            onClick={() => setActiveTab('gutCheck')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'gutCheck'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Gut Check (Coin Flip)</span>
          </button>

          <button
            onClick={() => setActiveTab('stressTest')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'stressTest'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Stress-Tester</span>
          </button>
        </div>
      </div>

      {/* ACTIVE TAB CONTENT */}
      <div className="pt-2">
        {activeTab === 'prosCons' && (
          <ProsAndConsView data={prosAndCons} winningOption={verdict.winner} />
        )}

        {activeTab === 'comparison' && (
          <ComparisonTableView
            criteria={comparisonTable.criteria}
            overallScores={comparisonTable.overallScores}
            options={input.options}
            winningOption={verdict.winner}
          />
        )}

        {activeTab === 'swot' && (
          <SWOTView data={swotAnalysis} winningOption={verdict.winner} />
        )}

        {activeTab === 'matrix' && (
          <InteractiveMatrix
            criteria={comparisonTable.criteria}
            options={input.options}
            initialWinner={verdict.winner}
          />
        )}

        {activeTab === 'gutCheck' && (
          <GutCheckCoin options={input.options} />
        )}

        {activeTab === 'stressTest' && (
          <StressTester
            decisionTitle={input.title}
            options={input.options}
            currentWinner={verdict.winner}
          />
        )}
      </div>

      {/* COGNITIVE BLIND SPOTS CARD */}
      {blindSpots && blindSpots.length > 0 && (
        <div className="mt-10 p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-800 uppercase tracking-wide">
            <AlertOctagon className="w-4 h-4 text-stone-600" />
            <span>Unseen Blind Spots & Cognitive Biases</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {blindSpots.map((spot, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-lg border border-stone-200 text-xs text-stone-700 leading-relaxed shadow-2xs">
                <span className="font-mono text-[10px] text-stone-400 block mb-1">BIAS WARNING 0{idx + 1}</span>
                {spot}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
