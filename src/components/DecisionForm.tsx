import React, { useState } from 'react';
import { DecisionInput } from '../types/decision';
import { DECISION_TEMPLATES } from '../data/templates';
import { extractOptionsFromDilemma } from '../utils/optionExtractor';
import { Plus, Trash2, Sparkles, ArrowRight, Loader2, BookmarkCheck, CheckCircle2, RotateCcw } from 'lucide-react';

interface Props {
  onSubmit: (input: DecisionInput) => void;
  isLoading: boolean;
}

export const DecisionForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [autoDetectedOptions, setAutoDetectedOptions] = useState<string[] | null>(null);
  const [userPriorities, setUserPriorities] = useState('');
  const [category, setCategory] = useState<DecisionInput['category']>('career');
  const [urgency, setUrgency] = useState<DecisionInput['urgency']>('medium');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const detected = extractOptionsFromDilemma(val);
    if (detected && detected.length >= 2) {
      setAutoDetectedOptions(detected);
      setOptions(detected);
    } else {
      setAutoDetectedOptions(null);
    }
  };

  const handleTitleBlur = () => {
    if (!autoDetectedOptions && title.trim().length >= 4) {
      const detected = extractOptionsFromDilemma(title);
      if (detected && detected.length >= 2) {
        setAutoDetectedOptions(detected);
        setOptions(detected);
      }
    }
  };

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const loadTemplate = (tmpl: typeof DECISION_TEMPLATES[0]) => {
    setTitle(tmpl.title);
    setDescription(tmpl.description || '');
    setOptions([...tmpl.options]);
    setUserPriorities(tmpl.userPriorities || '');
    setCategory(tmpl.category);
    setUrgency(tmpl.urgency);
    setAutoDetectedOptions(null);
  };

  const handleAiSuggest = async () => {
    if (!title.trim()) {
      setSuggestError('Please enter a decision question first.');
      return;
    }
    setIsSuggesting(true);
    setSuggestError(null);

    try {
      const res = await fetch('/api/suggest-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dilemma: title }),
      });
      if (!res.ok) throw new Error('Failed to generate suggestions');
      const data = await res.json();
      if (data.suggestedOptions && Array.isArray(data.suggestedOptions)) {
        setOptions(data.suggestedOptions);
        setAutoDetectedOptions(data.suggestedOptions);
      }
      if (data.suggestedPriorities && !userPriorities) {
        setUserPriorities(data.suggestedPriorities);
      }
    } catch (err: any) {
      setSuggestError(err?.message || 'Could not generate suggestions.');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!title.trim()) return;
    if (cleanOptions.length < 2) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      options: cleanOptions,
      userPriorities: userPriorities.trim(),
      category,
      urgency,
    });
  };

  const canSubmit = title.trim().length > 3 && options.filter((o) => o.trim().length > 0).length >= 2;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Template Quick Starts */}
      <div className="bg-[#6f9cd9] border border-stone-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-900 uppercase tracking-wide">
          <BookmarkCheck className="w-4 h-4 text-slate-900" />
          <span>Or Test With a Real-World Dilemma</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DECISION_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadTemplate(tmpl)}
              className="text-left p-3 rounded-lg bg-white/95 border border-stone-200 hover:border-stone-400 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                <span>{tmpl.tag}</span>
                <span className="font-semibold text-stone-700 group-hover:text-stone-900">Load</span>
              </div>
              <p className="text-xs font-semibold text-stone-800 line-clamp-1 group-hover:text-stone-900">
                {tmpl.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="bg-[#6f9cd9] border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-900">
            What decision do you need to break?
          </label>
          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="e.g. Accept Early-Stage Startup Offer vs. Stay at Established Tech Giant"
              className="w-full text-sm border border-stone-300 rounded-xl px-4 py-3 bg-white text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-800 transition-all shadow-xs"
              required
            />
          </div>

          {/* Auto-detected recognition feedback */}
          {autoDetectedOptions && autoDetectedOptions.length >= 2 && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/95 border border-emerald-300 text-xs text-stone-900 shadow-xs animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong className="text-emerald-950 font-bold">
                    Recognized {autoDetectedOptions.length} options:
                  </strong>{' '}
                  Automatically populated into Option A & B below!
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAutoDetectedOptions(null);
                  setOptions(['', '']);
                }}
                className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 underline shrink-0 cursor-pointer"
                title="Clear auto-filled options to enter custom text"
              >
                Clear / Custom
              </button>
            </div>
          )}

          <p className="text-xs text-slate-900/90 font-medium flex items-center justify-between">
            <span>Type options directly (e.g. "Option A vs. Option B" or "Should I do X or Y?").</span>
            {title.trim().length > 5 && (
              <button
                type="button"
                onClick={handleAiSuggest}
                disabled={isSuggesting}
                className="inline-flex items-center gap-1.5 text-slate-950 hover:text-black font-semibold cursor-pointer underline sm:no-underline"
              >
                {isSuggesting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-900" />
                )}
                <span>Auto-generate candidate options & priorities</span>
              </button>
            )}
          </p>
          {suggestError && <p className="text-xs text-rose-800 font-semibold bg-white/80 p-2 rounded">{suggestError}</p>}
        </div>

        {/* Options to compare */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <label className="block text-sm font-bold text-slate-900">
                The Options Under Consideration ({options.length}/5)
              </label>
              {autoDetectedOptions && (
                <span className="text-[11px] font-bold bg-white text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
                  Auto-populated from dilemma
                </span>
              )}
            </div>
            {options.length < 5 && (
              <button
                type="button"
                onClick={addOption}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-950 hover:text-black"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Option</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 text-xs font-mono font-bold text-slate-900 bg-white/70 py-1.5 rounded-md text-center shadow-2xs">
                  {String.fromCharCode(65 + idx)}
                </span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + idx)} (e.g. ${
                    idx === 0 ? 'Accept the Series A startup offer' : 'Stay at current job with annual bonus'
                  })`}
                  className="flex-1 text-xs border border-stone-200 rounded-lg px-3.5 py-2.5 bg-white text-stone-900 shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/20"
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="p-2 text-slate-800 hover:text-rose-700 bg-white/60 hover:bg-white rounded-md transition-colors shadow-2xs"
                    title="Remove this option"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Optional Context & Priorities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-900 flex items-center gap-1">
              <span>Personal Context & Dilemma Background</span>
              <span className="text-slate-700 font-normal">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What makes this tough? Any specific numbers, timelines, or fears?"
              className="w-full text-xs border border-stone-200 rounded-lg p-3 bg-white text-stone-900 shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/20 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-900 flex items-center gap-1">
              <span>Your Values, Constraints & Priorities</span>
              <span className="text-slate-700 font-normal">(Optional)</span>
            </label>
            <textarea
              value={userPriorities}
              onChange={(e) => setUserPriorities(e.target.value)}
              rows={3}
              placeholder="e.g. Financial security is #1; learning velocity matters more than title; no weekend work."
              className="w-full text-xs border border-stone-200 rounded-lg p-3 bg-white text-stone-900 shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/20 resize-none"
            />
          </div>
        </div>

        {/* Category & Urgency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/40">
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full text-xs border border-stone-200 rounded-lg p-2.5 bg-white text-stone-900 shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/20"
            >
              <option value="career">Career & Professional</option>
              <option value="finance">Financial & Investments</option>
              <option value="tech">Tech Architecture & Engineering</option>
              <option value="lifestyle">Lifestyle & Relocation</option>
              <option value="business">Business Strategy</option>
              <option value="other">Personal & Relationships</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5">
              Decision Horizon
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as any)}
              className="w-full text-xs border border-stone-200 rounded-lg p-2.5 bg-white text-stone-900 shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/20"
            >
              <option value="high">Urgent (Need answer in 24–72 hours)</option>
              <option value="medium">Standard (Evaluating this week/month)</option>
              <option value="low">Long-range (Strategic exploration)</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!canSubmit || isLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Pros & Cons, SWOT & Tiebreaker Ruling...</span>
              </>
            ) : (
              <>
                <span>Break The Tie</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
