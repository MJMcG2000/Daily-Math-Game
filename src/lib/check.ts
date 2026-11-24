import type { Mark } from '../types';

export const REL_TOL = 1e-6;
/** Used when the true answer is exactly 0, where a relative tolerance is meaningless. */
export const ABS_TOL = 1e-9;
export const CLOSE_FRACTION = 0.1;

export function answerValue(numeric: number | 'inf' | '-inf'): number {
  if (numeric === 'inf') return Infinity;
  if (numeric === '-inf') return -Infinity;
  return numeric;
}

export function isEquivalent(guess: number, answer: number): boolean {
  if (!Number.isFinite(answer) || !Number.isFinite(guess)) return guess === answer;
  const diff = Math.abs(guess - answer);
  if (answer === 0) return diff <= ABS_TOL;
  return diff <= REL_TOL * Math.abs(answer);
}

export interface Feedback {
  mark: Mark;
  /** Where the true answer lies relative to the guess. */
  direction?: 'higher' | 'lower';
}

export function judge(guess: number, answer: number): Feedback {
  if (isEquivalent(guess, answer)) return { mark: 'correct' };
  const direction = answer > guess ? 'higher' : 'lower';
  let close = false;
  if (Number.isFinite(answer) && Number.isFinite(guess)) {
    close = answer === 0
      ? Math.abs(guess) <= CLOSE_FRACTION
      : Math.abs(guess - answer) <= CLOSE_FRACTION * Math.abs(answer);
  }
  return { mark: close ? 'close' : 'wrong', direction };
}
