import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

async function generateWithFallback(prompt: string, jsonMode = true): Promise<string> {
  const ai = getAiClient();
  const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: jsonMode
          ? {
              responseMimeType: 'application/json',
              temperature: 0.7,
            }
          : {
              temperature: 0.7,
            },
      });

      if (response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} failed:`, err?.message || err);
      // If it's the last model, throw
      if (i === models.length - 1) {
        throw err;
      }
      // Wait 500ms before trying fallback model
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  throw new Error('All model attempts failed.');
}

// API: Analyze Decision with Pros/Cons, Comparison Matrix, SWOT, & Tiebreaker Verdict
app.post('/api/analyze-decision', async (req, res) => {
  try {
    const { title, description, options, userPriorities, category } = req.body;

    if (!title || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        error: 'Please provide a decision title and at least two options to compare.',
      });
    }

    const ai = getAiClient();

    const prompt = `You are "The Tiebreaker", an elite decision strategist, executive advisor, and cognitive scientist.
Your role is to help a person make a high-stakes, clear-headed choice between options without fence-sitting, bias, or hand-waving.

THE DECISION DILEMMA:
Title: "${title}"
${description ? `Context/Details: "${description}"` : ''}
${userPriorities ? `User's Priorities, Values & Constraints: "${userPriorities}"` : ''}
${category ? `Category: "${category}"` : ''}

OPTIONS TO EVALUATE:
${options.map((opt: string, i: number) => `${i + 1}. ${opt}`).join('\n')}

Perform an exhaustive, multi-lens analysis and return a single valid JSON object adhering EXACTLY to this structure:
{
  "summary": "Crisp 1-2 sentence executive framing of the core tension/trade-off.",
  "verdict": {
    "winner": "Exact name of the best option among the provided options",
    "confidenceScore": 85, // integer 60-95 based on clarity of the winner given constraints
    "headline": "A punchy, memorable verdict headline (e.g., 'Optimize for Compounding Autonomy Over Short-Term Comfort')",
    "rationale": "Direct, empathetic, uncompromising reason why this option wins the tiebreak. No fence-sitting.",
    "keyDifferentiator": "The single deciding factor or pivot point that separates the winner from the runner-up.",
    "devilsAdvocate": "The sharpest, most uncomfortable critique of the winning option — the blind spot or risk the user must stay vigilant about.",
    "tenTenTen": {
      "tenMinutes": "How will you feel 10 minutes after choosing this? (initial emotional relief / discomfort)",
      "tenMonths": "Where will you be 10 months after? (the grind, compounding gains, or adjustment)",
      "tenYears": "How will this look in 10 years? (the long-term trajectory and regret minimization)"
    },
    "reversibility": {
      "doorType": "Type 1 (One-Way Door)" or "Type 2 (Two-Way Door)",
      "explanation": "Why this is or isn't easily reversible, and the true cost of backtracking.",
      "fallbackSafetyNet": "Specific tripwire or fallback plan if circumstances change."
    },
    "immediateNextStep": "A concrete micro-action or low-risk experiment the user can take within 48 hours to validate or commit."
  },
  "prosAndCons": [
    // For each option provided in the options list:
    {
      "option": "Exact option name",
      "pros": [
        { "text": "Specific pro", "impact": 4, "category": "Career" | "Financial" | "Health/Wellbeing" | "Time/Effort" | "Risk" | "Growth" | "Relationships" | "Strategic" }
      ],
      "cons": [
        { "text": "Specific con", "impact": 3, "category": "Career" | "Financial" | "Health/Wellbeing" | "Time/Effort" | "Risk" | "Growth" | "Relationships" | "Strategic" }
      ],
      "netScore": 8, // calculated numeric advantage
      "summaryTakeaway": "One-line distillation of this option's core bargain."
    }
  ],
  "comparisonTable": {
    "criteria": [
      // 4 to 6 relevant comparison criteria (e.g. Financial Return, Work-Life Balance, Growth Curve, Downside Risk, Execution Complexity, Personal Freedom)
      {
        "name": "Criterion Name",
        "weightImportance": 5, // 1 to 5
        "description": "Why this matters in this decision",
        "optionScores": {
          // Keyed by each option name: score 1 to 10 and a concise comment explaining why
          "Option Name": { "score": 8, "comment": "Brief rationale" }
        },
        "winner": "Option name that wins on this criterion"
      }
    ],
    "overallScores": {
      // Keyed by each option name: weighted sum or overall rating out of 100
      "Option Name": 84
    }
  },
  "swotAnalysis": [
    // For each option:
    {
      "option": "Exact option name",
      "strengths": ["3-4 distinct internal strengths"],
      "weaknesses": ["3-4 distinct internal weaknesses"],
      "opportunities": ["3-4 external future opportunities"],
      "threats": ["3-4 external threats or downside scenarios"]
    }
  ],
  "blindSpots": [
    "3 non-obvious factors, psychological biases, or hidden costs the decision-maker may be ignoring."
  ]
}

Provide highly thoughtful, non-generic, domain-specific insights. Respond with ONLY the raw JSON object. Do not wrap in markdown quotes if possible, or use standard json.`;

    const responseText = await generateWithFallback(prompt, true);
    let parsedData;
    try {
      parsedData = JSON.parse(responseText.trim());
    } catch {
      // Clean possible markdown code fences if returned
      const cleaned = responseText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error generating decision analysis:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to analyze decision. Please try again.',
    });
  }
});

// API: Stress Test Decision ("What-If" scenario)
app.post('/api/stress-test', async (req, res) => {
  try {
    const { decisionTitle, options, currentWinner, scenario } = req.body;

    if (!scenario || !decisionTitle || !options) {
      return res.status(400).json({
        error: 'Missing required parameters for stress-test.',
      });
    }

    const prompt = `You are "The Tiebreaker" decision stress-tester.
The user is facing this decision: "${decisionTitle}"
Options: ${JSON.stringify(options)}
Current leading option: "${currentWinner}"

The user wants to stress-test their decision against this specific 'What-If' scenario:
"${scenario}"

Analyze how this shock, constraint, or change affects the balance between the options.
Return a valid JSON object with:
{
  "scenario": "${scenario}",
  "impactSummary": "2-3 sentences explaining how this scenario disrupts the assumptions.",
  "newRecommendedOption": "Which option is best UNDER THIS SPECIFIC SCENARIO",
  "shiftsInAdvantage": [
    "Key shift 1 (e.g. Option A's vulnerability increases because...)",
    "Key shift 2",
    "Key shift 3"
  ],
  "contingencyAdvice": "Actionable hedge or contingency rule to protect against this scenario."
}
Respond ONLY with the JSON object.`;

    const responseText = await generateWithFallback(prompt, true);
    let parsedData;
    try {
      parsedData = JSON.parse(responseText.trim());
    } catch {
      const cleaned = responseText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error running stress-test:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to stress-test scenario.',
    });
  }
});

// API: Quick AI Assistant to generate or refine options/criteria
app.post('/api/suggest-options', async (req, res) => {
  try {
    const { dilemma } = req.body;
    if (!dilemma) {
      return res.status(400).json({ error: 'Please provide a dilemma topic.' });
    }

    const prompt = `Given this decision dilemma: "${dilemma}", suggest 3 to 4 distinct, well-defined options, and 3 key priority factors/criteria to consider.
Return valid JSON:
{
  "suggestedOptions": ["Option 1 with concise clarifying title", "Option 2", "Option 3"],
  "suggestedPriorities": "A concise summary of key priorities to think about"
}`;

    const text = await generateWithFallback(prompt, true);
    const parsed = JSON.parse(
      text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim()
    );

    return res.json(parsed);
  } catch (error: any) {
    console.error('Error suggesting options:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to suggest options.',
    });
  }
});

// Setup Vite middlewares in development or static serve in production
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
