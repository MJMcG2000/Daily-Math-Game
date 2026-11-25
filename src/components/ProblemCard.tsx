import { useEffect, useRef, useState } from 'react';
import type { Problem, ProblemState } from '../types';
import { MAX_GUESSES, MAX_HINTS, scoreProblem, formatDuration, TARGET_MS } from '../lib/scoring';
import { parseAnswer } from '../lib/parse';
import { AnswerInput } from './AnswerInput';
import { Diagram } from './Diagram';
import { MathText, TeX } from './MathText';

const LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' } as const;
const MARK_ICON = { correct: '✓', close: '≈', wrong: '✗' } as const;
const MARK_TEXT = { correct: 'Correct', close: 'Close', wrong: 'Wrong' } as const;

export function ProblemCard({ problem, state, index, onStart, onGuess, onHint, onGiveUp, scored = true, title, giveUpNote }: {
  problem: Problem;
  state: ProblemState;
  index: number;
  onStart?: () => void;
  onGuess: (input: string, value: number) => void;
  onHint: () => void;
  /** Ends the problem as unsolved and reveals the worked solution. */
  onGiveUp: () => void;
  /** What giving up costs, shown in the confirmation (e.g. "ends your run"). */
  giveUpNote?: string;
  /** Daily mode: timer, reveal gate and points. Endless mode turns these off. */
  scored?: boolean;
  /** Heading text; defaults to "Problem N · Difficulty". */
  title?: string;
}) {
  const done = state.status !== 'playing';
  const score = scoreProblem(state, problem.difficulty);
  const answerTex = parseAnswer(problem.answer);
  const [stepsShown, setStepsShown] = useState(1);
  const [confirmGiveUp, setConfirmGiveUp] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const wasDone = useRef(done);

  useEffect(() => {
    // Move focus to the result when the problem finishes, so screen readers announce it.
    if (done && !wasDone.current) resultRef.current?.focus();
    wasDone.current = done;
  }, [done]);

  const heading = title ?? `Problem ${index + 1} · ${LABEL[problem.difficulty]}`;
  // The topic (e.g. "Integration by parts") names the method, so it stays hidden until the
  // problem is finished. Only the course (Calc 1 / Calc 2) shows while playing.
  const course = problem.course ? (problem.course === 'calc1' ? 'Calc 1' : 'Calc 2') : '';
  const label = done ? [problem.topic, course].filter(Boolean).join(' · ') : course;

  if (scored && !state.started) {
    return (
      <section className="card start-card" aria-labelledby={`p${index}-title`}>
        <h2 id={`p${index}-title`} className="card-title">
          Problem {index + 1} · {LABEL[problem.difficulty]}
        </h2>
        {label && <p className="muted">{label}</p>}
        <p>
          The timer starts when you reveal the problem. Full points if solved within{' '}
          <strong>{TARGET_MS[problem.difficulty] / 60000} min</strong>; after that points shrink
          gradually, down to half at {(3 * TARGET_MS[problem.difficulty]) / 60000} min.
        </p>
        <button className="btn primary big" onClick={() => onStart?.()}>Reveal problem {index + 1}</button>
      </section>
    );
  }

  return (
    <section className="card" aria-labelledby={`p${index}-title`}>
      <header className="card-head">
        <h2 id={`p${index}-title`} className="card-title">{heading}</h2>
        {label && <span className="muted small">{label}</span>}
      </header>
      {scored && !done && <LiveTimer elapsedMs={state.elapsedMs} targetMs={TARGET_MS[problem.difficulty]} />}

      <MathText className="prompt" text={problem.prompt} />
      {problem.diagram && <Diagram svg={problem.diagram} alt={problem.diagramAlt} />}

      {state.guesses.length > 0 && (
        <ol className="guesses" aria-label="Your guesses">
          {state.guesses.map((g, i) => {
            const p = parseAnswer(g.input);
            return (
              <li key={i} className={`guess ${g.mark}`}>
                <span className="mark" aria-hidden="true">{MARK_ICON[g.mark]}</span>
                <span className="guess-expr">{p.ok ? <TeX tex={`\\displaystyle ${p.tex}`} /> : g.input}</span>
                <span className="guess-fb">
                  {MARK_TEXT[g.mark]}
                  {g.direction && (
                    <>
                      {' · answer is '}
                      <strong>{g.direction}</strong> <span aria-hidden="true">{g.direction === 'higher' ? '↑' : '↓'}</span>
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="hints">
        {state.hintsUsed >= 1 && (
          <div className="hint"><strong>Hint 1.</strong> <MathText as="span" text={problem.hint1} /></div>
        )}
        {state.hintsUsed >= 2 && (
          <div className="hint"><strong>Hint 2.</strong> <MathText as="span" text={problem.hint2} /></div>
        )}
        {!done && state.hintsUsed < MAX_HINTS && (
          <button className="btn ghost" onClick={onHint}>
            Show hint {state.hintsUsed + 1}
            {scored && <span className="muted small"> (−0.5 pt)</span>}
          </button>
        )}
      </div>

      {!done && (
        <AnswerInput onSubmit={onGuess} guessesLeft={MAX_GUESSES - state.guesses.length} />
      )}

      {!done && (
        <div className="give-up">
          {!confirmGiveUp ? (
            <button className="btn ghost small-btn" onClick={() => setConfirmGiveUp(true)}>
              <span aria-hidden="true">🏳️</span> Give up and show solution
            </button>
          ) : (
            <div className="give-up-confirm" role="group" aria-label="Confirm giving up">
              <p className="small">
                Give up on this problem? {giveUpNote ?? (scored ? 'It will score 0 points.' : 'It will count as not solved.')}
              </p>
              <div className="row center">
                <button className="btn primary" onClick={() => { setConfirmGiveUp(false); onGiveUp(); }} autoFocus>
                  Yes, show the solution
                </button>
                <button className="btn ghost" onClick={() => setConfirmGiveUp(false)}>Keep trying</button>
              </div>
            </div>
          )}
        </div>
      )}

      <div aria-live="polite" className="visually-hidden">
        {state.guesses.length > 0 && !done &&
          `${MARK_TEXT[state.guesses[state.guesses.length - 1].mark]}. The answer is ${state.guesses[state.guesses.length - 1].direction}. ${MAX_GUESSES - state.guesses.length} guesses left.`}
      </div>

      {done && (
        <div className={`result ${state.status}`} ref={resultRef} tabIndex={-1}>
          <p className="result-line">
            {state.status === 'solved' ? (
              <>Solved in {state.guesses.length} {state.guesses.length === 1 ? 'guess' : 'guesses'}</>
            ) : state.gaveUp ? (
              <>You gave up. The answer was</>
            ) : (
              <>Out of guesses. The answer was</>
            )}{' '}
            {answerTex.ok && <TeX tex={answerTex.tex} />}
          </p>
          {scored && (
            <p className="muted small">
              Time {formatDuration(state.elapsedMs)} ·{' '}
              {state.status === 'solved'
                ? `${score.afterHints} base × ${score.timeMult.toFixed(2)} time × ${score.weight} difficulty = ${score.total} pts`
                : '0 pts'}
            </p>
          )}
          <h3>Worked solution</h3>
          {problem.keyIdea && (
            <div className="key-idea"><strong>Key idea.</strong> <MathText as="span" text={problem.keyIdea} /></div>
          )}
          {problem.solutionDiagram && (
            <Diagram svg={problem.solutionDiagram} alt={problem.solutionDiagramAlt} caption={problem.solutionDiagramAlt} />
          )}
          <ol className="steps">
            {problem.solutionSteps.slice(0, stepsShown).map((s, i) => (
              <MathText as="li" key={i} text={s} />
            ))}
          </ol>
          {stepsShown < problem.solutionSteps.length && (
            <div className="row">
              <button className="btn" onClick={() => setStepsShown((n) => n + 1)}>Next step</button>
              <button className="btn ghost" onClick={() => setStepsShown(problem.solutionSteps.length)}>Show all</button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function LiveTimer({ elapsedMs, targetMs }: { elapsedMs: number; targetMs: number }) {
  const over = elapsedMs > targetMs;
  return (
    <p className={`timer ${over ? 'over' : ''}`}>
      <span className="visually-hidden">Time on this problem: </span>
      <span className="timer-value">{formatDuration(elapsedMs)}</span>
      <span className="muted small">
        {over
          ? ' · points now shrinking (down to half at ' + formatDuration(3 * targetMs) + ')'
          : ' · full points for ' + formatDuration(targetMs - elapsedMs) + ' more'}
      </span>
    </p>
  );
}
