import { describe, expect, it } from 'vitest';
import { judge, isEquivalent } from './check';
import { scoreProblem, timeMultiplier, MAX_DAILY_SCORE } from './scoring';
import { dayIndex, pickFromPool, problemsForDay, seededShuffle } from './daily';
import { computeStats } from './stats';
import { shareText } from './share';
import type { Problem, ProblemState } from '../types';
import type { History } from './storage';

const ps = (o: Partial<ProblemState>): ProblemState => ({
  id: 'x', guesses: [], hintsUsed: 0, status: 'playing', started: true, elapsedMs: 0, ...o,
});
const g = (n: number) => Array.from({ length: n }, () => ({ input: '1', value: 1, mark: 'wrong' as const }));

describe('judge', () => {
  it('correct within 1e-6 relative', () => {
    expect(judge(Math.PI / 4 * (1 + 5e-7), Math.PI / 4).mark).toBe('correct');
    expect(judge(Math.PI / 4 * (1 + 5e-6), Math.PI / 4).mark).toBe('close');
  });
  it('close within 10% and gives direction', () => {
    expect(judge(95, 100)).toEqual({ mark: 'close', direction: 'higher' });
    expect(judge(111, 100)).toEqual({ mark: 'wrong', direction: 'lower' });
  });
  it('handles zero answers', () => {
    expect(judge(0, 0).mark).toBe('correct');
    expect(judge(0.05, 0)).toEqual({ mark: 'close', direction: 'lower' });
  });
  it('handles infinity', () => {
    expect(judge(Infinity, Infinity).mark).toBe('correct');
    expect(judge(1e9, Infinity)).toEqual({ mark: 'wrong', direction: 'higher' });
    expect(judge(Infinity, 5)).toEqual({ mark: 'wrong', direction: 'lower' });
    expect(isEquivalent(-Infinity, Infinity)).toBe(false);
  });
});

describe('scoring', () => {
  it('time multiplier decays linearly from target to 3× target', () => {
    expect(timeMultiplier(60_000, 'easy')).toBe(1);
    expect(timeMultiplier(180_000, 'easy')).toBe(1);
    expect(timeMultiplier(360_000, 'easy')).toBeCloseTo(0.75);
    expect(timeMultiplier(540_000, 'easy')).toBeCloseTo(0.5);
    expect(timeMultiplier(5_000_000, 'easy')).toBe(0.5);
  });
  it('guesses, hints, weight', () => {
    const s = (o: Partial<ProblemState>, d: 'easy' | 'medium' | 'hard' = 'easy') => scoreProblem(ps(o), d).total;
    expect(s({ status: 'solved', guesses: g(1) })).toBe(3);
    expect(s({ status: 'solved', guesses: g(2), hintsUsed: 1 })).toBe(1.5);
    expect(s({ status: 'solved', guesses: g(3), hintsUsed: 2 })).toBe(0.5);
    expect(s({ status: 'solved', guesses: g(1) }, 'hard')).toBe(9);
    expect(s({ status: 'solved', guesses: g(1), elapsedMs: 20 * 60_000 }, 'hard')).toBe(6.8) // 3 × 0.75 × 3 = 6.75, rounded to 1 dp;
    expect(s({ status: 'failed', guesses: g(3) })).toBe(0);
    expect(MAX_DAILY_SCORE).toBe(18);
  });
});

const mk = (id: string, extra: Partial<Problem> = {}): Problem => ({
  id, difficulty: 'easy', topic: '', prompt: '', answer: '1', answerNumeric: 1,
  hint1: '', hint2: '', solutionSteps: [], ...extra,
});

describe('daily selection', () => {
  it('dayIndex uses the local calendar date', () => {
    expect(dayIndex(new Date(2026, 10, 24, 0, 0, 1))).toBe(0);
    expect(dayIndex(new Date(2026, 10, 24, 23, 59, 59))).toBe(0);
    expect(dayIndex(new Date(2026, 10, 25, 0, 0, 0))).toBe(1);
    expect(dayIndex(new Date(2027, 2, 15, 12))).toBe(111); // across a DST change
  });
  it('seeded shuffle is deterministic and a permutation', () => {
    const a = seededShuffle([1, 2, 3, 4, 5, 6, 7, 8], 's');
    expect(seededShuffle([1, 2, 3, 4, 5, 6, 7, 8], 's')).toEqual(a);
    expect([...a].sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('no repeats until the pool is exhausted, and order in file does not matter', () => {
    const pool = Array.from({ length: 30 }, (_, i) => mk(`p${String(i).padStart(2, '0')}`));
    const first = Array.from({ length: 30 }, (_, n) => pickFromPool(pool, n, 'seed').id);
    expect(new Set(first).size).toBe(30);
    const reversed = [...pool].reverse();
    expect(Array.from({ length: 30 }, (_, n) => pickFromPool(reversed, n, 'seed').id)).toEqual(first);
    const second = Array.from({ length: 30 }, (_, n) => pickFromPool(pool, 30 + n, 'seed').id);
    expect(new Set(second).size).toBe(30);
  });
  it('hard alternates calc1 and calc2', () => {
    const hard = [mk('a', { course: 'calc1' }), mk('b', { course: 'calc1' }), mk('c', { course: 'calc2' }), mk('d', { course: 'calc2' })];
    const banks = { easy: [mk('e')], medium: [mk('m')], hard };
    expect(problemsForDay(0, banks)[2].course).toBe('calc1');
    expect(problemsForDay(1, banks)[2].course).toBe('calc2');
    expect(problemsForDay(2, banks)[2].course).toBe('calc1');
    const calc1 = [0, 2].map((d) => problemsForDay(d, banks)[2].id);
    expect(new Set(calc1).size).toBe(2);
  });
});

describe('stats & streaks', () => {
  const rec = (day: number, statuses: ('solved' | 'failed')[]): History[number] => ({
    day,
    results: statuses.map((s, i) => ({
      difficulty: (['easy', 'medium', 'hard'] as const)[i], status: s, guesses: s === 'solved' ? 1 : 3, hints: 0, elapsedMs: 1000, score: s === 'solved' ? 3 : 0,
    })),
  });
  it('tracks perfect and solve streaks separately', () => {
    const h: History = {
      1: rec(1, ['solved', 'solved', 'solved']),
      2: rec(2, ['solved', 'solved', 'solved']),
      3: rec(3, ['solved', 'failed', 'failed']),
      4: rec(4, ['solved', 'solved', 'solved']),
    };
    const s = computeStats(h, 4);
    expect(s.perfectStreak).toBe(1);
    expect(s.maxPerfectStreak).toBe(2);
    expect(s.solveStreak).toBe(4);
    expect(s.guessDistribution.medium).toEqual([3, 0, 0, 1]);
    expect(s.solveRate.hard).toEqual({ solved: 3, attempted: 4 });
  });
  it('a missed day breaks streaks; today unplayed keeps yesterday\'s streak', () => {
    const h: History = { 1: rec(1, ['solved', 'solved', 'solved']), 3: rec(3, ['solved', 'solved', 'solved']) };
    expect(computeStats(h, 4).perfectStreak).toBe(1);
    expect(computeStats(h, 5).perfectStreak).toBe(0);
  });
});

describe('share', () => {
  it('builds a spoiler-free emoji grid', () => {
    const probs = [mk('a'), mk('b', { difficulty: 'medium' }), mk('c', { difficulty: 'hard' })];
    const text = shareText({
      day: 41,
      problems: [
        ps({ status: 'solved', guesses: [{ input: '1', value: 1, mark: 'correct' }], elapsedMs: 72_000 }),
        ps({ status: 'solved', hintsUsed: 1, guesses: [{ input: '2', value: 2, mark: 'close' }, { input: '1', value: 1, mark: 'correct' }], elapsedMs: 270_000 }),
        ps({ status: 'failed', hintsUsed: 2, guesses: g(3), elapsedMs: 600_000 }),
      ],
    }, probs);
    expect(text.split('\n')).toEqual([
      'Mathdle #42 — 2/3 · 6/18 pts',
      '① 🟩 ⏱1:12',
      '② 🟨🟩 💡 ⏱4:30',
      '③ 🟥🟥🟥 💡💡 ⏱10:00',
    ]);
    expect(text).not.toMatch(/answer/i);
  });
  it('marks a given-up problem with a white flag', () => {
    const probs = [mk('a'), mk('b', { difficulty: 'medium' }), mk('c', { difficulty: 'hard' })];
    const text = shareText({
      day: 0,
      problems: [
        ps({ status: 'failed', gaveUp: true, guesses: [], elapsedMs: 30_000 }),
        ps({ status: 'failed', gaveUp: true, guesses: [{ input: '2', value: 2, mark: 'close' }], elapsedMs: 60_000 }),
        ps({ status: 'playing' }),
      ],
    }, probs);
    expect(text.split('\n').slice(1)).toEqual(['① 🏳️ ⏱0:30', '② 🟨🏳️ ⏱1:00', '③ ⬜']);
  });
});
