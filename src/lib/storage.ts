import type { DayState, Difficulty, Problem } from '../types';
import { scoreProblem } from './scoring';

const KEY_STATE = 'mathdle:state:v1';
const KEY_HISTORY = 'mathdle:history:v1';
const KEY_THEME = 'mathdle:theme';
const KEY_SEEN_HELP = 'mathdle:seenHelp';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode etc.) – the game still works for this session */
  }
}

export function loadDayState(day: number): DayState | null {
  const s = read<DayState | null>(KEY_STATE, null);
  return s && s.day === day ? s : null;
}
export function saveDayState(s: DayState) { write(KEY_STATE, s); }

/** One finished-or-in-progress day, condensed for stats. */
export interface DayRecord {
  day: number;
  results: {
    difficulty: Difficulty;
    status: 'playing' | 'solved' | 'failed';
    guesses: number;
    hints: number;
    elapsedMs: number;
    score: number;
  }[];
}
export type History = Record<number, DayRecord>;

export function loadHistory(): History { return read<History>(KEY_HISTORY, {}); }

export function recordDay(state: DayState, problems: Problem[]): History {
  const history = loadHistory();
  history[state.day] = {
    day: state.day,
    results: state.problems.map((p, i) => ({
      difficulty: problems[i].difficulty,
      status: p.status,
      guesses: p.guesses.length,
      hints: p.hintsUsed,
      elapsedMs: Math.round(p.elapsedMs),
      score: scoreProblem(p, problems[i].difficulty).total,
    })),
  };
  write(KEY_HISTORY, history);
  return history;
}

export function loadTheme(): 'light' | 'dark' | null { return read(KEY_THEME, null); }
export function saveTheme(t: 'light' | 'dark' | null) { write(KEY_THEME, t); }
export function hasSeenHelp(): boolean { return read(KEY_SEEN_HELP, false); }
export function markHelpSeen() { write(KEY_SEEN_HELP, true); }
