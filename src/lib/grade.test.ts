import { describe, expect, it } from 'vitest';
import hard from '../../data/problems/hard.json';
import medium from '../../data/problems/medium.json';
import type { Problem } from '../types';
import { grade, samplePoints } from './grade';

const byId = new Map([...(hard as Problem[]), ...(medium as Problem[])].map((p) => [p.id, p]));
const P = (id: string) => byId.get(id)!;
const mark = (id: string, input: string) => grade(P(id), input).mark;

describe('symbolic grading', () => {
  it('accepts the stored answer for every symbolic problem', () => {
    const sym = [...byId.values()].filter((p) => p.variables?.length);
    expect(sym.length).toBeGreaterThanOrEqual(30);
    for (const p of sym) expect(grade(p, p.answer).mark, p.id).toBe('correct');
  });
  it('accepts equivalent forms', () => {
    expect(mark('h101', 'x(2sin(x) + x cos(x))')).toBe('correct');
    expect(mark('h101', 'x^2cos x + 2x sin x')).toBe('correct');
    expect(mark('h106', 'x^4/2 - x^2/2')).toBe('correct');
    expect(mark('h106', '(1/2)x^2(x^2 - 1)')).toBe('correct');
    expect(mark('m102', '4^(a/3)')).toBe('correct');
    expect(mark('m102', 'cbrt(4^a)')).toBe('correct');
    expect(mark('m105', 's^2(pi/2 - 1)')).toBe('correct');
    expect(mark('h113', 'a e^a - e^a + 1')).toBe('correct');
    expect(mark('h115', 'ln(2) + ln(a+1) - ln(a+2)')).toBe('correct');
    expect(mark('h123', '1 - 1/(n+1)')).toBe('correct');
    expect(mark('h110', '-x/y')).toBe('correct');
  });
  it('rejects near misses', () => {
    expect(mark('h101', '2x sin(x)')).toBe('wrong'); // forgot a product-rule term
    expect(mark('h101', '2x cos(x)')).toBe('wrong');
    expect(mark('h106', '(x^4 - x^2)/4')).toBe('wrong');
    expect(mark('h109', 'b/a')).toBe('wrong');
    expect(mark('h110', 'x/y')).toBe('wrong');
    expect(mark('h113', '(a - 1)e^a')).toBe('wrong'); // dropped the lower limit
    expect(mark('h124', '1/(n+1)^2')).toBe('wrong'); // sign
  });
  it('a number is never accepted for an expression answer', () => {
    expect(mark('h107', '4/3')).toBe('wrong');
  });
  it('symbolic grading gives no higher/lower direction', () => {
    expect(grade(P('h101'), '2x sin(x)').direction).toBeUndefined();
  });
  it('test points stay inside each variable domain', () => {
    const p = P('h110');
    for (const pt of samplePoints(p)) {
      expect(pt.x).toBeGreaterThanOrEqual(0.5);
      expect(pt.x).toBeLessThanOrEqual(3);
      expect(pt.y).toBeGreaterThanOrEqual(1);
      expect(pt.y).toBeLessThanOrEqual(4);
    }
  });
});

describe('numeric grading still works through grade()', () => {
  it('uses higher/lower and close', () => {
    const p = (hard as Problem[]).find((q) => q.id === 'h033')!; // answer 128
    expect(grade(p, '128').mark).toBe('correct');
    expect(grade(p, '120')).toMatchObject({ mark: 'close', direction: 'higher' });
  });
});
