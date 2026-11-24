import type { Difficulty } from '../types';
import type { History } from './storage';

export interface Stats {
  daysPlayed: number;
  perfectDays: number;
  perfectStreak: number;
  maxPerfectStreak: number;
  solveStreak: number;
  maxSolveStreak: number;
  bestScore: number;
  averageScore: number;
  solveRate: Record<Difficulty, { solved: number; attempted: number }>;
  /** Index 0..2 = solved on guess 1..3, index 3 = not solved. */
  guessDistribution: Record<Difficulty, [number, number, number, number]>;
  averageSolveMs: Record<Difficulty, number | null>;
}

const DIFFS: Difficulty[] = ['easy', 'medium', 'hard'];

function streaks(days: number[], qualifies: Set<number>, today: number) {
  // Current streak: count back from today. If today doesn't qualify (yet), start from yesterday.
  let current = 0;
  let d = qualifies.has(today) ? today : today - 1;
  while (qualifies.has(d)) { current++; d--; }
  let max = 0;
  let run = 0;
  let prev: number | null = null;
  for (const day of days) {
    if (qualifies.has(day)) {
      run = prev !== null && day === prev + 1 && qualifies.has(prev) ? run + 1 : 1;
      max = Math.max(max, run);
    } else run = 0;
    prev = day;
  }
  return { current, max: Math.max(max, current) };
}

export function computeStats(history: History, today: number): Stats {
  const records = Object.values(history).sort((a, b) => a.day - b.day);
  const played = records.filter((r) => r.results.some((x) => x.guesses > 0));
  const solveDays = new Set(played.filter((r) => r.results.some((x) => x.status === 'solved')).map((r) => r.day));
  const perfectDays = new Set(played.filter((r) => r.results.every((x) => x.status === 'solved')).map((r) => r.day));
  const days = played.map((r) => r.day);
  const perfect = streaks(days, perfectDays, today);
  const solve = streaks(days, solveDays, today);

  const solveRate = Object.fromEntries(DIFFS.map((d) => [d, { solved: 0, attempted: 0 }])) as Stats['solveRate'];
  const dist = Object.fromEntries(DIFFS.map((d) => [d, [0, 0, 0, 0]])) as Stats['guessDistribution'];
  const timeSum: Record<Difficulty, [number, number]> = { easy: [0, 0], medium: [0, 0], hard: [0, 0] };
  const totals: number[] = [];
  for (const r of played) {
    totals.push(r.results.reduce((s, x) => s + x.score, 0));
    for (const x of r.results) {
      if (x.status === 'playing') continue;
      solveRate[x.difficulty].attempted++;
      if (x.status === 'solved') {
        solveRate[x.difficulty].solved++;
        dist[x.difficulty][Math.min(x.guesses, 3) - 1]++;
        timeSum[x.difficulty][0] += x.elapsedMs;
        timeSum[x.difficulty][1]++;
      } else dist[x.difficulty][3]++;
    }
  }
  return {
    daysPlayed: played.length,
    perfectDays: perfectDays.size,
    perfectStreak: perfect.current,
    maxPerfectStreak: perfect.max,
    solveStreak: solve.current,
    maxSolveStreak: solve.max,
    bestScore: totals.length ? Math.max(...totals) : 0,
    averageScore: totals.length ? Math.round((totals.reduce((a, b) => a + b, 0) / totals.length) * 10) / 10 : 0,
    solveRate,
    guessDistribution: dist,
    averageSolveMs: Object.fromEntries(
      DIFFS.map((d) => [d, timeSum[d][1] ? timeSum[d][0] / timeSum[d][1] : null]),
    ) as Stats['averageSolveMs'],
  };
}
