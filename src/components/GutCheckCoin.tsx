import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCw, Heart, AlertCircle, Compass } from 'lucide-react';

interface Props {
  options: string[];
}

export const GutCheckCoin: React.FC<Props> = ({ options }) => {
  const [optionA, setOptionA] = useState<string>(options[0] || 'Option A');
  const [optionB, setOptionB] = useState<string>(options[1] || 'Option B');
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [gutVerdict, setGutVerdict] = useState<string | null>(null);

  const flipCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setResult(null);
    setGutVerdict(null);

    // Simulate 1.6s spin
    setTimeout(() => {
      const outcome = Math.random() > 0.5 ? 'heads' : 'tails';
      setResult(outcome);
      setIsFlipping(false);
    }, 1600);
  };

  const chosenOption = result === 'heads' ? optionA : optionB;

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs max-w-2xl mx-auto space-y-6">
      {/* Intro */}
      <div className="text-center space-y-1.5 pb-4 border-b border-stone-100">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
          <Compass className="w-4 h-4 text-stone-600" />
          <span>The Subconscious Gut Check</span>
        </div>
        <h3 className="text-base font-semibold text-stone-900">
          The Freud-Kahneman Coin Flip Test
        </h3>
        <p className="text-xs text-stone-500 max-w-md mx-auto">
          We don't flip a coin to let fate choose. While the coin is in the air, your brain will silently wish for one side to land. Listen to that feeling.
        </p>
      </div>

      {/* Option Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold text-stone-800">Heads (Side 1)</span>
          </div>
          <select
            value={optionA}
            onChange={(e) => setOptionA(e.target.value)}
            className="w-full text-xs font-medium text-stone-800 bg-white border border-stone-200 rounded p-1.5 focus:outline-none"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold text-stone-800">Tails (Side 2)</span>
          </div>
          <select
            value={optionB}
            onChange={(e) => setOptionB(e.target.value)}
            className="w-full text-xs font-medium text-stone-800 bg-white border border-stone-200 rounded p-1.5 focus:outline-none"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Coin Graphic & Action */}
      <div className="flex flex-col items-center justify-center py-6 space-y-5">
        <div className="w-28 h-28 flex items-center justify-center">
          <motion.div
            animate={
              isFlipping
                ? {
                    rotateY: [0, 720, 1440, 2160],
                    scale: [1, 1.25, 0.9, 1],
                  }
                : { rotateY: 0, scale: 1 }
            }
            transition={{ duration: 1.6, ease: 'easeInOut' }}
            className={`w-24 h-24 rounded-full border-4 border-amber-600 bg-linear-to-br from-amber-400 via-amber-500 to-amber-600 shadow-md flex items-center justify-center text-amber-950 font-bold select-none cursor-pointer ${
              isFlipping ? 'pointer-events-none' : ''
            }`}
            onClick={flipCoin}
          >
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider font-extrabold text-amber-900">
                {isFlipping ? '...' : result ? (result === 'heads' ? 'HEADS' : 'TAILS') : 'FLIP ME'}
              </div>
              <div className="text-[10px] text-amber-950/70 font-mono">
                {result ? (result === 'heads' ? 'SIDE 1' : 'SIDE 2') : 'TAP'}
              </div>
            </div>
          </motion.div>
        </div>

        <button
          onClick={flipCoin}
          disabled={isFlipping}
          className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isFlipping ? 'animate-spin' : ''}`} />
          <span>{isFlipping ? 'Flipping through the air...' : 'Flip The Coin'}</span>
        </button>
      </div>

      {/* Result & Emotional Reflection */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-4"
          >
            <div className="text-center space-y-1">
              <div className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                Coin Landed on: {result.toUpperCase()}
              </div>
              <div className="text-base font-bold text-stone-900">
                "{chosenOption}"
              </div>
            </div>

            <div className="bg-white/80 p-4 rounded-lg border border-amber-100 space-y-2 text-xs text-stone-700">
              <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Notice Your Instant Reaction:</span>
              </div>
              <p className="text-stone-600 leading-relaxed">
                When you saw "{chosenOption}", did you feel:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() =>
                    setGutVerdict(
                      `Relief confirms your gut preference! You genuinely want "${chosenOption}". Trust this alignment.`
                    )
                  }
                  className="p-2.5 rounded border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-900 text-left font-medium transition-colors"
                >
                  <span className="block font-bold">A) A sense of relief or excitement</span>
                  <span className="text-[11px] text-emerald-700 font-normal">
                    You secretly wanted this outcome.
                  </span>
                </button>

                <button
                  onClick={() =>
                    setGutVerdict(
                      `Hesitation or disappointment reveals the opposite! You secretly wanted "${
                        result === 'heads' ? optionB : optionA
                      }". Flip the result and go with that!`
                    )
                  }
                  className="p-2.5 rounded border border-rose-200 bg-rose-50/60 hover:bg-rose-100/60 text-rose-900 text-left font-medium transition-colors"
                >
                  <span className="block font-bold">B) Disappointment or desire to re-flip</span>
                  <span className="text-[11px] text-rose-700 font-normal">
                    Your gut rejects this option.
                  </span>
                </button>
              </div>
            </div>

            {gutVerdict && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-stone-900 text-white rounded-lg text-xs flex items-center gap-2.5 font-medium shadow-xs"
              >
                <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{gutVerdict}</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
