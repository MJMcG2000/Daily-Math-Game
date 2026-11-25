/**
 * TESTING ONLY. Remove before launch: delete this file and the two lines that mention
 * TestTools in src/App.tsx.
 *
 * Shown only when the page URL contains ?test (e.g. https://…/Daily-Math-Game/?test).
 */
const KEYS = {
  today: ['mathdle:state:v1'],
  all: ['mathdle:state:v1', 'mathdle:history:v1', 'mathdle:endless:v1', 'mathdle:seenHelp'],
};

export function testToolsEnabled(): boolean {
  try {
    return new URLSearchParams(location.search).has('test');
  } catch {
    return false;
  }
}

function removeTodayFromHistory(day: number) {
  try {
    const raw = localStorage.getItem('mathdle:history:v1');
    if (!raw) return;
    const history = JSON.parse(raw) as Record<string, unknown>;
    delete history[String(day)];
    localStorage.setItem('mathdle:history:v1', JSON.stringify(history));
  } catch {
    /* ignore */
  }
}

export function TestTools({ day }: { day: number }) {
  function resetToday() {
    if (!confirm('Reset today\'s puzzle? Your progress on today\'s three problems and today\'s entry in your stats will be cleared.')) return;
    KEYS.today.forEach((k) => localStorage.removeItem(k));
    removeTodayFromHistory(day);
    location.reload();
  }
  function resetAll() {
    if (!confirm('Reset everything? This clears all saved progress, stats, streaks and endless-mode records on this device.')) return;
    KEYS.all.forEach((k) => localStorage.removeItem(k));
    location.reload();
  }
  return (
    <section className="test-tools" aria-label="Testing tools">
      <p className="small"><strong>Testing tools</strong> (only visible with ?test in the address)</p>
      <div className="row center">
        <button className="btn" onClick={resetToday}>Reset today&apos;s puzzle</button>
        <button className="btn ghost" onClick={resetAll}>Reset all saved data</button>
      </div>
    </section>
  );
}
