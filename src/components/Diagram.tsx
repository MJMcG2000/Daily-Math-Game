/** Problem diagrams are inline SVG authored in the problem bank (trusted, build-time content). */
export function Diagram({ svg, alt }: { svg: string; alt?: string }) {
  return (
    <figure className="diagram" role="img" aria-label={alt ?? 'Diagram for this problem'}>
      <div aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />
    </figure>
  );
}
