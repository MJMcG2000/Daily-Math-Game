/**
 * Runs the bank through the game's own code:
 *  - every `answer` string through the answer parser (src/lib/parse.ts)
 *  - every LaTeX fragment (prompt, hints, steps) through KaTeX with throwOnError
 * Prints JSON to stdout: { answers: {id: value | 'inf' | {error}}, latexErrors: {id: string[]} }
 */
import { readFileSync } from 'node:fs';
import katex from 'katex';
import { parseAnswer } from '../src/lib/parse';
import { splitMath } from '../src/lib/mixed';

const answers: Record<string, number | string | { error: string }> = {};
const latexErrors: Record<string, string[]> = {};

function checkLatex(id: string, where: string, text: string) {
  const segs = splitMath(text);
  const unescaped = text.replace(/\\\$/g, '').split(/\$\$[\s\S]+?\$\$|\$[^$]+?\$/g);
  if (unescaped.some((t) => t.includes('$'))) {
    (latexErrors[id] ??= []).push(`${where}: unbalanced $ (write a literal dollar sign as \\$)`);
  }
  for (const seg of segs) {
    if (seg.kind === 'text') continue;
    try {
      katex.renderToString(seg.value, { displayMode: seg.kind === 'display', throwOnError: true, strict: 'ignore' });
    } catch (e) {
      (latexErrors[id] ??= []).push(`${where}: ${(e as Error).message.split('\n')[0]}`);
    }
  }
}

for (const d of ['easy', 'medium', 'hard']) {
  const probs = JSON.parse(readFileSync(new URL(`../data/problems/${d}.json`, import.meta.url), 'utf8'));
  for (const p of probs) {
    const r = parseAnswer(p.answer);
    answers[p.id] = r.ok ? (Number.isFinite(r.value) ? r.value : r.value > 0 ? 'inf' : '-inf') : { error: r.error };
    checkLatex(p.id, 'prompt', p.prompt);
    checkLatex(p.id, 'hint1', p.hint1);
    checkLatex(p.id, 'hint2', p.hint2);
    if (p.keyIdea) checkLatex(p.id, 'keyIdea', p.keyIdea);
    p.solutionSteps.forEach((s: string, i: number) => checkLatex(p.id, `step ${i + 1}`, s));
  }
}
process.stdout.write(JSON.stringify({ answers, latexErrors }));
