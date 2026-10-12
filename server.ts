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

function safeJsonParse(text: string): any {
  let cleaned = text.replace(/```(?:json)?/gi, '').trim();
  // Strip JS single-line comments
  cleaned = cleaned.replace(/\/\/[^\n\r]*/g, '');
  // Extract outermost JSON block
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
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

    const prompt = `You are "The Tiebreaker", an elite decision strategist, executive advisor, and cognitive scientist.
Your role is to help a person make a high-stakes, clear-headed choice between options without fence-sitting, bias, or hand-waving.

THE DECISION DILEMMA:
Title: "${title}"
${description ? `Context/Details: "${description}"` : ''}
${userPriorities ? `User's Priorities, Values & Constraints: "${userPriorities}"` : ''}
${category ? `Category: "${category}"` : ''}

OPTIONS TO EVALUATE:
${options.map((opt: string, i: number) => `${i + 1}. ${opt}`).join('\n')}

Perform an exhaustive, multi-lens analysis and return a single valid JSON object adhering EXACTLY to this schema:
{
  "summary": "Crisp 1-2 sentence executive framing of the core tension and trade-off.",
  "verdict": {
    "winner": "${options[0]}",
    "confidenceScore": 85,
    "headline": "A memorable verdict headline",
    "rationale": "Direct, empathetic, uncompromising reason why this option wins the tiebreak.",
    "keyDifferentiator": "The single deciding factor or pivot point that separates the winner.",
    "devilsAdvocate": "The sharpest critique of the winning option — the blind spot or risk.",
    "tenTenTen": {
      "tenMinutes": "How will you feel 10 minutes after choosing this?",
      "tenMonths": "Where will you be 10 months after?",
      "tenYears": "How will this look in 10 years?"
    },
    "reversibility": {
      "doorType": "Type 1 (One-Way Door)",
      "explanation": "Why this is or is not easily reversible, and the true cost of backtracking.",
      "fallbackSafetyNet": "Specific tripwire or fallback plan if circumstances change."
    },
    "immediateNextStep": "A concrete micro-action or low-risk experiment to validate within 48 hours."
  },
  "prosAndCons": [
    {
      "option": "${options[0]}",
      "pros": [
        { "text": "Specific pro", "impact": 4, "category": "Career" }
      ],
      "cons": [
        { "text": "Specific con", "impact": 3, "category": "Risk" }
      ],
      "netScore": 8,
      "summaryTakeaway": "One-line distillation of this option core bargain."
    }
  ],
  "comparisonTable": {
    "criteria": [
      {
        "name": "Criterion Name",
        "weightImportance": 5,
        "description": "Why this matters in this decision",
        "optionScores": {
          "${options[0]}": { "score": 8, "comment": "Brief rationale" }
        },
        "winner": "${options[0]}"
      }
    ],
    "overallScores": {
      "${options[0]}": 84
    }
  },
  "swotAnalysis": [
    {
      "option": "${options[0]}",
      "strengths": ["3-4 distinct internal strengths"],
      "weaknesses": ["3-4 distinct internal weaknesses"],
      "opportunities": ["3-4 external future opportunities"],
      "threats": ["3-4 external threats or downside scenarios"]
    }
  ],
  "blindSpots": [
    "3 non-obvious factors, psychological biases, or hidden costs."
  ]
}

Provide entries for EVERY option in options list. Return ONLY valid raw JSON with no comments.`;

    const responseText = await generateWithFallback(prompt, true);
    const parsedData = safeJsonParse(responseText);

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
  "newRecommendedOption": "${currentWinner}",
  "shiftsInAdvantage": [
    "Key shift 1",
    "Key shift 2",
    "Key shift 3"
  ],
  "contingencyAdvice": "Actionable hedge or contingency rule to protect against this scenario."
}
Respond ONLY with the JSON object. No comments.`;

    const responseText = await generateWithFallback(prompt, true);
    const parsedData = safeJsonParse(responseText);

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

    const prompt = `Given this decision dilemma: "${dilemma}", suggest 3 distinct, well-defined options, and 3 key priority factors/criteria to consider.
Return valid JSON:
{
  "suggestedOptions": ["Option 1", "Option 2", "Option 3"],
  "suggestedPriorities": "A concise summary of key priorities to think about"
}`;

    const text = await generateWithFallback(prompt, true);
    const parsed = safeJsonParse(text);

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
