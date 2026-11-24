import { useId, useMemo, useRef, useState } from 'react';
import { parseAnswer } from '../lib/parse';
import { TeX } from './MathText';

interface Key { label: string; insert: string; caret?: number; aria: string }
const KEYS: Key[] = [
  { label: 'π', insert: 'π', aria: 'pi' },
  { label: 'e', insert: 'e', aria: 'e, Euler\'s number' },
  { label: '√', insert: '√()', caret: 2, aria: 'square root' },
  { label: 'xʸ', insert: '^', aria: 'exponent' },
  { label: 'a/b', insert: '()/()', caret: 1, aria: 'fraction' },
  { label: 'ln', insert: 'ln()', caret: 3, aria: 'natural log' },
  { label: '∞', insert: '∞', aria: 'infinity' },
  { label: '(', insert: '(', aria: 'open parenthesis' },
  { label: ')', insert: ')', aria: 'close parenthesis' },
];

export function AnswerInput({ onSubmit, disabled, guessesLeft }: {
  onSubmit: (input: string, value: number) => void;
  disabled?: boolean;
  guessesLeft: number;
}) {
  const [text, setText] = useState('');
  const [showError, setShowError] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const id = useId();
  const parsed = useMemo(() => (text.trim() ? parseAnswer(text) : null), [text]);

  function insert(k: Key) {
    const el = ref.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    const next = text.slice(0, start) + k.insert + text.slice(end);
    setText(next);
    const caret = start + (k.caret ?? k.insert.length);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(caret, caret);
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!parsed) return;
    if (!parsed.ok) { setShowError(true); return; }
    onSubmit(text.trim(), parsed.value);
    setText('');
    setShowError(false);
  }

  const fmt = (v: number) =>
    !Number.isFinite(v) ? (v > 0 ? '∞' : '−∞') : Number.isInteger(v) ? String(v) : v.toPrecision(8).replace(/\.?0+$/, '');

  return (
    <form className="answer" onSubmit={submit} aria-label="Answer">
      <label htmlFor={id} className="visually-hidden">Your answer</label>
      <div className="answer-row">
        <input
          id={id}
          ref={ref}
          value={text}
          onChange={(e) => { setText(e.target.value); setShowError(false); }}
          placeholder="e.g. 3pi/4, 2sqrt(5), ln(3)"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          disabled={disabled}
          aria-describedby={`${id}-preview`}
          aria-invalid={parsed?.ok === false && showError ? true : undefined}
        />
        <button type="submit" className="btn primary" disabled={disabled || !parsed}>
          Guess <span className="muted small">({guessesLeft} left)</span>
        </button>
      </div>
      <div id={`${id}-preview`} className="preview" aria-live="polite">
        {parsed?.ok && (
          <>
            <span className="visually-hidden">Interpreted as </span>
            <TeX tex={parsed.tex} /> <span className="muted">≈ {fmt(parsed.value)}</span>
          </>
        )}
        {parsed && !parsed.ok && (
          <span className={showError ? 'error' : 'muted'}>{parsed.error}</span>
        )}
        {!parsed && <span className="muted">Your answer preview appears here.</span>}
      </div>
      <div className="keypad" role="group" aria-label="Insert symbol">
        {KEYS.map((k) => (
          <button key={k.label} type="button" className="key" onClick={() => insert(k)} aria-label={`Insert ${k.aria}`} disabled={disabled}>
            {k.label}
          </button>
        ))}
      </div>
    </form>
  );
}
