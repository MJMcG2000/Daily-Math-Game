import { useEffect, useState } from 'react';
import { msUntilNextPuzzle } from '../lib/daily';
import { formatDuration } from '../lib/scoring';

export function Countdown({ onRollover }: { onRollover?: () => void }) {
  const [ms, setMs] = useState(() => msUntilNextPuzzle());
  useEffect(() => {
    const t = setInterval(() => {
      const next = msUntilNextPuzzle();
      setMs((prev) => {
        if (next > prev + 1000) onRollover?.();
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [onRollover]);
  return (
    <div className="countdown">
      <span className="muted small">Next Mathdle in</span>
      <span className="countdown-time" role="timer" aria-live="off">{formatDuration(ms)}</span>
    </div>
  );
}
