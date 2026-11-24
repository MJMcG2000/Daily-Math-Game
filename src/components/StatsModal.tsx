import { useState } from 'react';
import { Modal } from './Modal';
import type { Stats } from '../lib/stats';
import { formatDuration } from '../lib/scoring';
import type { Difficulty } from '../types';
import { Countdown } from './Countdown';

const DIFFS: Difficulty[] = ['easy', 'medium', 'hard'];
const LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' } as const;

export function StatsModal({ open, onClose, stats, shareText, dayDone }: {
  open: boolean;
  onClose: () => void;
  stats: Stats;
  shareText: string;
  dayDone: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Statistics">
      <div className="stat-grid">
        <Stat n={stats.daysPlayed} label="Played" />
        <Stat n={stats.perfectDays} label="Perfect days" />
        <Stat n={stats.averageScore} label="Avg score" />
        <Stat n={stats.bestScore} label="Best score" />
      </div>
      <div className="stat-grid">
        <Stat n={stats.perfectStreak} label="Perfect streak" title="Consecutive days solving all 3" />
        <Stat n={stats.maxPerfectStreak} label="Max perfect" />
        <Stat n={stats.solveStreak} label="Solve streak" title="Consecutive days solving at least 1" />
        <Stat n={stats.maxSolveStreak} label="Max solve" />
      </div>

      <h3>By difficulty</h3>
      {DIFFS.map((d) => {
        const r = stats.solveRate[d];
        const dist = stats.guessDistribution[d];
        const max = Math.max(1, ...dist);
        const avg = stats.averageSolveMs[d];
        return (
          <div key={d} className="diff-block">
            <div className="diff-head">
              <strong>{LABEL[d]}</strong>
              <span className="muted small">
                {r.attempted ? Math.round((100 * r.solved) / r.attempted) : 0}% solved ({r.solved}/{r.attempted})
                {avg !== null && ` · avg ${formatDuration(avg)}`}
              </span>
            </div>
            <ul className="dist" aria-label={`${LABEL[d]} guess distribution`}>
              {dist.map((n, i) => (
                <li key={i}>
                  <span className="dist-label">{i < 3 ? i + 1 : '✗'}</span>
                  <span className="dist-bar" style={{ width: `${Math.max(8, (100 * n) / max)}%` }} data-zero={n === 0 || undefined}>
                    <span className="visually-hidden">{i < 3 ? `Solved in ${i + 1}:` : 'Not solved:'} </span>{n}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      <div className="stats-foot">
        <Countdown />
        <ShareButton text={shareText} disabled={!dayDone} />
      </div>
    </Modal>
  );
}

function Stat({ n, label, title }: { n: number; label: string; title?: string }) {
  return (
    <div className="stat" title={title}>
      <div className="stat-n">{n}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export function ShareButton({ text, disabled }: { text: string; disabled?: boolean }) {
  const [msg, setMsg] = useState('');
  async function share() {
    try {
      await navigator.clipboard.writeText(text);
      setMsg('Copied to clipboard');
    } catch {
      setMsg('Couldn\'t copy. Select the text below instead.');
    }
    setTimeout(() => setMsg(''), 2500);
  }
  return (
    <div className="share">
      <button className="btn primary" onClick={share} disabled={disabled}>
        Share <span aria-hidden="true">↗</span>
      </button>
      {disabled && <span className="muted small">Finish all three to share</span>}
      <span role="status" className="small">{msg}</span>
      {msg.startsWith('Couldn') && <pre className="share-fallback">{text}</pre>}
    </div>
  );
}
