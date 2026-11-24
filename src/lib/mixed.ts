/**
 * Split text with inline `$...$` and display `$$...$$` LaTeX into segments.
 * A literal dollar sign (currency) is written `\$`, inside or outside math.
 */
export type Segment = { kind: 'text' | 'inline' | 'display'; value: string };

const SENTINEL = '\u0000';

export function splitMath(text: string): Segment[] {
  const escaped = text.replace(/\\\$/g, SENTINEL);
  const parts = escaped.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g);
  const out: Segment[] = [];
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('$$') && part.length > 4) {
      out.push({ kind: 'display', value: part.slice(2, -2).replaceAll(SENTINEL, '\\$') });
    } else if (part.startsWith('$') && part.length > 2 && part.endsWith('$')) {
      out.push({ kind: 'inline', value: part.slice(1, -1).replaceAll(SENTINEL, '\\$') });
    } else {
      out.push({ kind: 'text', value: part.replaceAll(SENTINEL, '$') });
    }
  }
  return out;
}
