import { memo, useMemo } from 'react';
import katex from 'katex';
import { splitMath } from '../lib/mixed';

/** Render text containing $inline$ and $$display$$ LaTeX. */
export function renderMixed(text: string): string {
  // Mark **bold** spans before splitting, so a bold lead-in may contain $math$.
  const marked = text.replace(/\*\*([\s\S]+?)\*\*/g, '\u0001$1\u0002');
  return splitMath(marked)
    .map((seg) =>
      seg.kind === 'text'
        ? seg.value.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)
        : katex.renderToString(seg.value, { displayMode: seg.kind === 'display', throwOnError: false }),
    )
    .join('')
    .replace(/\u0001/g, '<strong>')
    .replace(/\u0002/g, '</strong>');
}

export const MathText = memo(function MathText({ text, as: Tag = 'div', className }: {
  text: string;
  as?: 'div' | 'span' | 'p' | 'li';
  className?: string;
}) {
  const html = useMemo(() => renderMixed(text), [text]);
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
});

export const TeX = memo(function TeX({ tex, display = false }: { tex: string; display?: boolean }) {
  const html = useMemo(() => katex.renderToString(tex, { displayMode: display, throwOnError: false }), [tex, display]);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
});
