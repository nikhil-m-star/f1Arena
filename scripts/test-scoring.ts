import { calculateScore, PredictionInput, RaceResultInput } from "../lib/scoring";

interface TestCase {
  name: string;
  prediction: PredictionInput;
  result: RaceResultInput;
  expectedPoints: number;
  expectedJoker: boolean;
}

const testCases: TestCase[] = [
  {
    name: "Perfect podium match, fastest lap and DNF, no joker",
    prediction: {
      predictedP1: "max_verstappen",
      predictedP2: "hamilton",
      predictedP3: "leclerc",
      predictedFastestLap: "max_verstappen",
      predictedDNF: "perez",
      isJoker: false,
    },
    result: {
      actualP1: "max_verstappen",
      actualP2: "hamilton",
      actualP3: "leclerc",
      actualFastestLap: "max_verstappen",
      actualDNFs: ["perez", "stroll"],
    },
    expectedPoints: 90, // P1: 25, P2: 25, P3: 25, FL: 10, DNF: 5 = 90
    expectedJoker: false,
  },
  {
    name: "Podium matches but wrong positions, wrong fastest lap/DNF, with joker",
    prediction: {
      predictedP1: "hamilton", // actual P2
      predictedP2: "leclerc",  // actual P3
      predictedP3: "max_verstappen", // actual P1
      predictedFastestLap: "norris",
      predictedDNF: "russell",
      isJoker: true,
    },
    result: {
      actualP1: "max_verstappen",
      actualP2: "hamilton",
      actualP3: "leclerc",
      actualFastestLap: "max_verstappen",
      actualDNFs: ["stroll"],
    },
    expectedPoints: 60, // P1: 10 (wrong pos), P2: 10 (wrong pos), P3: 10 (wrong pos) = 30 * 2 = 60
    expectedJoker: true,
  },
  {
    name: "Partial podium match, correct fastest lap and DNF, no joker",
    prediction: {
      predictedP1: "max_verstappen", // actual P1 (25)
      predictedP2: "perez",          // not on podium (0)
      predictedP3: "hamilton",       // actual P2 (10)
      predictedFastestLap: "max_verstappen", // actual FL (10)
      predictedDNF: "stroll",        // actual DNF (5)
      isJoker: false,
    },
    result: {
      actualP1: "max_verstappen",
      actualP2: "hamilton",
      actualP3: "leclerc",
      actualFastestLap: "max_verstappen",
      actualDNFs: ["stroll", "alonso"],
    },
    expectedPoints: 50, // P1: 25, P2: 0, P3: 10, FL: 10, DNF: 5 = 50
    expectedJoker: false,
  },
  {
    name: "Zero points scored, with joker",
    prediction: {
      predictedP1: "albon",
      predictedP2: "stroll",
      predictedP3: "gasly",
      predictedFastestLap: "ocon",
      predictedDNF: "norris",
      isJoker: true,
    },
    result: {
      actualP1: "max_verstappen",
      actualP2: "hamilton",
      actualP3: "leclerc",
      actualFastestLap: "max_verstappen",
      actualDNFs: [],
    },
    expectedPoints: 0,
    expectedJoker: true,
  }
];

function runTests() {
  console.log("Running scoring function unit tests...");
  let failures = 0;

  for (const tc of testCases) {
    const { points, breakdown } = calculateScore(tc.prediction, tc.result);

    const pointsMatch = points === tc.expectedPoints;
    const jokerMatch = breakdown.jokerMultiplierApplied === tc.expectedJoker;

    if (pointsMatch && jokerMatch) {
      console.log(`✅ Passed: "${tc.name}" -> Got ${points} points.`);
    } else {
      console.error(`❌ Failed: "${tc.name}"`);
      console.error(`   Expected: ${tc.expectedPoints} points, Joker: ${tc.expectedJoker}`);
      console.error(`   Received: ${points} points, Joker: ${breakdown.jokerMultiplierApplied}`);
      failures++;
    }
  }

  if (failures === 0) {
    console.log("\n🎉 All scoring logic unit tests passed successfully!");
    process.exit(0);
  } else {
    console.error(`\n❌ Completed with ${failures} test failures.`);
    process.exit(1);
  }
}

runTests();
