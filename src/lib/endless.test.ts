import { describe, expect, it } from 'vitest';
import { drawProblem, practiceDifficulty, survivalDifficulty, survivalShareText, touched, freshProblemState } from './endless';
import { rng } from './daily';
import type { Problem } from '../types';

const mk = (id: string, difficulty: Problem['difficulty'] = 'easy'): Problem => ({
  id, difficulty, topic: '', prompt: '', answer: '1', answerNumeric: 1, hint1: '', hint2: '', solutionSteps: [],
});
const easy = Array.from({ length: 10 }, (_, i) => mk(`e${i}`));
const banks = { easy, medium: [mk('m0', 'medium')], hard: [mk('h0', 'hard')] };

describe('endless draw', () => {
  it('serves every problem once before repeating, never an excluded one', () => {
    const rand = rng(1);
    let queues = {};
    const exclude = new Set(['e3', 'e7']);
    const seen: string[] = [];
    for (let i = 0; i < 8; i++) {
      const r = drawProblem('easy', banks, queues, exclude, rand);
      queues = r.queues;
      seen.push(r.problem.id);
    }
    expect(new Set(seen).size).toBe(8);
    expect(seen).not.toContain('e3');
    expect(seen).not.toContain('e7');
    const next = drawProblem('easy', banks, queues, exclude, rand); // queue empty → refill
    expect(['e3', 'e7']).not.toContain(next.problem.id);
  });
  it('drops ids that are no longer in the bank', () => {
    const r = drawProblem('easy', banks, { easy: ['gone', 'e1'] }, new Set());
    expect(r.problem.id).toBe('e1');
  });
  it('falls back when everything is excluded', () => {
    const r = drawProblem('medium', banks, {}, new Set(['m0']));
    expect(r.problem.id).toBe('m0');
  });
});

describe('difficulty rules', () => {
  it('survival cycles easy, medium, hard three times, then only hard', () => {
    expect(Array.from({ length: 13 }, (_, i) => survivalDifficulty(i))).toEqual([
      'easy', 'medium', 'hard', 'easy', 'medium', 'hard', 'easy', 'medium', 'hard',
      'hard', 'hard', 'hard', 'hard',
    ]);
  });
  it('practice pools', () => {
    expect(practiceDifficulty('hard')).toBe('hard');
    const rand = rng(5);
    const got = new Set(Array.from({ length: 50 }, () => practiceDifficulty('mixed', rand)));
    expect(got).toEqual(new Set(['easy', 'medium', 'hard']));
  });
  it('touched = guessed or hinted', () => {
    const ps = freshProblemState('x');
    expect(touched(ps)).toBe(false);
    expect(touched({ ...ps, hintsUsed: 1 })).toBe(true);
  });
  it('survival share has no spoilers', () => {
    expect(survivalShareText(7, 9)).toBe('Mathdle Survival: solved 7 (fell on problem 8)\n🟢🟡🔴🟢🟡🔴🟢❌\nBest: 9');
  });
});
