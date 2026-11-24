import { describe, expect, it } from 'vitest';
import { normalize, parseAnswer } from './parse';
import { isEquivalent } from './check';

const PI = Math.PI;
const E = Math.E;

function val(s: string): number {
  const r = parseAnswer(s);
  if (!r.ok) throw new Error(`expected "${s}" to parse, got: ${r.error}`);
  return r.value;
}
function expectValue(s: string, expected: number) {
  const v = val(s);
  if (!Number.isFinite(expected)) expect(v).toBe(expected);
  else expect(isEquivalent(v, expected), `${s} = ${v}, expected ${expected}`).toBe(true);
}
function expectError(s: string) {
  const r = parseAnswer(s);
  expect(r.ok, `expected "${s}" to be rejected`).toBe(false);
}

describe('normalize', () => {
  it('converts unicode symbols', () => {
    expect(normalize('3π/4')).toBe('3 pi /4');
    expect(normalize('√2')).toBe('sqrt 2');
    expect(normalize('x²')).toBe('x^(2)');
    expect(normalize('2·3×4÷5−1')).toBe('2*3*4/5-1');
    expect(normalize('∞')).toBe('inf');
    expect(normalize('2**3')).toBe('2^3');
  });
  it('lowercases and collapses whitespace', () => {
    expect(normalize('  PI   /  4 ')).toBe('pi / 4');
  });
});

describe('integers, decimals, fractions', () => {
  it.each([
    ['42', 42], ['-7', -7], ['0.5', 0.5], ['.5', 0.5], ['3.', 3], ['1/2', 0.5], ['2/4', 0.5],
    ['-3/4', -0.75], ['(1+2)/(3+4)', 3 / 7], ['2^10', 1024], ['2**10', 1024], ['2^-1', 0.5],
    ['-2^2', -4], ['2^3^2', 512], ['(−3)²', 9], ['10 - 4 - 3', 3], ['12/3/2', 2],
  ])('%s = %d', (s, v) => expectValue(s, v));
});

describe('pi', () => {
  it.each(['pi', 'Pi', 'PI', 'π', 'pI'])('%s is π', (s) => expectValue(s, PI));
  it('pi and π agree in expressions', () => {
    expect(val('3pi/4')).toBe(val('3π/4'));
    expectValue('3pi/4', (3 * PI) / 4);
  });
});

describe('e vs scientific notation', () => {
  it('e alone is Euler\'s number', () => expectValue('e', E));
  it('2e is 2·e', () => expectValue('2e', 2 * E));
  it('1e3 is 1000', () => expectValue('1e3', 1000));
  it('2.5e-4 is scientific', () => expectValue('2.5e-4', 2.5e-4));
  it('1e-3 is scientific', () => expectValue('1e-3', 0.001));
  it('2e+1 is 2e + 1 (not scientific)', () => expectValue('2e+1', 2 * E + 1));
  it('2e*3 is 6e', () => expectValue('2e*3', 6 * E));
  it('2e(3) is 6e', () => expectValue('2e(3)', 6 * E));
  it('e^2 and 3e^2', () => { expectValue('e^2', E * E); expectValue('3e^2', 3 * E * E); });
  it('E (capital) is e', () => expectValue('E', E));
  it('pie is π·e and epi is e·π', () => { expectValue('pie', PI * E); expectValue('epi', PI * E); });
  it('e^-1', () => expectValue('e^-1', 1 / E));
  it('1/e', () => expectValue('1/e', 1 / E));
});

describe('roots', () => {
  it.each(['sqrt(2)', 'sqrt2', 'SQRT(2)', '√2', '√(2)', '2^(1/2)', '2**(1/2)', '2^0.5'])('%s = √2', (s) =>
    expectValue(s, Math.SQRT2));
  it('sqrt2 and sqrt(2) agree', () => expect(val('sqrt2')).toBe(val('sqrt(2)')));
  it.each(['cbrt(8)', '8^(1/3)', '∛8'])('%s = 2', (s) => expectValue(s, 2));
  it('cbrt of a negative is real', () => expectValue('cbrt(-27)', -3));
  it('2√5', () => expectValue('2√5', 2 * Math.sqrt(5)));
  it('√2π is √2·π (function grabs the next number only)', () => expectValue('√2π', Math.SQRT2 * PI));
  it('sqrt(2)/2', () => expectValue('sqrt(2)/2', Math.SQRT1_2));
  it('√(3)/2 = sin(pi/3)', () => expect(isEquivalent(val('√(3)/2'), val('sin(pi/3)'))).toBe(true));
  it('nested sqrt', () => expectValue('sqrt(sqrt(16))', 2));
});

describe('logs', () => {
  it('ln is natural log', () => { expectValue('ln(e)', 1); expectValue('ln(3)', Math.log(3)); });
  it('log is base 10', () => { expectValue('log(100)', 2); expectValue('log(1000)', 3); });
  it('ln and log differ', () => expect(val('ln(10)')).not.toBeCloseTo(val('log(10)')));
  it('log_b(x)', () => { expectValue('log_2(8)', 3); expectValue('log_3(81)', 4); expectValue('log_e(e^2)', 2); });
  it('log(x, b)', () => { expectValue('log(8, 2)', 3); expectValue('log(1/9, 3)', -2); });
  it('log_(b)(x) with a parenthesised base', () => expectValue('log_(1/2)(8)', -3));
  it('ln without parentheses', () => expectValue('ln3', Math.log(3)));
  it('ln(e^2) and 2ln(2) = ln(4)', () => { expectValue('ln(e^2)', 2); expectValue('2ln(2)', Math.log(4)); });
  it('exp(1) = e', () => expectValue('exp(1)', E));
});

describe('trig and inverse trig (radians)', () => {
  it.each([
    ['sin(pi/6)', 0.5], ['cos(pi/3)', 0.5], ['tan(pi/4)', 1], ['sec(0)', 1], ['csc(pi/2)', 1],
    ['cot(pi/4)', 1], ['arcsin(1)', PI / 2], ['asin(1/2)', PI / 6], ['arccos(0)', PI / 2],
    ['acos(-1)', PI], ['arctan(1)', PI / 4], ['atan(1)', PI / 4], ['arcsec(2)', PI / 3],
    ['sin^2(pi/4)', 0.5], ['cos(pi)', -1], ['sin pi/6', 0], ['2sin(pi/6)', 1], ['arctan(sqrt(3))', PI / 3],
  ])('%s', (s, v) => expectValue(s, v));
  it('degrees are not assumed', () => expect(val('sin(30)')).not.toBeCloseTo(0.5));
});

describe('infinity', () => {
  it.each(['inf', 'infinity', 'Infinity', '∞', 'INF'])('%s', (s) => expect(val(s)).toBe(Infinity));
  it('-inf', () => { expect(val('-inf')).toBe(-Infinity); expect(val('−∞')).toBe(-Infinity); });
  it('1/0 is rejected (type inf instead)', () => expectError('1/0'));
  it('inf - inf is rejected', () => expectError('inf-inf'));
});

describe('implicit multiplication', () => {
  it.each([
    ['2pi', 2 * PI], ['3sqrt(2)', 3 * Math.SQRT2], ['pi/4', PI / 4], ['2(3+1)', 8], ['(1/2)ln(3)', Math.log(3) / 2],
    ['4π²', 4 * PI * PI], ['(2)(3)', 6], ['2pi/3', (2 * PI) / 3], ['pi2', 2 * PI], ['3(2)^2', 12],
    ['1/2pi', PI / 2], ['1/(2pi)', 1 / (2 * PI)], ['2 pi', 2 * PI], ['sqrt(2)sqrt(3)', Math.sqrt(6)],
    ['2ln2', 2 * Math.log(2)], ['3pi^2', 3 * PI * PI], ['(1+sqrt5)/2', (1 + Math.sqrt(5)) / 2],
    ['-2pi', -2 * PI], ['pi(1/2)', PI / 2], ['4-2pi', 4 - 2 * PI],
  ])('%s', (s, v) => expectValue(s, v));
});

describe('equivalent forms', () => {
  const groups: string[][] = [
    ['1/2', '0.5', '2/4', 'sin(pi/6)', '1/(1+1)', '2^-1'],
    ['pi/4', 'π/4', '0.785398163', 'atan(1)', 'arctan(1)', '(1/4)pi'],
    ['2sqrt(5)', 'sqrt(20)', '√20', '2√5', '20^(1/2)', '4.472135955'],
    ['ln(3)', 'log_e(3)', 'log(3, e)', '1.0986122887'],
    ['3pi/4', '0.75pi', 'acos(-sqrt(2)/2)'],
  ];
  groups.forEach((g) => {
    it(g.join(' ≡ '), () => {
      const ref = val(g[0]);
      g.forEach((s) => expect(isEquivalent(val(s), ref), s).toBe(true));
    });
  });
  it('a 6-sig-fig decimal of pi/4 is accepted but a 4-sig-fig one is not', () => {
    expect(isEquivalent(val('0.785398'), PI / 4)).toBe(true);
    expect(isEquivalent(val('0.7854'), PI / 4)).toBe(false);
  });
});

describe('friendly errors (never cost a guess)', () => {
  it.each(['', '   ', 'x', 'x+1', '2 3', '(', '())', '2+', '*3', 'sqrt()', 'sqrt', 'sin(', '1..2', 'log_2',
    'abc', 'sqrt(-1)', 'arcsin(2)', 'ln(0)', '0/0', '2,3', '#', '$5'])('rejects %j', (s) => expectError(s));
  it('error messages are human readable', () => {
    const r = parseAnswer('x+1');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/variable/i);
  });
});

describe('TeX preview', () => {
  it.each([
    ['3pi/4', '\\pi'], ['sqrt(2)', '\\sqrt{2}'], ['ln(3)', '\\ln'], ['log(100)', '\\log_{10}'],
    ['log_2(8)', '\\log_{2}'], ['inf', '\\infty'], ['arctan(1)', '\\tan^{-1}'],
  ])('%s renders with %s', (s, frag) => {
    const r = parseAnswer(s);
    expect(r.ok && r.tex.includes(frag)).toBe(true);
  });
  it('drops the dot in 2π but keeps it before fractions', () => {
    const a = parseAnswer('2pi');
    const b = parseAnswer('2(1/2)');
    expect(a.ok && a.tex).toBe('2\\pi');
    expect(b.ok && b.tex.includes('\\cdot\\frac')).toBe(true);
  });
});
