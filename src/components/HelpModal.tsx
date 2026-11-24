import { Modal } from './Modal';
import { MAX_DAILY_SCORE } from '../lib/scoring';

const ROWS: [string, string][] = [
  ['π', 'pi, Pi, PI, π'],
  ['e', 'e  (2e = 2·e)'],
  ['Scientific notation', '1e3 = 1000, 2.5e-4. Only a number followed directly by e and an integer.'],
  ['√2', 'sqrt(2), sqrt2, √2, √(2), 2^(1/2)'],
  ['∛x', 'cbrt(x), x^(1/3)'],
  ['Natural log', 'ln(x)'],
  ['Base-10 log', 'log(x)'],
  ['Log base b', 'log_b(x) or log(x, b)'],
  ['Trig (radians)', 'sin cos tan sec csc cot'],
  ['Inverse trig', 'arcsin/asin, arccos/acos, arctan/atan'],
  ['Infinity', 'inf, infinity, ∞'],
  ['Powers', '^ or **, ², ³'],
];

export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="How to play">
      <p>Three new problems every day: <strong>Easy</strong> (algebra), <strong>Medium</strong> (geometry to precalculus) and <strong>Hard</strong> (calculus). Do them in any order. Grab some paper!</p>
      <ul className="tight">
        <li><strong>3 guesses</strong> per problem. A wrong guess tells you whether the answer is higher <span aria-hidden="true">↑</span> or lower <span aria-hidden="true">↓</span>.</li>
        <li><span className="chip close">≈ Close</span> means within 10% of the answer. <span className="chip wrong">✗ Wrong</span> means further off.</li>
        <li><strong>2 hints</strong> per problem, each costs 0.5 points.</li>
        <li>The full worked solution appears once a problem is done.</li>
      </ul>
      <h3>Scoring</h3>
      <p>Solve on guess 1/2/3 for 3/2/1 points, minus hints (never below 0.5). Then × a time factor: 1.0 within the target time (Easy 3 min, Medium 6, Hard 10), shrinking smoothly to 0.5 at 3× the target. Then × difficulty: Easy ×1, Medium ×2, Hard ×3. Best possible day: {MAX_DAILY_SCORE}.</p>
      <h3>Typing answers</h3>
      <p>Give exact answers like <code>3pi/4</code>, <code>2sqrt(5)</code> or <code>ln(3)</code>. Decimals with 6+ significant figures also work. Equivalent forms all count: <code>1/2</code>, <code>0.5</code>, <code>sin(pi/6)</code>. The preview shows how your input was read; a typo never costs a guess.</p>
      <table className="syntax">
        <tbody>
          {ROWS.map(([a, b]) => (
            <tr key={a}><th scope="row">{a}</th><td><code>{b}</code></td></tr>
          ))}
        </tbody>
      </table>
      <p className="small muted">Multiplication can be implied: <code>2pi</code>, <code>3sqrt(2)</code>, <code>(1/2)ln(3)</code>. It binds like <code>*</code>, left to right, so <code>1/2pi</code> is ½·π; write <code>1/(2pi)</code> for 1/(2π). A function without parentheses takes the next number: <code>sqrt2pi</code> = √2·π.</p>
    </Modal>
  );
}
