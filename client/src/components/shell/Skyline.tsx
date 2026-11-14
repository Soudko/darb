import '../../styles/shell.css';

// Our own simple Kuwait skyline: towers with their spheres and a few blocks. Decoration only.
export function Skyline() {
  return (
    <div className="sh-sky" aria-hidden="true">
      <svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMax slice">
        <g className="sky-teal" opacity="0.55">
          <rect x="8" y="88" width="22" height="52" /><rect x="34" y="70" width="18" height="70" />
          <rect x="300" y="80" width="20" height="60" /><rect x="326" y="62" width="24" height="78" />
          <rect x="356" y="92" width="30" height="48" />
        </g>
        <g className="sky-navy">
          <rect x="0" y="118" width="400" height="22" />
          <rect x="60" y="96" width="26" height="44" /><rect x="92" y="84" width="20" height="56" />
          <rect x="118" y="104" width="24" height="36" />
          {/* Liberation Tower */}
          <rect x="262" y="52" width="9" height="88" /><rect x="258" y="30" width="17" height="26" rx="4" /><rect x="265" y="8" width="3" height="24" />
          {/* Kuwait Towers */}
          <path d="M165 140 L171 62 L177 140 Z" /><ellipse cx="171" cy="58" rx="13" ry="14" />
          <path d="M165 58 l6 -34 l6 34 Z" opacity="0" />
          <path d="M205 140 L209 84 L213 140 Z" /><ellipse cx="209" cy="82" rx="8" ry="8" />
          <rect x="169.5" y="20" width="3" height="30" /><rect x="207.5" y="62" width="3" height="18" />
        </g>
        <g className="sky-teal">
          <ellipse cx="171" cy="58" rx="13" ry="3" opacity="0.7" />
          <rect x="0" y="130" width="400" height="10" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
}
