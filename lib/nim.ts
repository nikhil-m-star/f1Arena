export interface AICommentaryInput {
  raceName: string;
  p1: string;
  p2: string;
  p3: string;
  fastestLap: string;
  dnf: string | null;
}

export interface AIRecapInput {
  raceName: string;
  prediction: {
    predictedP1: string;
    predictedP2: string;
    predictedP3: string;
    predictedFastestLap: string;
    predictedDNF: string | null;
  };
  result: {
    actualP1: string;
    actualP2: string;
    actualP3: string;
    actualFastestLap: string;
    actualDNFs: string[];
  };
  points: number;
}

export interface AISeasonRecapInput {
  history: Array<{
    raceName: string;
    points: number;
    breakdown: {
      p1Points: number;
      p2Points: number;
      p3Points: number;
      fastestLapPoints: number;
      dnfPoints: number;
      jokerMultiplierApplied: boolean;
    };
  }>;
}

async function callNvidiaNim(prompt: string, systemPrompt: string): Promise<string | null> {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  if (!apiKey) {
    console.warn("NVIDIA_NIM_API_KEY not configured. AI features will degrade gracefully.");
    return null;
  }

  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-70b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 512,
        top_p: 0.9,
      }),
      // Set a timeout to avoid blocking indefinitely
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      console.error(`NVIDIA NIM API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json() as any;
    return data.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error("NVIDIA NIM call failed:", error);
    return null;
  }
}

/**
 * Generate casual expert commentary before the race lock.
 */
export async function getConfidenceCommentary(input: AICommentaryInput): Promise<string | null> {
  const systemPrompt = "You are a witty, knowledgeable Formula 1 expert who gives quick feedback on fan predictions.";
  const prompt = `A user is making F1 predictions for the ${input.raceName}.
Predictions selected:
- Winner (P1): ${input.p1}
- Runner-up (P2): ${input.p2}
- Third Place (P3): ${input.p3}
- Fastest Lap: ${input.fastestLap}
- DNF Pick: ${input.dnf || "None"}

Give a wittily brief 1-2 sentence commentary analyzing their choices (e.g., driver form, teammate dynamics, track characteristics). Be casual, conversational, and direct. Do not write any greeting or intro.`;

  return callNvidiaNim(prompt, systemPrompt);
}

/**
 * Generate a friendly constructive race recap after scoring.
 */
export async function getRaceRecap(input: AIRecapInput): Promise<string | null> {
  const systemPrompt = "You are a friendly, encouraging F1 race analyst summarizing a user's predictions.";
  const prompt = `Summarize a user's prediction vs actual results for the ${input.raceName}.
User's Prediction:
- Podium: P1: ${input.prediction.predictedP1}, P2: ${input.prediction.predictedP2}, P3: ${input.prediction.predictedP3}
- Fastest Lap: ${input.prediction.predictedFastestLap}
- DNF: ${input.prediction.predictedDNF || "None"}

Actual Race Results:
- Podium: P1: ${input.result.actualP1}, P2: ${input.result.actualP2}, P3: ${input.result.actualP3}
- Fastest Lap: ${input.result.actualFastestLap}
- DNFs: ${input.result.actualDNFs.join(", ") || "None"}

The user earned a total of ${input.points} points.
Write a wittily friendly 1-2 sentence recap highlighting what they got right (if anything) and where they fell short. Be supportive but professional. Do not write any intro or greeting.`;

  return callNvidiaNim(prompt, systemPrompt);
}

/**
 * Generate a savage mock/roast after scoring.
 */
export async function getRaceRoast(input: AIRecapInput): Promise<string | null> {
  const systemPrompt = "You are a savage, sarcastic F1 commentator who roasts fans for their terrible predictions.";
  const prompt = `Roast a user's F1 prediction for the ${input.raceName} based on actual results.
User's Prediction:
- Podium: P1: ${input.prediction.predictedP1}, P2: ${input.prediction.predictedP2}, P3: ${input.prediction.predictedP3}
- Fastest Lap: ${input.prediction.predictedFastestLap}
- DNF: ${input.prediction.predictedDNF || "None"}

Actual Race Results:
- Podium: P1: ${input.result.actualP1}, P2: ${input.result.actualP2}, P3: ${input.result.actualP3}
- Fastest Lap: ${input.result.actualFastestLap}
- DNFs: ${input.result.actualDNFs.join(", ") || "None"}

The user earned a total of ${input.points} points.
Write a savage, sarcastic 1-2 sentence roast calling out their biggest whiff, worst choice, or general lack of F1 knowledge. Be funny and biting, but keep it PG-13. Do not write any intro or greeting.`;

  return callNvidiaNim(prompt, systemPrompt);
}

/**
 * Generate user season-so-far recap (Analyzer or Roaster mode).
 */
export async function getSeasonRecap(input: AISeasonRecapInput, mode: "analyzer" | "roaster"): Promise<string | null> {
  if (input.history.length === 0) {
    return "No predictions have been scored yet! Submit predictions and wait for races to complete to generate your season recap.";
  }

  const systemPrompt = mode === "analyzer"
    ? "You are a professional F1 race engineer and data analyst. Provide structured, insightful analysis."
    : "You are a hilarious, sarcastic F1 pundit who loves to make fun of casual fans' prediction performance.";

  const historyStr = input.history
    .map(h => `- ${h.raceName}: Scored ${h.points} points (Breakdown: P1: ${h.breakdown.p1Points}pts, P2: ${h.breakdown.p2Points}pts, P3: ${h.breakdown.p3Points}pts, FL: ${h.breakdown.fastestLapPoints}pts, DNF: ${h.breakdown.dnfPoints}pts, Joker used: ${h.breakdown.jokerMultiplierApplied})`)
    .join("\n");

  const prompt = mode === "analyzer"
    ? `Analyze the user's prediction history so far this season:
${historyStr}

Please provide a structured, detailed analysis:
1. **Strongest & Weakest Areas**: Compare their accuracy on podium finishes vs fastest laps vs DNF calls.
2. **Accuracy Trend**: Are they getting better or worse over the season?
3. **Standout Performance**: Best and worst individual race results.
4. **Concrete Advice**: Give one data-grounded strategic tip on how they can improve their predictions (e.g., being less biased, managing their Joker usage, or playing safer).
Keep it insightful, professional, and clearly structured.`
    : `Roast the user's prediction history so far this season:
${historyStr}

Write a sarcastic, hilarious, and wittily brutal season roast. Identify their most confidently-wrong calls, biggest whiffs, worst races, and overall strategy. Use bullet points for the roast categories, and write in the style of a teasing, opinionated F1 pundit.`;

  return callNvidiaNim(prompt, systemPrompt);
}
