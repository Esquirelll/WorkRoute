/**
 * WorkRoute mark: a path that starts at an orange dot (your home / the commute)
 * and ends at a blue square (the workplace). It is the product idea in one shape.
 */
export function LogoMark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <path d="M9 25h8a6 6 0 0 0 6-6v-6" fill="none" stroke="#1D4F91" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="8" cy="25" r="3.6" fill="#B45F06" />
      <rect x="18.5" y="4.5" width="9" height="9" rx="2.2" fill="#1D4F91" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark />
      <span className="text-lg font-extrabold tracking-tight text-brand-800">WorkRoute</span>
    </span>
  );
}
