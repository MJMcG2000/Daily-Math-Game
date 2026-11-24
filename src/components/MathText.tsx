import { memo, useMemo } from 'react';
import katex from 'katex';

/** Render text containing $inline$ and $$display$$ LaTeX. */
export function renderMixed(text: string): string {
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g);
  return parts
    .map((part) => {
      if (part.startsWith('$$')) {
        return katex.renderToString(part.slice(2, -2), { displayMode: true, throwOnError: false });
      }
      if (part.startsWith('$') && part.length > 1) {
        return katex.renderToString(part.slice(1, -1), { throwOnError: false });
      }
      return part.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);
    })
    .join('');
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
