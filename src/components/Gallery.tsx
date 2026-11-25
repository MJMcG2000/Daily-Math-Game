/**
 * Development-only problem gallery: npm run dev, then open /?gallery=easy (or medium, hard).
 * Renders every problem with its answer, hints, diagram and full solution for proofreading.
 * Not reachable in production builds.
 */
import type { Problem } from '../types';
import { parseAnswer } from '../lib/parse';
import { Diagram } from './Diagram';
import { MathText, TeX } from './MathText';

export function Gallery({ problems, filter }: { problems: Problem[]; filter: string }) {
  const list = problems.filter((p) => p.difficulty === filter || p.id === filter || filter === 'all');
  return (
    <main className="container">
      <h1>Gallery: {filter} ({list.length})</h1>
      {list.map((p) => {
        const a = parseAnswer(p.answer);
        return (
          <section key={p.id} className="card" id={p.id}>
            <h2 className="card-title">{p.id} · {p.topic}{p.course ? ` · ${p.course}` : ''}</h2>
            <p className="muted small">{p.subject} · grade {p.gradeLevel === 13 ? 'college' : p.gradeLevel}</p>
            <MathText className="prompt" text={p.prompt} />
            {p.diagram && <Diagram svg={p.diagram} alt={p.diagramAlt} />}
            <p><strong>Answer:</strong> <code>{p.answer}</code> {a.ok && <TeX tex={a.tex} />} ≈ {String(p.answerNumeric)}</p>
            <div className="hint"><strong>Hint 1.</strong> <MathText as="span" text={p.hint1} /></div>
            <div className="hint"><strong>Hint 2.</strong> <MathText as="span" text={p.hint2} /></div>
            {p.keyIdea && <div className="key-idea"><strong>Key idea.</strong> <MathText as="span" text={p.keyIdea} /></div>}
            <ol className="steps">{p.solutionSteps.map((s, i) => <MathText as="li" key={i} text={s} />)}</ol>
          </section>
        );
      })}
    </main>
  );
}
