/** Problem diagrams are inline SVG authored in the problem bank (trusted, build-time content). */
export function Diagram({ svg, alt, caption }: { svg: string; alt?: string; caption?: string }) {
  return (
    <figure className="diagram" role="img" aria-label={alt ?? 'Diagram for this problem'}>
      <div aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />
      {caption && <figcaption className="small muted" aria-hidden="true">{caption}</figcaption>}
    </figure>
  );
}
