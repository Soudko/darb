import '../../styles/shell.css';

// A glowing glass sphere built from layered gradients. Decoration only.
export function AiOrb({ size = 76 }: { size?: number }) {
  return (
    <span className="sh-orb decor" aria-hidden="true" style={{ width: size, height: size }}>
      <span className="sh-orb-glow decor anim" />
      <span className="sh-orb-ball">
        <svg viewBox="0 0 100 100" focusable="false">
          <path className="orb-band" d="M8 62 Q50 28 92 56" />
          <path className="orb-band" d="M10 74 Q50 44 90 70" />
          <path className="orb-band thin" d="M20 38 Q48 22 78 30" />
        </svg>
      </span>
    </span>
  );
}
