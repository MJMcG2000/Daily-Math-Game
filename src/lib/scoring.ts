import type { Difficulty, ProblemState } from '../types';

export const MAX_GUESSES = 3;
export const MAX_HINTS = 2;
export const WEIGHT: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 };
/** Target solve times. Solving within the target keeps full points. */
export const TARGET_MS: Record<Difficulty, number> = {
  easy: 3 * 60_000,
  medium: 6 * 60_000,
  hard: 10 * 60_000,
};
export const BASE_POINTS = [3, 2, 1];
export const HINT_COST = 0.5;
export const MIN_BASE = 0.5;
/** The time multiplier falls linearly from 1 at the target to this floor at 3× the target. */
export const TIME_FLOOR = 0.5;

export const MAX_DAILY_SCORE = 3 * (WEIGHT.easy + WEIGHT.medium + WEIGHT.hard);

export function timeMultiplier(elapsedMs: number, difficulty: Difficulty): number {
  const target = TARGET_MS[difficulty];
  if (elapsedMs <= target) return 1;
  const over = (elapsedMs - target) / (2 * target); // 0 at target, 1 at 3× target
  return Math.max(TIME_FLOOR, 1 - (1 - TIME_FLOOR) * over);
}

export interface ScoreBreakdown {
  base: number;
  afterHints: number;
  timeMult: number;
  weight: number;
  total: number;
}

export function scoreProblem(state: ProblemState, difficulty: Difficulty): ScoreBreakdown {
  const weight = WEIGHT[difficulty];
  const timeMult = timeMultiplier(state.elapsedMs, difficulty);
  if (state.status !== 'solved') return { base: 0, afterHints: 0, timeMult, weight, total: 0 };
  const base = BASE_POINTS[state.guesses.length - 1] ?? 0;
  const afterHints = Math.max(MIN_BASE, base - HINT_COST * state.hintsUsed);
  const total = Math.round(afterHints * timeMult * weight * 10) / 10;
  return { base, afterHints, timeMult, weight, total };
}

export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h ? String(m).padStart(2, '0') : String(m);
  return (h ? `${h}:` : '') + `${mm}:${String(sec).padStart(2, '0')}`;
}
