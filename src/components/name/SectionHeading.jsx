/**
 * SectionHeading — Premium editorial heading
 *
 * Semantic accent colors via category prop.
 * Larger icon capsule, clean typography, subtle spacing.
 */

const CATEGORY_BADGE = {
  linguistic:
    'bg-[color:var(--nv-accent-soft-bg)] text-[color:var(--nv-accent-soft-fg)]',
  spiritual:
    'bg-[color:var(--nv-accent-2-soft-bg)] text-[color:var(--nv-accent-2-soft-fg)]',
  lucky:
    'bg-[color:var(--nv-accent-3-soft-bg)] text-[color:var(--nv-accent-3-soft-fg)]',
  personality:
    'bg-[color:var(--nv-accent-4-soft-bg)] text-[color:var(--nv-accent-4-soft-fg)]',
  social:
    'bg-[color:var(--nv-accent-5-soft-bg)] text-[color:var(--nv-accent-5-soft-fg)]',
};

export default function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  description,
  category = 'linguistic',
  headingId,
}) {
  const badgeClass = CATEGORY_BADGE[category] || CATEGORY_BADGE.linguistic;

  return (
    <div className="flex items-start gap-4">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${badgeClass}`}
      >
        {typeof Icon === 'function' ? (
          <Icon className="h-5 w-5" />
        ) : typeof Icon === 'string' ? (
          <span className="text-lg leading-none">{Icon}</span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--nv-muted)]">
            {eyebrow}
          </p>
        )}
        <h2
          id={headingId}
          className="text-xl font-bold leading-tight text-[color:var(--nv-ink)] sm:text-2xl"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-[color:var(--nv-muted)]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}