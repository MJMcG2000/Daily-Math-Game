/**
 * Mathdle answer parser.
 *
 * Pipeline:  raw input → normalize() → tokenize() → recursive-descent parse → canonical
 * mathjs expression string → mathjs parse/evaluate (+ toTex for the live preview).
 *
 * We tokenize and parse ourselves (rather than handing the raw string to mathjs) so that
 * implicit multiplication, `e` vs scientific notation, `sqrt2`, `log_b(x)` and friends
 * behave exactly as documented, and so that error messages are friendly.
 *
 * Rules worth knowing (also shown in the in-game help):
 *  - `e` is Euler's number. `2e` = 2·e, `epi` = e·π.
 *  - Scientific notation is a number immediately followed by `e` and an integer exponent:
 *    `1e3` = 1000, `2.5e-4` = 0.00025. `2e+1` is NOT scientific notation: it is 2·e + 1.
 *    To multiply by e then by a number, write `2e*3` or `2e(3)`.
 *  - `ln(x)` is the natural log, `log(x)` is base 10, `log_b(x)` and `log(x, b)` are base b.
 *  - A function name without parentheses takes the next number/constant (with its exponent):
 *    `sqrt2` = √2, `ln3` = ln 3, `√2π` = √2·π, `ln x^2` style means ln(x²).
 *  - Implicit multiplication has the same precedence as `*` and `/`, evaluated left to right:
 *    `pi/4` = π/4, `1/2pi` = (1/2)·π. Use parentheses for 1/(2π).
 *  - `sin^2(x)` means (sin x)².  All angles are in radians.
 *  - `^` and `**` are both exponentiation, right-associative. `-2^2` = -4.
 */
import {
  create, type MathNode,
  parseDependencies, evaluateDependencies,
  addDependencies, subtractDependencies, multiplyDependencies, divideDependencies,
  powDependencies, unaryMinusDependencies, unaryPlusDependencies,
  sqrtDependencies, cbrtDependencies, logDependencies, log10Dependencies, expDependencies, absDependencies,
  sinDependencies, cosDependencies, tanDependencies, secDependencies, cscDependencies, cotDependencies,
  asinDependencies, acosDependencies, atanDependencies, asecDependencies, acscDependencies, acotDependencies,
  piDependencies, eDependencies, InfinityDependencies,
} from 'mathjs';

// Only pull in what the answer syntax can produce, to keep the bundle small.
const math = create({
  parseDependencies, evaluateDependencies,
  addDependencies, subtractDependencies, multiplyDependencies, divideDependencies,
  powDependencies, unaryMinusDependencies, unaryPlusDependencies,
  sqrtDependencies, cbrtDependencies, logDependencies, log10Dependencies, expDependencies, absDependencies,
  sinDependencies, cosDependencies, tanDependencies, secDependencies, cscDependencies, cotDependencies,
  asinDependencies, acosDependencies, atanDependencies, asecDependencies, acscDependencies, acotDependencies,
  piDependencies, eDependencies, InfinityDependencies,
}, {});

// ---------------------------------------------------------------- normalize

const SUPERSCRIPTS: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+',
};

/** Convert Unicode math symbols to parser syntax and lowercase names. Whitespace is kept
 *  (collapsed to single spaces) because the tokenizer uses it as a separator. */
export function normalize(raw: string): string {
  // NFKC would turn superscript digits into plain digits and lose the exponent,
  // so convert superscripts first.
  let s = raw
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/g, (m) => '^(' + [...m].map((c) => SUPERSCRIPTS[c]).join('') + ')')
    .normalize('NFKC');
  s = s
    .replace(/[π𝜋𝝅Π]/g, ' pi ')
    .replace(/∞/g, ' inf ')
    .replace(/∛/g, ' cbrt ')
    .replace(/√/g, ' sqrt ')
    .replace(/[·×∙⋅•✕]/g, '*')
    .replace(/[÷∕⁄]/g, '/')
    .replace(/[−–—‒﹣]/g, '-')
    .replace(/[[{]/g, '(')
    .replace(/[\]}]/g, ')')
    .replace(/\*\*/g, '^')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  return s;
}

// ---------------------------------------------------------------- tokenize

type Tok =
  | { t: 'num'; v: string }
  | { t: 'const'; v: 'pi' | 'e' | 'inf' }
  | { t: 'fn'; v: string }
  | { t: 'op'; v: '+' | '-' | '*' | '/' | '^' }
  | { t: 'lp' }
  | { t: 'rp' }
  | { t: 'comma' }
  | { t: 'under' };

/** Function names as typed → mathjs function names. */
const FUNCS: Record<string, string> = {
  sqrt: 'sqrt', cbrt: 'cbrt', ln: 'log', log: 'log10', exp: 'exp', abs: 'abs',
  sin: 'sin', cos: 'cos', tan: 'tan', sec: 'sec', csc: 'csc', cot: 'cot',
  arcsin: 'asin', asin: 'asin', arccos: 'acos', acos: 'acos', arctan: 'atan', atan: 'atan',
  arcsec: 'asec', asec: 'asec', arccsc: 'acsc', acsc: 'acsc', arccot: 'acot', acot: 'acot',
};
const CONSTS: Record<string, 'pi' | 'e' | 'inf'> = { pi: 'pi', e: 'e', inf: 'inf', infinity: 'inf' };
// Longest names first so greedy matching prefers "infinity" over "inf", "arcsin" over "asin", etc.
const NAMES = [...Object.keys(FUNCS), ...Object.keys(CONSTS)].sort((a, b) => b.length - a.length);

export class ParseError extends Error {}

function splitLetters(word: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < word.length) {
    const name = NAMES.find((n) => word.startsWith(n, i));
    if (!name) {
      const rest = word.slice(i);
      throw new ParseError(
        rest.length === 1
          ? `Unknown symbol "${rest}". Answers are numbers, so variables aren't allowed.`
          : `I don't recognise "${rest}". Try pi, e, sqrt, ln, log, sin, arctan, inf…`,
      );
    }
    out.push(name in FUNCS ? { t: 'fn', v: name } : { t: 'const', v: CONSTS[name] });
    i += name.length;
  }
  return out;
}

export function tokenize(s: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ') { i++; continue; }
    if (/[0-9.]/.test(c)) {
      const m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
      if (!m) throw new ParseError('A lone "." isn\'t a number.');
      let num = m[1];
      i += num.length;
      if (s[i] === '.') throw new ParseError(`"${num}." has too many decimal points.`);
      // Scientific notation: e immediately followed by digits or by "-" and digits.
      const sci = /^e(-?\d+)/.exec(s.slice(i));
      if (sci) { num += 'e' + sci[1]; i += sci[0].length; }
      if (toks.length && toks[toks.length - 1].t === 'num') {
        throw new ParseError('Two numbers in a row. Did you mean to put an operator between them?');
      }
      toks.push({ t: 'num', v: num });
      continue;
    }
    if (/[a-z]/.test(c)) {
      const m = /^[a-z]+/.exec(s.slice(i))!;
      toks.push(...splitLetters(m[0]));
      i += m[0].length;
      continue;
    }
    switch (c) {
      case '+': case '-': case '*': case '/': case '^':
        toks.push({ t: 'op', v: c }); break;
      case '(': toks.push({ t: 'lp' }); break;
      case ')': toks.push({ t: 'rp' }); break;
      case ',': toks.push({ t: 'comma' }); break;
      case '_': toks.push({ t: 'under' }); break;
      default:
        throw new ParseError(`Unexpected character "${c}".`);
    }
    i++;
  }
  return toks;
}

// ---------------------------------------------------------------- parse

/** Recursive-descent parser that emits a fully parenthesised mathjs expression string. */
class Parser {
  private i = 0;
  constructor(private toks: Tok[]) {}

  private peek(): Tok | undefined { return this.toks[this.i]; }
  private next(): Tok | undefined { return this.toks[this.i++]; }
  private isOp(v: string) { const t = this.peek(); return t?.t === 'op' && t.v === v; }

  parse(): string {
    if (!this.toks.length) throw new ParseError('Type an answer first.');
    const e = this.expr();
    const t = this.peek();
    if (t) {
      if (t.t === 'rp') throw new ParseError('There\'s an extra ")".');
      if (t.t === 'comma') throw new ParseError('Unexpected ",". Commas only go inside log(x, b).');
      throw new ParseError('Something looks out of place. Check the operators and parentheses.');
    }
    return e;
  }

  private expr(): string {
    let left = this.term();
    while (this.isOp('+') || this.isOp('-')) {
      const op = (this.next() as { v: string }).v;
      left = `(${left} ${op} ${this.term()})`;
    }
    return left;
  }

  private startsAtom(t: Tok | undefined): boolean {
    return !!t && (t.t === 'num' || t.t === 'const' || t.t === 'fn' || t.t === 'lp');
  }

  private term(): string {
    let left = this.unary();
    for (;;) {
      if (this.isOp('*') || this.isOp('/')) {
        const op = (this.next() as { v: string }).v;
        left = `(${left} ${op} ${this.unary()})`;
      } else if (this.startsAtom(this.peek())) {
        // Implicit multiplication. A bare number right after something like "pi" is fine
        // ("pi2" → π·2) but we disallow "2 3" in the tokenizer.
        left = `(${left} * ${this.power()})`;
      } else {
        return left;
      }
    }
  }

  private unary(): string {
    if (this.isOp('-')) { this.next(); return `(-${this.unary()})`; }
    if (this.isOp('+')) { this.next(); return this.unary(); }
    return this.power();
  }

  private power(): string {
    const base = this.atom();
    if (this.isOp('^')) {
      this.next();
      if (!this.peek()) throw new ParseError('The exponent is missing after "^".');
      return `(${base} ^ ${this.unary()})`;
    }
    return base;
  }

  private atom(): string {
    const t = this.next();
    if (!t) throw new ParseError('The answer ends too early. Is something missing?');
    switch (t.t) {
      case 'num': return t.v;
      case 'const': return t.v === 'inf' ? 'Infinity' : t.v;
      case 'lp': {
        if (this.peek()?.t === 'rp') throw new ParseError('Empty parentheses "()".');
        const e = this.expr();
        if (this.next()?.t !== 'rp') throw new ParseError('A "(" is missing its closing ")".');
        return e;
      }
      case 'fn': return this.func(t.v);
      case 'rp': throw new ParseError('There\'s a ")" without a matching "(".');
      case 'op': throw new ParseError(`"${t.v}" needs something before it.`);
      case 'comma': throw new ParseError('Unexpected ",".');
      case 'under': throw new ParseError('"_" is only used for log bases, like log_2(8).');
    }
  }

  private func(name: string): string {
    const mjs = FUNCS[name];
    // log_b(x)
    let base: string | null = null;
    if (this.peek()?.t === 'under') {
      if (name !== 'log') throw new ParseError('"_" is only used for log bases, like log_2(8).');
      this.next();
      if (!this.peek()) throw new ParseError('log_ needs a base, like log_2(8).');
      base = this.atom();
    }
    // sin^2(x) → (sin x)^2
    let outerPow: string | null = null;
    if (this.isOp('^')) {
      this.next();
      outerPow = this.unary();
    }
    let arg: string;
    if (this.peek()?.t === 'lp') {
      this.next();
      if (this.peek()?.t === 'rp') throw new ParseError(`${name}() needs something inside the parentheses.`);
      arg = this.expr();
      if (this.peek()?.t === 'comma') {
        this.next();
        if (name !== 'log' || base !== null) throw new ParseError(`${name} only takes one input.`);
        base = this.expr();
      }
      if (this.next()?.t !== 'rp') throw new ParseError(`${name}( is missing its closing ")".`);
    } else {
      if (!this.peek() || !this.startsAtom(this.peek()) && !this.isOp('-')) {
        throw new ParseError(`${name} needs an input, like ${name}(2).`);
      }
      arg = this.isOp('-') ? (this.next(), `(-${this.power()})`) : this.power();
    }
    let call: string;
    if (base !== null) call = `log(${arg}, ${base})`;
    else call = `${mjs}(${arg})`;
    return outerPow !== null ? `(${call} ^ ${outerPow})` : call;
  }
}

// ---------------------------------------------------------------- public API

export type ParseResult =
  | { ok: true; value: number; tex: string; expr: string }
  | { ok: false; error: string };

export function toMathjs(input: string): string {
  return new Parser(tokenize(normalize(input))).parse();
}

/** Parse and evaluate a player's answer. Never throws. */
export function parseAnswer(input: string): ParseResult {
  try {
    const expr = toMathjs(input);
    const node: MathNode = math.parse(expr);
    let raw: unknown;
    try {
      raw = node.evaluate();
    } catch {
      return { ok: false, error: 'That can\'t be evaluated. Check the function inputs.' };
    }
    let value: number;
    if (typeof raw === 'number') value = raw;
    else if (raw && typeof raw === 'object' && 're' in raw && 'im' in raw) {
      const c = raw as { re: number; im: number };
      if (Math.abs(c.im) > 1e-12 * Math.max(1, Math.abs(c.re))) {
        return { ok: false, error: 'That isn\'t a real number (it has an imaginary part).' };
      }
      value = c.re;
    } else {
      return { ok: false, error: 'That doesn\'t evaluate to a single number.' };
    }
    if (Number.isNaN(value)) return { ok: false, error: 'That isn\'t a defined number (for example ∞ − ∞ or 0/0).' };
    if (!Number.isFinite(value) && !expr.includes('Infinity')) {
      return { ok: false, error: 'That divides by zero or is too large. Type inf or ∞ for infinity.' };
    }
    const tex = node.toTex({ parenthesis: 'auto', implicit: 'hide' })
      .replace(/Infinity/g, '\\infty')
      .replace(/\\mathrm\{Infinity\}/g, '\\infty')
      // "2\cdot\pi" → "2\pi": drop the dot after a number when a non-digit follows.
      .replace(/(\d)\\cdot(?![\d{]|\\frac)/g, '$1');
    return { ok: true, value, tex, expr };
  } catch (err) {
    if (err instanceof ParseError) return { ok: false, error: err.message };
    return { ok: false, error: 'I couldn\'t read that. Check the operators and parentheses.' };
  }
}
