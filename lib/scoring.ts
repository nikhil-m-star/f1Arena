export interface PredictionInput {
  predictedP1: string;
  predictedP2: string;
  predictedP3: string;
  predictedFastestLap: string;
  predictedDNF: string | null;
  isJoker: boolean;
}

export interface RaceResultInput {
  actualP1: string;
  actualP2: string;
  actualP3: string;
  actualFastestLap: string;
  actualDNFs: string[];
}

export interface ScoreBreakdown {
  p1Points: number;
  p2Points: number;
  p3Points: number;
  fastestLapPoints: number;
  dnfPoints: number;
  jokerMultiplierApplied: boolean;
  totalPoints: number;
}

export function calculateScore(prediction: PredictionInput, result: RaceResultInput): { points: number; breakdown: ScoreBreakdown } {
  let p1Points = 0;
  let p2Points = 0;
  let p3Points = 0;

  // P1 logic
  if (prediction.predictedP1 === result.actualP1) {
    p1Points = 25;
  } else if (prediction.predictedP1 === result.actualP2 || prediction.predictedP1 === result.actualP3) {
    p1Points = 10;
  }

  // P2 logic
  if (prediction.predictedP2 === result.actualP2) {
    p2Points = 25;
  } else if (prediction.predictedP2 === result.actualP1 || prediction.predictedP2 === result.actualP3) {
    p2Points = 10;
  }

  // P3 logic
  if (prediction.predictedP3 === result.actualP3) {
    p3Points = 25;
  } else if (prediction.predictedP3 === result.actualP1 || prediction.predictedP3 === result.actualP2) {
    p3Points = 10;
  }

  // Fastest Lap logic
  const fastestLapPoints = prediction.predictedFastestLap === result.actualFastestLap ? 10 : 0;

  // DNF logic
  const dnfPoints =
    prediction.predictedDNF && result.actualDNFs.includes(prediction.predictedDNF) ? 5 : 0;

  const basePoints = p1Points + p2Points + p3Points + fastestLapPoints + dnfPoints;
  const multiplier = prediction.isJoker ? 2 : 1;
  const totalPoints = basePoints * multiplier;

  const breakdown: ScoreBreakdown = {
    p1Points,
    p2Points,
    p3Points,
    fastestLapPoints,
    dnfPoints,
    jokerMultiplierApplied: prediction.isJoker,
    totalPoints,
  };

  return {
    points: totalPoints,
    breakdown,
  };
}
