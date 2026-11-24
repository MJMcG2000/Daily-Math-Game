import type { Problem } from '../types';

/** Puzzle #1 is this local calendar date. Change it before launch if you like. */
export const EPOCH = { year: 2026, month: 11, day: 24 };
const MS_PER_DAY = 86_400_000;

/** Days since the epoch, using the player's *local* calendar date. Puzzle number = dayIndex + 1. */
export function dayIndex(now: Date = new Date()): number {
  const local = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const epoch = Date.UTC(EPOCH.year, EPOCH.month - 1, EPOCH.day);
  return Math.round((local - epoch) / MS_PER_DAY);
}

export function msUntilNextPuzzle(now: Date = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}

/** FNV-1a string hash → 32-bit seed. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 PRNG. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const out = items.slice();
  const rand = rng(hashString(seed));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * The n-th pick from a pool. Each pass through the pool ("cycle") is its own seeded
 * shuffle, so nothing repeats until every problem in the pool has been used.
 * Problems are sorted by id first so that the order of entries in the JSON file
 * doesn't matter.
 */
export function pickFromPool(pool: readonly Problem[], n: number, seed: string): Problem {
  if (!pool.length) throw new Error(`Empty problem pool: ${seed}`);
  const sorted = pool.slice().sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const size = sorted.length;
  const k = ((n % size) + size) % size;
  const cycle = Math.floor(n / size);
  return seededShuffle(sorted, `${seed}:${cycle}`)[k];
}

export interface Banks {
  easy: readonly Problem[];
  medium: readonly Problem[];
  hard: readonly Problem[];
}

/** The three problems for a given day. Hard alternates Calc 1 (even days) and Calc 2 (odd days). */
export function problemsForDay(day: number, banks: Banks): [Problem, Problem, Problem] {
  const easy = pickFromPool(banks.easy, day, 'mathdle-easy');
  const medium = pickFromPool(banks.medium, day, 'mathdle-medium');
  const calc2Day = ((day % 2) + 2) % 2 === 1;
  const course = calc2Day ? 'calc2' : 'calc1';
  let pool: readonly Problem[] = banks.hard.filter((p) => p.course === course);
  if (!pool.length) pool = banks.hard; // fall back if a course pool is empty
  const hard = pickFromPool(pool, Math.floor(day / 2), `mathdle-hard-${course}`);
  return [easy, medium, hard];
}
