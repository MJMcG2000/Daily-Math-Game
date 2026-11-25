import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Difficulty, Problem, ProblemState } from '../types';
import type { Banks } from '../lib/daily';
import { answerValue, judge } from '../lib/check';
import { MAX_GUESSES, MAX_HINTS } from '../lib/scoring';
import {
  drawProblem, freshProblemState, loadEndless, practiceDifficulty, saveEndless, survivalDifficulty,
  survivalShareText, touched, type EndlessData, type EndlessKind, type EndlessRun, type PracticePool,
} from '../lib/endless';
import { ProblemCard } from './ProblemCard';
import { ShareButton } from './StatsModal';

const LABEL: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const POOLS: { id: PracticePool; label: string }[] = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
  { id: 'mixed', label: 'Mixed' },
];

export function Endless({ banks, dailyIds }: { banks: Banks; dailyIds: string[] }) {
  const [data, setData] = useState<EndlessData>(loadEndless);
  const [kind, setKind] = useState<EndlessKind>('practice');
  const byId = useMemo(() => new Map([...banks.easy, ...banks.medium, ...banks.hard].map((p) => [p.id, p])), [banks]);

  const update = useCallback((fn: (d: EndlessData) => EndlessData) => {
    setData((d) => {
      const next = fn(d);
      saveEndless(next);
      return next;
    });
  }, []);

  /** Draw a new problem of the given difficulty, never today's daily problems or the one just played. */
  const draw = useCallback(
    (d: EndlessData, difficulty: Difficulty, lastId?: string): { d: EndlessData; problem: Problem } => {
      const exclude = new Set([...dailyIds, ...(lastId ? [lastId] : [])]);
      const { problem, queues } = drawProblem(difficulty, banks, d.queues, exclude);
      return { d: { ...d, queues }, problem };
    },
    [banks, dailyIds],
  );

  const startPractice = useCallback(
    (pool: PracticePool, keepStreak: boolean) =>
      update((d) => {
        const { d: d2, problem } = draw(d, practiceDifficulty(pool), d.practice?.problemId);
        const count = keepStreak ? d.practice?.count ?? 0 : 0;
        return { ...d2, practicePool: pool, practice: { problemId: problem.id, ps: freshProblemState(problem.id), count } };
      }),
    [draw, update],
  );

  const startSurvival = useCallback(
    () =>
      update((d) => {
        const { d: d2, problem } = draw(d, survivalDifficulty(0), d.survival?.problemId);
        return { ...d2, survival: { problemId: problem.id, ps: freshProblemState(problem.id), count: 0 } };
      }),
    [draw, update],
  );

  // First visit to Practice: deal a problem straight away.
  useEffect(() => {
    if (kind === 'practice' && (!data.practice || !byId.has(data.practice.problemId))) startPractice(data.practicePool, false);
  }, [kind, data.practice, data.practicePool, byId, startPractice]);

  const run = kind === 'practice' ? data.practice : data.survival;
  const problem = run ? byId.get(run.problemId) : undefined;

  function applyToRun(fn: (r: EndlessRun) => EndlessRun) {
    update((d) => {
      const r = kind === 'practice' ? d.practice : d.survival;
      if (!r) return d;
      const nextRun = fn(r);
      let next: EndlessData = kind === 'practice' ? { ...d, practice: nextRun } : { ...d, survival: nextRun };
      // Bookkeeping when a problem finishes.
      if (r.ps.status === 'playing' && nextRun.ps.status !== 'playing') {
        const diff = byId.get(r.problemId)!.difficulty;
        const solved = nextRun.ps.status === 'solved';
        if (kind === 'practice') {
          const count = solved ? r.count + 1 : 0;
          next = {
            ...next,
            practice: { ...nextRun, count },
            bestPractice: Math.max(d.bestPractice, count),
            practiceAttempted: { ...d.practiceAttempted, [diff]: d.practiceAttempted[diff] + 1 },
            practiceSolved: { ...d.practiceSolved, [diff]: d.practiceSolved[diff] + (solved ? 1 : 0) },
          };
        } else {
          const count = solved ? r.count + 1 : r.count;
          next = {
            ...next,
            survival: { ...nextRun, count, over: !solved },
            bestSurvival: Math.max(d.bestSurvival, count),
          };
        }
      }
      return next;
    });
  }

  function guess(input: string, value: number) {
    if (!problem) return;
    const fb = judge(value, answerValue(problem.answerNumeric));
    applyToRun((r) => {
      if (r.ps.status !== 'playing') return r;
      const guesses = [...r.ps.guesses, { input, value, mark: fb.mark, direction: fb.direction }];
      const status: ProblemState['status'] = fb.mark === 'correct' ? 'solved' : guesses.length >= MAX_GUESSES ? 'failed' : 'playing';
      return { ...r, ps: { ...r.ps, guesses, status } };
    });
  }

  function hint() {
    applyToRun((r) => ({ ...r, ps: { ...r.ps, hintsUsed: Math.min(MAX_HINTS, r.ps.hintsUsed + 1) } }));
  }

  function nextSurvival() {
    update((d) => {
      if (!d.survival) return d;
      const { d: d2, problem: p } = draw(d, survivalDifficulty(d.survival.count), d.survival.problemId);
      return { ...d2, survival: { problemId: p.id, ps: freshProblemState(p.id), count: d.survival.count } };
    });
  }

  function choosePool(pool: PracticePool) {
    if (pool === data.practicePool && data.practice?.ps.status === 'playing') return;
    const unfinished = data.practice && data.practice.ps.status === 'playing' && touched(data.practice.ps);
    if (unfinished && !confirm('Switching difficulty skips this problem and resets your streak. Continue?')) return;
    startPractice(pool, !unfinished);
  }

  function skip() {
    if (!data.practice) return;
    if (touched(data.practice.ps) && !confirm('Skipping a problem you have started resets your streak. Skip?')) return;
    startPractice(data.practicePool, !touched(data.practice.ps));
  }

  const done = run?.ps.status !== 'playing';
  const total = (r: Record<Difficulty, number>) => r.easy + r.medium + r.hard;

  return (
    <section aria-label="Endless mode">
      <div className="segmented" role="radiogroup" aria-label="Endless mode type">
        {(['practice', 'survival'] as const).map((k) => (
          <button key={k} role="radio" aria-checked={kind === k} className={kind === k ? 'on' : ''} onClick={() => setKind(k)}>
            {k === 'practice' ? 'Practice' : 'Survival'}
          </button>
        ))}
      </div>

      {kind === 'practice' && (
        <>
          <div className="chips" role="radiogroup" aria-label="Practice difficulty">
            {POOLS.map((p) => (
              <button
                key={p.id}
                role="radio"
                aria-checked={data.practicePool === p.id}
                className={`chip-btn ${data.practicePool === p.id ? 'on' : ''}`}
                onClick={() => choosePool(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="endless-stats muted">
            Streak <strong>{data.practice?.count ?? 0}</strong> · Best <strong>{data.bestPractice}</strong> · Solved{' '}
            <strong>{total(data.practiceSolved)}</strong> of {total(data.practiceAttempted)}
          </p>
        </>
      )}

      {kind === 'survival' && (
        <p className="endless-stats muted">
          {data.survival && !data.survival.over
            ? <>Problem <strong>{data.survival.count + (data.survival.ps.status === 'solved' ? 0 : 1)}</strong> · Solved <strong>{data.survival.count}</strong> · Best <strong>{data.bestSurvival}</strong></>
            : <>Best run <strong>{data.bestSurvival}</strong></>}
        </p>
      )}

      {kind === 'survival' && (!data.survival || data.survival.over) && (
        <section className="card start-card">
          {data.survival?.over ? (
            <>
              <h2 className="card-title">Run over</h2>
              <p>You solved <strong>{data.survival.count}</strong> {data.survival.count === 1 ? 'problem' : 'problems'}.{' '}
                {data.survival.count >= data.bestSurvival && data.survival.count > 0 ? 'New best! 🎉' : `Your best is ${data.bestSurvival}.`}</p>
              <div className="row center">
                <button className="btn primary big" onClick={startSurvival}>Start a new run</button>
                <ShareButton text={survivalShareText(data.survival.count, data.bestSurvival, location.href.split('#')[0])} />
              </div>
            </>
          ) : (
            <>
              <h2 className="card-title">Survival</h2>
              <p>Problems 1–3 are Easy, 4–6 are Medium, and everything after that is Hard. You get the usual 3 guesses and 2 hints each. The run ends at the first problem you don&apos;t solve.</p>
              <button className="btn primary big" onClick={startSurvival}>Start run</button>
            </>
          )}
        </section>
      )}

      {problem && run && (
        <>
          {/* In Survival, a finished run keeps showing the missed problem so its solution can be read. */}
          {(
            <ProblemCard
              key={`${kind}-${run.problemId}`}
              problem={problem}
              state={run.ps}
              index={0}
              scored={false}
              title={kind === 'practice' ? `Practice · ${LABEL[problem.difficulty]}` : `Problem ${run.count + (run.ps.status === 'solved' ? 0 : 1)} · ${LABEL[problem.difficulty]}`}
              onGuess={guess}
              onHint={hint}
            />
          )}
          <div className="row center endless-actions">
            {kind === 'practice' && (done
              ? <button className="btn primary big" onClick={() => startPractice(data.practicePool, true)}>Next problem →</button>
              : <button className="btn ghost" onClick={skip}>Skip problem</button>)}
            {kind === 'survival' && data.survival && !data.survival.over && done && (
              <button className="btn primary big" onClick={nextSurvival}>
                Next: problem {data.survival.count + 1} ({LABEL[survivalDifficulty(data.survival.count)]}) →
              </button>
            )}
          </div>
        </>
      )}
      <p className="small muted center">Endless mode doesn&apos;t count toward daily stats, and never shows today&apos;s daily problems.</p>
    </section>
  );
}
