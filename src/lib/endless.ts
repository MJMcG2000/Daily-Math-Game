/**
 * Endless mode: Practice (pick a difficulty, play on) and Survival (difficulty ramps up,
 * the run ends at the first unsolved problem). Separate from daily stats.
 */
import type { Difficulty, Problem, ProblemState } from '../types';
import type { Banks } from './daily';

export type PracticePool = Difficulty | 'mixed';
export type EndlessKind = 'practice' | 'survival';

export interface EndlessRun {
  problemId: string;
  ps: ProblemState;
  /** Practice: current solved-in-a-row streak. Survival: problems solved this run. */
  count: number;
  /** Survival only: true once a problem goes unsolved. */
  over?: boolean;
}

export interface EndlessData {
  practicePool: PracticePool;
  practice: EndlessRun | null;
  survival: EndlessRun | null;
  bestPractice: number;
  bestSurvival: number;
  practiceSolved: Record<Difficulty, number>;
  practiceAttempted: Record<Difficulty, number>;
  /** Shuffled queues of problem ids not yet served, per pool, so nothing repeats until a pool runs out. */
  queues: Partial<Record<Difficulty, string[]>>;
}

const KEY = 'mathdle:endless:v1';

export function emptyData(): EndlessData {
  return {
    practicePool: 'mixed',
    practice: null,
    survival: null,
    bestPractice: 0,
    bestSurvival: 0,
    practiceSolved: { easy: 0, medium: 0, hard: 0 },
    practiceAttempted: { easy: 0, medium: 0, hard: 0 },
    queues: {},
  };
}

export function loadEndless(): EndlessData {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...emptyData(), ...(JSON.parse(raw) as EndlessData) } : emptyData();
  } catch {
    return emptyData();
  }
}

export function saveEndless(d: EndlessData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    /* storage unavailable */
  }
}

export function freshProblemState(id: string): ProblemState {
  return { id, guesses: [], hintsUsed: 0, status: 'playing', started: true, elapsedMs: 0 };
}

/** Problems in the alternating opening of a Survival run: three Easy → Medium → Hard rounds. */
export const SURVIVAL_ROUNDS_PROBLEMS = 9;

/**
 * Survival difficulty for the n-th problem of a run (0-based). The first 9 cycle
 * Easy, Medium, Hard three times; after 9 correct answers every problem is Hard.
 */
export function survivalDifficulty(level: number): Difficulty {
  if (level >= SURVIVAL_ROUNDS_PROBLEMS) return 'hard';
  return (['easy', 'medium', 'hard'] as const)[level % 3];
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Take the next problem of a difficulty from its queue, skipping excluded ids
 * (today's daily problems and the problem just played). Refills with a fresh
 * shuffle when the queue runs out. Returns the problem and the updated queues.
 */
export function drawProblem(
  difficulty: Difficulty,
  banks: Banks,
  queues: EndlessData['queues'],
  exclude: ReadonlySet<string>,
  rand: () => number = Math.random,
): { problem: Problem; queues: EndlessData['queues'] } {
  const pool = banks[difficulty];
  const byId = new Map(pool.map((p) => [p.id, p]));
  let queue = (queues[difficulty] ?? []).filter((id) => byId.has(id));
  for (let attempt = 0; attempt < 2; attempt++) {
    const i = queue.findIndex((id) => !exclude.has(id));
    if (i >= 0) {
      const id = queue[i];
      queue = [...queue.slice(0, i), ...queue.slice(i + 1)];
      return { problem: byId.get(id)!, queues: { ...queues, [difficulty]: queue } };
    }
    queue = shuffle(pool.map((p) => p.id), rand); // refill
  }
  // Every problem is excluded (tiny bank): fall back to any problem.
  return { problem: pool[Math.floor(rand() * pool.length)], queues };
}

export function practiceDifficulty(pool: PracticePool, rand: () => number = Math.random): Difficulty {
  if (pool !== 'mixed') return pool;
  const all: Difficulty[] = ['easy', 'medium', 'hard'];
  return all[Math.floor(rand() * 3)];
}

/** A problem counts as touched once the player has guessed or taken a hint. */
export function touched(ps: ProblemState): boolean {
  return ps.guesses.length > 0 || ps.hintsUsed > 0;
}

export function survivalShareText(count: number, best: number, url?: string): string {
  const level = count + 1;
  const bar = Array.from({ length: Math.max(count, 0) }, (_, i) => (survivalDifficulty(i) === 'easy' ? '🟢' : survivalDifficulty(i) === 'medium' ? '🟡' : '🔴')).join('');
  return [`Mathdle Survival: solved ${count} (fell on problem ${level})`, bar + '❌', `Best: ${best}`, url]
    .filter(Boolean)
    .join('\n');
}
