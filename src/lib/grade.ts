import type { Problem } from '../types';
import { parseAnswer } from './parse';
import { answerValue, judge, REL_TOL, type Feedback } from './check';

export const DEFAULT_DOMAIN: [number, number] = [0.5, 2.5];
const N_POINTS = 7;

/**
 * Deterministic test values for a symbolic problem: N points spread across each variable's
 * domain with irrational-ish offsets so they avoid integers and other special values.
 * The verification script uses the same points (via scripts/check_bank.ts).
 */
export function samplePoints(problem: Pick<Problem, 'variables' | 'domain'>): Record<string, number>[] {
  const vars = problem.variables ?? [];
  return Array.from({ length: N_POINTS }, (_, j) => {
    const pt: Record<string, number> = {};
    vars.forEach((v, i) => {
      const [lo, hi] = problem.domain?.[v] ?? DEFAULT_DOMAIN;
      const frac = (0.1372 + 0.6180339887 * j + 0.3183 * i) % 1;
      pt[v] = lo + (hi - lo) * (0.05 + 0.9 * frac);
    });
    return pt;
  });
}

function close(a: number, b: number): boolean {
  return Math.abs(a - b) <= REL_TOL * Math.max(1, Math.abs(b));
}

export type GradeResult = Feedback & { value: number };

/** Grade a raw input against a problem, numeric or symbolic. Assumes the input parses. */
export function grade(problem: Problem, input: string): GradeResult {
  const vars = problem.variables ?? [];
  const guess = parseAnswer(input, vars);
  if (!guess.ok) return { mark: 'wrong', value: NaN };
  if (!vars.length) {
    return { ...judge(guess.value, answerValue(problem.answerNumeric ?? NaN)), value: guess.value };
  }
  const answer = parseAnswer(problem.answer, vars);
  if (!answer.ok) return { mark: 'wrong', value: NaN };
  let compared = 0;
  for (const pt of samplePoints(problem)) {
    const want = answer.evaluateAt(pt);
    if (want === null || !Number.isFinite(want)) continue;
    const got = guess.evaluateAt(pt);
    if (got === null || !close(got, want)) return { mark: 'wrong', value: NaN };
    compared++;
  }
  return { mark: compared >= 3 ? 'correct' : 'wrong', value: NaN };
}
