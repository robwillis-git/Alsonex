/**
 * Proof-of-life React (.tsx) component — confirms the @astrojs/react
 * integration compiles JSX inside Astro. This is also the pattern Frankie
 * will use to port the reference React build
 * (project/ui_kits/website/Components.jsx, Pages.jsx) into reusable islands.
 *
 * Render in Astro with: <PipelineBadge client:load /> (or static, no directive).
 */
interface Props {
  phase?: string;
}

export default function PipelineBadge({ phase = 'Phase I/Ib' }: Props) {
  return (
    <span
      className="alx-tag"
      style={{
        background: 'var(--bg-teal-tint)',
        color: 'var(--brand-teal-deep)',
        fontWeight: 700,
        letterSpacing: '.04em',
        textTransform: 'uppercase',
        fontSize: '11px',
        padding: '3px 9px',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      ALS-205 · {phase}
    </span>
  );
}
