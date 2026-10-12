import React, { useState } from 'react';
import { DecisionInput } from '../types/decision';
import { DECISION_TEMPLATES } from '../data/templates';
import { Plus, Trash2, Sparkles, ArrowRight, Loader2, BookmarkCheck, HelpCircle } from 'lucide-react';

interface Props {
  onSubmit: (input: DecisionInput) => void;
  isLoading: boolean;
}

export const DecisionForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [userPriorities, setUserPriorities] = useState('');
  const [category, setCategory] = useState<DecisionInput['category']>('career');
  const [urgency, setUrgency] = useState<DecisionInput['urgency']>('medium');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);

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
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-stone-700 uppercase tracking-wide">
          <BookmarkCheck className="w-4 h-4 text-stone-500" />
          <span>Or Test With a Real-World Dilemma</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DECISION_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadTemplate(tmpl)}
              className="text-left p-3 rounded-lg bg-white border border-stone-200 hover:border-stone-400 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                <span>{tmpl.tag}</span>
                <span className="font-medium text-stone-600 group-hover:text-stone-900">Load</span>
              </div>
              <p className="text-xs font-semibold text-stone-800 line-clamp-1 group-hover:text-stone-900">
                {tmpl.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-stone-900">
            What decision do you need to break?
          </label>
          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Should I accept the senior role at a Series A startup or stay at Big Tech?"
              className="w-full text-sm border border-stone-300 rounded-xl px-4 py-3 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-800 transition-all"
              required
            />
          </div>
          <p className="text-xs text-stone-500 flex items-center justify-between">
            <span>State the central dilemma or question clearly.</span>
            {title.trim().length > 5 && (
              <button
                type="button"
                onClick={handleAiSuggest}
                disabled={isSuggesting}
                className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-900 font-medium cursor-pointer"
              >
                {isSuggesting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>Auto-generate candidate options & priorities</span>
              </button>
            )}
          </p>
          {suggestError && <p className="text-xs text-rose-600">{suggestError}</p>}
        </div>

        {/* Options to compare */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-stone-900">
              The Options Under Consideration ({options.length}/5)
            </label>
            {options.length < 5 && (
              <button
                type="button"
                onClick={addOption}
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-stone-900"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Option</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 text-xs font-mono font-bold text-stone-400 text-center">
                  {String.fromCharCode(65 + idx)}
                </span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + idx)} (e.g. ${
                    idx === 0 ? 'Accept the Series A startup offer' : 'Stay at current job with annual bonus'
                  })`}
                  className="flex-1 text-xs border border-stone-200 rounded-lg px-3.5 py-2.5 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="p-2 text-stone-400 hover:text-rose-600 transition-colors"
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
            <label className="block text-xs font-semibold text-stone-800 flex items-center gap-1">
              <span>Personal Context & Dilemma Background</span>
              <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What makes this tough? Any specific numbers, timelines, or fears?"
              className="w-full text-xs border border-stone-200 rounded-lg p-3 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-800 flex items-center gap-1">
              <span>Your Values, Constraints & Priorities</span>
              <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={userPriorities}
              onChange={(e) => setUserPriorities(e.target.value)}
              rows={3}
              placeholder="e.g. Financial security is #1; learning velocity matters more than title; no weekend work."
              className="w-full text-xs border border-stone-200 rounded-lg p-3 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 resize-none"
            />
          </div>
        </div>

        {/* Category & Urgency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full text-xs border border-stone-200 rounded-lg p-2.5 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
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
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Decision Horizon
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as any)}
              className="w-full text-xs border border-stone-200 rounded-lg p-2.5 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
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
