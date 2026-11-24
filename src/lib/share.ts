import type { DayState, Problem } from '../types';
import { formatDuration, MAX_DAILY_SCORE, scoreProblem } from './scoring';

const CIRCLED = ['①', '②', '③'];
const SQUARE = { correct: '🟩', close: '🟨', wrong: '🟥' } as const;

/** Wordle-style, spoiler-free summary. */
export function shareText(state: DayState, problems: Problem[], url?: string): string {
  const solved = state.problems.filter((p) => p.status === 'solved').length;
  const total = state.problems.reduce((s, p, i) => s + scoreProblem(p, problems[i].difficulty).total, 0);
  const lines = [`Mathdle #${state.day + 1} — ${solved}/3 · ${Math.round(total * 10) / 10}/${MAX_DAILY_SCORE} pts`];
  state.problems.forEach((p, i) => {
    const squares = p.guesses.length ? p.guesses.map((g) => SQUARE[g.mark]).join('') : '⬜';
    const hints = p.hintsUsed ? ' ' + '💡'.repeat(p.hintsUsed) : '';
    const time = p.status !== 'playing' ? ` ⏱${formatDuration(p.elapsedMs)}` : '';
    lines.push(`${CIRCLED[i]} ${squares}${hints}${time}`);
  });
  if (url) lines.push(url);
  return lines.join('\n');
}
