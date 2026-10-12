/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DecisionInput, DecisionAnalysis } from './types/decision';
import { DecisionForm } from './components/DecisionForm';
import { DecisionHub } from './components/DecisionHub';
import {
  Scale,
  History,
  Plus,
  Trash2,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Shield,
  HelpCircle,
} from 'lucide-react';

const STORAGE_KEY = 'the_tiebreaker_saved_decisions';

export default function App() {
  const [currentAnalysis, setCurrentAnalysis] = useState<DecisionAnalysis | null>(null);
  const [history, setHistory] = useState<DecisionAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to parse saved decisions:', e);
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (newAnalysis: DecisionAnalysis) => {
    setHistory((prev) => {
      const updated = [newAnalysis, ...prev.filter((item) => item.id !== newAnalysis.id)].slice(
        0,
        20
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save to localStorage:', e);
      }
      return updated;
    });
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      } catch (e) {
        console.warn('Could not update localStorage:', e);
      }
      return filtered;
    });
    if (currentAnalysis?.id === id) {
      setCurrentAnalysis(null);
    }
  };

  const handleAnalyze = async (input: DecisionInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server error while analyzing decision.');
      }

      const data = await response.json();

      const newAnalysis: DecisionAnalysis = {
        id: `decision-${Date.now()}`,
        createdAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        input,
        summary: data.summary || '',
        verdict: data.verdict,
        prosAndCons: data.prosAndCons || [],
        comparisonTable: data.comparisonTable || { criteria: [], overallScores: {} },
        swotAnalysis: data.swotAnalysis || [],
        blindSpots: data.blindSpots || [],
      };

      setCurrentAnalysis(newAnalysis);
      saveToHistory(newAnalysis);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to the analysis service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 font-sans flex flex-col antialiased selection:bg-stone-900 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div
            onClick={() => setCurrentAnalysis(null)}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-stone-800 transition-colors">
              <Scale className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base tracking-tight text-stone-900">
                  The Tiebreaker
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 hidden sm:inline">
                  Decision Engine
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block -mt-0.5">
                Pros & Cons · Comparison Matrix · SWOT Analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentAnalysis && (
              <button
                onClick={() => setCurrentAnalysis(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Dilemma</span>
              </button>
            )}

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            >
              <History className="w-3.5 h-3.5 text-stone-500" />
              <span>History</span>
              {history.length > 0 && (
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 bg-stone-300 text-stone-800 rounded-full">
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="max-w-3xl mx-auto mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-rose-500 hover:text-rose-800 font-bold p-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {currentAnalysis ? (
          <DecisionHub
            analysis={currentAnalysis}
            onReset={() => setCurrentAnalysis(null)}
          />
        ) : (
          <div className="space-y-8">
            {/* Hero Greeting & Value Prop */}
            <div className="text-center max-w-2xl mx-auto pt-4 space-y-2">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
                Make decisions without second-guessing.
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed">
                Stuck between two tough options? Lay out your dilemma. The Tiebreaker rigorously breaks down your choices across weighted pros & cons, side-by-side matrices, and SWOT analysis — then delivers an uncompromising verdict.
              </p>
            </div>

            <DecisionForm onSubmit={handleAnalyze} isLoading={isLoading} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white/60 py-6 text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-serif font-semibold text-stone-800">The Tiebreaker</span>
            <span>·</span>
            <span>Cognitive Evaluation & Decision Science</span>
          </div>
          <div className="text-[11px] text-stone-400">
            Powered by Gemini 3.8 · All data stored locally in your browser
          </div>
        </div>
      </footer>

      {/* History Drawer Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/40 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-stone-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-stone-600" />
                <h3 className="font-semibold text-stone-900 text-sm">Past Decision History</h3>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-16 space-y-2 text-stone-400">
                  <Scale className="w-8 h-8 mx-auto stroke-1" />
                  <p className="text-xs">No saved decisions yet.</p>
                  <p className="text-[11px]">Your analyzed dilemmas will appear here automatically.</p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setCurrentAnalysis(item);
                      setIsHistoryOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-stone-400 hover:shadow-xs transition-all cursor-pointer group space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] text-stone-400">
                      <span>{item.createdAt}</span>
                      <button
                        onClick={(e) => deleteHistoryItem(item.id, e)}
                        className="text-stone-300 hover:text-rose-600 transition-colors p-1"
                        title="Delete this decision"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-xs font-semibold text-stone-900 group-hover:text-stone-800 line-clamp-2">
                      {item.input.title}
                    </h4>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-amber-800 font-medium truncate max-w-[200px]">
                        Verdict: {item.verdict.winner}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Clear All Footer */}
            {history.length > 0 && (
              <div className="p-3 border-t border-stone-200 bg-stone-50 flex justify-between items-center text-xs text-stone-500">
                <span>{history.length} saved decision{history.length > 1 ? 's' : ''}</span>
                <button
                  onClick={() => {
                    if (confirm('Clear all saved decisions?')) {
                      setHistory([]);
                      localStorage.removeItem(STORAGE_KEY);
                    }
                  }}
                  className="text-rose-600 hover:text-rose-800 text-[11px] font-medium"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
