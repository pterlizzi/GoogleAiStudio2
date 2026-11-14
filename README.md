# The Tiebreaker

## 🎯 Executive Summary
*An AI-powered decision analysis and tiebreaking engine designed to eliminate choice paralysis by transforming complex personal, financial, career, and technical dilemmas into structured pros-and-cons breakdowns, weighted multi-criteria comparison matrices, SWOT analyses, and decisive executive verdicts.*

## 🏗️ Architecture & Flow
- **Client-Side Dilemma Ingestion & Parsing:** Users enter a decision dilemma (or load curated real-world templates) in the React frontend (`src/components/DecisionForm.tsx`). A client-side natural language parser (`src/utils/optionExtractor.ts`) automatically detects and extracts candidate options from common phrasing patterns (e.g., `"vs."`, `"Should I ... or ..."`, `"Torn between ... and ..."`), with optional AI-assisted option generation via `/api/suggest-options`.
- **Server-Side AI Orchestration:** Form submissions are sent to the Express backend (`server.ts`), which securely invokes the `@google/genai` SDK using `GEMINI_API_KEY`. Requests are processed with structured JSON prompting, resilient model fallback (`gemini-3.8-flash` → `gemini-3.1-flash-lite`), and defensive JSON sanitization (`safeJsonParse`).
- **Interactive Decision Hub & Local Persistence:** The structured analysis is rendered in `src/components/DecisionHub.tsx` across six specialized decision lenses (Pros & Cons, Comparison Table, SWOT, Live Priority Sliders, Freud-Kahneman Gut Check Coin Flip, and "What-If" Scenario Stress-Tester powered by `/api/stress-test`). Past analyses are persisted locally in the browser via `localStorage` and can be exported as Markdown or printed.

## 🛠️ Tech Stack & Tooling
- **Core Language:** TypeScript (Frontend & Node.js Backend)
- **Frontend Framework & Styling:** React 19, Vite, Tailwind CSS v4, Motion (`motion/react`), Lucide Icons
- **Backend & Server Runtime:** Express, `tsx`, `dotenv`
- **AI & Orchestration:** Google Gemini API (`@google/genai` SDK) with structured JSON outputs and automatic model fallback

## 🚀 Key Features
- **Decisive Tiebreaker Verdict:** Delivers an uncompromising winning recommendation with a confidence score, deciding pivot factor, 10-10-10 time-horizon test, Bezos-style Type 1 vs. Type 2 reversibility assessment, devil's advocate critique, and a 48-hour micro-experiment.
- **Multi-Lens Evaluation Suite:**
  - **Weighted Pros & Cons:** Impact-scored (1–5) advantages and hidden costs filterable by domain category.
  - **Comparison Table:** Normalized 1–10 multi-criteria matrix with weighted importance stars and expandable dimension rationales.
  - **SWOT Analysis:** 2×2 strategic grid mapping internal Strengths & Weaknesses alongside external Opportunities & Threats per option.
- **Interactive Priority Sliders & Stress-Testing:** Dynamically adjust criterion weights (`1–5`) to watch composite scores recalculate live, test intuition with an animated coin-flip gut check, and run custom `"What-If"` shock scenarios against the leading choice.
- **Smart Option Extraction & History:** Automatically populates candidate options from dilemma titles, provides one-click dilemma templates, and stores up to 20 past analyses locally with Markdown clipboard export.

## ⚙️ Getting Started / Local Deployment
```bash
# 1. Clone the repository
git clone https://github.com/pterlizzi/the-tiebreaker.git
cd the-tiebreaker

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 4. Run the full-stack development server (Express + Vite on port 3000)
npm run dev

# 5. Build and run for production
npm run build
NODE_ENV=production npm start
```
