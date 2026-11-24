import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DayState, Problem, ProblemState } from './types';
import easyBank from '../data/problems/easy.json';
import mediumBank from '../data/problems/medium.json';
import hardBank from '../data/problems/hard.json';
import { dayIndex, problemsForDay, type Banks } from './lib/daily';
import { answerValue, judge } from './lib/check';
import { MAX_DAILY_SCORE, MAX_GUESSES, MAX_HINTS, scoreProblem } from './lib/scoring';
import { hasSeenHelp, loadDayState, loadHistory, loadTheme, markHelpSeen, recordDay, saveDayState, saveTheme } from './lib/storage';
import { computeStats } from './lib/stats';
import { shareText } from './lib/share';
import { ProblemCard } from './components/ProblemCard';
import { HelpModal } from './components/HelpModal';
import { StatsModal, ShareButton } from './components/StatsModal';
import { Countdown } from './components/Countdown';

const BANKS: Banks = {
  easy: easyBank as Problem[],
  medium: mediumBank as Problem[],
  hard: hardBank as Problem[],
};
const ALL = new Map([...BANKS.easy, ...BANKS.medium, ...BANKS.hard].map((p) => [p.id, p]));
const LABEL = ['Easy', 'Medium', 'Hard'];
const STATUS_ICON = { playing: '', solved: '✓', failed: '✗' } as const;

function freshState(day: number, problems: Problem[]): DayState {
  return {
    day,
    problems: problems.map((p) => ({ id: p.id, guesses: [], hintsUsed: 0, status: 'playing', started: false, elapsedMs: 0 })),
  };
}

function loadDay(day: number): { problems: Problem[]; state: DayState } {
  const saved = loadDayState(day);
  // Keep a started day's problems even if a redeploy changed the bank mid-day.
  if (saved && saved.problems.length === 3 && saved.problems.every((p) => ALL.has(p.id))) {
    return { problems: saved.problems.map((p) => ALL.get(p.id)!), state: saved };
  }
  const problems = problemsForDay(day, BANKS);
  return { problems, state: freshState(day, problems) };
}

export default function App() {
  const [{ problems, state }, setGame] = useState(() => loadDay(dayIndex()));
  const [tab, setTab] = useState(0);
  const [helpOpen, setHelpOpen] = useState(() => !hasSeenHelp());
  const [statsOpen, setStatsOpen] = useState(false);
  const [theme, setTheme] = useState(loadTheme);
  const [history, setHistory] = useState(loadHistory);

  useEffect(() => {
    if (theme) document.documentElement.dataset.theme = theme;
    else delete document.documentElement.dataset.theme;
  }, [theme]);

  const update = useCallback((fn: (p: ProblemState) => ProblemState, i: number) => {
    setGame((g) => {
      const next: DayState = { ...g.state, problems: g.state.problems.map((p, j) => (j === i ? fn(p) : p)) };
      saveDayState(next);
      return { ...g, state: next };
    });
  }, []);

  // Record history whenever there has been real activity.
  useEffect(() => {
    if (state.problems.some((p) => p.guesses.length > 0)) setHistory(recordDay(state, problems));
  }, [state, problems]);

  // ---- Timer: runs for the visible tab while the problem is open, the page is visible and no modal is up.
  const tick = useRef(performance.now());
  const modalOpen = helpOpen || statsOpen;
  useEffect(() => {
    tick.current = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const dt = now - tick.current;
      tick.current = now;
      if (document.hidden || modalOpen) return;
      setGame((g) => {
        const p = g.state.problems[tab];
        if (!p.started || p.status !== 'playing') return g;
        const next: DayState = {
          ...g.state,
          problems: g.state.problems.map((q, j) => (j === tab ? { ...q, elapsedMs: q.elapsedMs + Math.min(dt, 5000) } : q)),
        };
        saveDayState(next);
        return { ...g, state: next };
      });
    }, 1000);
    const onVis = () => { tick.current = performance.now(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
  }, [tab, modalOpen]);

  const rollover = useCallback(() => {
    const d = dayIndex();
    setGame((g) => (g.state.day === d ? g : loadDay(d)));
    setTab(0);
  }, []);

  const dayDone = state.problems.every((p) => p.status !== 'playing');
  const prevDone = useRef(dayDone);
  useEffect(() => {
    if (dayDone && !prevDone.current) {
      const t = setTimeout(() => setStatsOpen(true), 1800);
      return () => clearTimeout(t);
    }
    prevDone.current = dayDone;
  }, [dayDone]);

  const stats = useMemo(() => computeStats(history, state.day), [history, state.day]);
  const share = shareText(state, problems, typeof location !== 'undefined' ? location.href.split('#')[0] : undefined);
  const total = Math.round(state.problems.reduce((s, p, i) => s + scoreProblem(p, problems[i].difficulty).total, 0) * 10) / 10;

  function guess(i: number, input: string, value: number) {
    const answer = answerValue(problems[i].answerNumeric);
    const fb = judge(value, answer);
    update((p) => {
      if (p.status !== 'playing') return p;
      const guesses = [...p.guesses, { input, value, mark: fb.mark, direction: fb.direction }];
      const status = fb.mark === 'correct' ? 'solved' : guesses.length >= MAX_GUESSES ? 'failed' : 'playing';
      return { ...p, guesses, status };
    }, i);
  }

  function onTabKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const n = (tab + (e.key === 'ArrowRight' ? 1 : 2)) % 3;
      setTab(n);
      document.getElementById(`tab-${n}`)?.focus();
    }
  }

  return (
    <>
      <a href="#main" className="skip-link">Skip to problem</a>
      <header className="topbar">
        <button className="icon-btn" onClick={() => setHelpOpen(true)} aria-label="How to play">?</button>
        <h1 className="logo">Mathdle</h1>
        <div className="topbar-right">
          <button className="icon-btn" onClick={() => setStatsOpen(true)} aria-label="Statistics">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M4 20h4V10H4zm6 0h4V4h-4zm6 0h4v-7h-4z" /></svg>
          </button>
          <button
            className="icon-btn"
            onClick={() => {
              const dark = theme ? theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
              const t = dark ? 'light' : 'dark';
              setTheme(t);
              saveTheme(t);
            }}
            aria-label="Toggle dark mode"
            aria-pressed={(theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark'}
          >
            {(theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark' ? (
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="currentColor" /><g stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></g></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z" /></svg>
            )}
          </button>
        </div>
      </header>

      <main id="main" className="container">
        <p className="subhead muted">
          #{state.day + 1} · {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} · {total}/{MAX_DAILY_SCORE} pts
        </p>
        <div role="tablist" aria-label="Today's problems" className="tabs" onKeyDown={onTabKey}>
          {problems.map((p, i) => {
            const s = state.problems[i];
            return (
              <button
                key={p.id}
                id={`tab-${i}`}
                role="tab"
                aria-selected={tab === i}
                aria-controls={`panel-${i}`}
                tabIndex={tab === i ? 0 : -1}
                className={`tab ${s.status}`}
                onClick={() => setTab(i)}
              >
                <span className="tab-num">{i + 1}</span>
                <span>{LABEL[i]}</span>
                {s.status !== 'playing' && (
                  <span className="tab-status" aria-label={s.status === 'solved' ? 'solved' : 'not solved'}>{STATUS_ICON[s.status]}</span>
                )}
              </button>
            );
          })}
        </div>
        {problems.map((p, i) => (
          <div key={p.id} role="tabpanel" id={`panel-${i}`} aria-labelledby={`tab-${i}`} hidden={tab !== i}>
            {tab === i && (
              <ProblemCard
                problem={p}
                state={state.problems[i]}
                index={i}
                onStart={() => update((s) => ({ ...s, started: true }), i)}
                onGuess={(input, value) => guess(i, input, value)}
                onHint={() => update((s) => ({ ...s, hintsUsed: Math.min(MAX_HINTS, s.hintsUsed + 1) }), i)}
              />
            )}
          </div>
        ))}
        {dayDone && (
          <section className="card done-card" aria-label="Day complete">
            <p><strong>All done for today!</strong> You scored {total} of {MAX_DAILY_SCORE}.</p>
            <ShareButton text={share} />
          </section>
        )}
        <footer className="footer">
          <Countdown onRollover={rollover} />
        </footer>
      </main>

      <HelpModal open={helpOpen} onClose={() => { setHelpOpen(false); markHelpSeen(); }} />
      <StatsModal open={statsOpen} onClose={() => setStatsOpen(false)} stats={stats} shareText={share} dayDone={dayDone} />
    </>
  );
}
