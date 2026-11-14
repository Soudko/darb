import { Bell } from 'lucide-react';
import { go } from '../../lib/nav';
import { usePrefs } from '../../state/prefs';
import { useT } from '../../strings';
import '../../styles/shell.css';

// Our own drawing of Kuwait City at dusk: Kuwait Towers, a smaller tower, high-rises, lit windows and a reflection.
function City() {
  return (
    <g>
      <g className="hs-far">
        <rect x="6" y="196" width="26" height="66" /><rect x="36" y="176" width="20" height="86" />
        <rect x="62" y="206" width="30" height="56" /><rect x="96" y="188" width="18" height="74" />
        <rect x="300" y="190" width="22" height="72" /><rect x="326" y="168" width="26" height="94" />
        <rect x="356" y="200" width="34" height="62" />
      </g>
      <g className="hs-bld">
        <rect x="118" y="214" width="26" height="48" /><rect x="146" y="198" width="18" height="64" />
        <rect x="304" y="222" width="30" height="40" />
        {/* main tower */}
        <path d="M225 262 L229.2 76 L230.8 76 L235 262 Z" />
        <rect x="229.4" y="34" width="1.2" height="44" />
        <circle cx="230" cy="190" r="17" /><circle cx="230" cy="112" r="7.5" />
        {/* second tower */}
        <path d="M267 262 L269.3 128 L270.7 128 L273 262 Z" />
        <rect x="269.4" y="104" width="1.2" height="26" />
        <circle cx="270" cy="176" r="11" />
        {/* small light tower */}
        <path d="M196 262 L198.5 168 L199.5 168 L202 262 Z" />
        <circle cx="199" cy="166" r="3.5" />
        <rect x="0" y="256" width="390" height="6" />
      </g>
      <g className="hs-win">
        <rect x="12" y="206" width="2.5" height="2.5" /><rect x="22" y="222" width="2.5" height="2.5" />
        <rect x="42" y="190" width="2.5" height="2.5" /><rect x="46" y="214" width="2.5" height="2.5" />
        <rect x="70" y="222" width="2.5" height="2.5" /><rect x="102" y="204" width="2.5" height="2.5" />
        <rect x="124" y="228" width="2.5" height="2.5" /><rect x="132" y="240" width="2.5" height="2.5" />
        <rect x="152" y="212" width="2.5" height="2.5" /><rect x="310" y="236" width="2.5" height="2.5" />
        <rect x="306" y="198" width="2.5" height="2.5" /><rect x="334" y="186" width="2.5" height="2.5" />
        <rect x="340" y="214" width="2.5" height="2.5" /><rect x="364" y="216" width="2.5" height="2.5" />
        <rect x="372" y="236" width="2.5" height="2.5" /><rect x="330" y="236" width="2.5" height="2.5" />
        <circle cx="230" cy="190" r="1.6" /><circle cx="270" cy="176" r="1.4" />
      </g>
      <g className="hs-stripe">
        <path d="M214 186 Q230 192 246 186 M215 195 Q230 201 245 195" /><path d="M260 172 Q270 177 280 172" />
      </g>
    </g>
  );
}

export function HomeHero() {
  const p = usePrefs();
  const t = useT();
  const mark = p.theme === 'light' ? '/brand/darb-mark-light.svg' : '/brand/darb-mark-dark.svg';
  return (
    <section className="sh-hero">
      <div className="sh-hero-art decor" aria-hidden="true">
        <svg viewBox="0 0 390 340" preserveAspectRatio="xMidYMin slice" focusable="false">
          <defs>
            <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#071f44" /><stop offset="0.45" stopColor="#0b3a6e" />
              <stop offset="0.8" stopColor="#0f6a78" /><stop offset="1" stopColor="#3aa9a8" />
            </linearGradient>
            <linearGradient id="hs-water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0f6a78" /><stop offset="1" stopColor="#071f44" />
            </linearGradient>
            <radialGradient id="hs-glow" cx="0.6" cy="0.8" r="0.6">
              <stop offset="0" stopColor="#6ed9d1" stopOpacity="0.55" /><stop offset="1" stopColor="#6ed9d1" stopOpacity="0" />
            </radialGradient>
            <clipPath id="hs-clip"><rect x="0" y="262" width="390" height="80" /></clipPath>
            <g id="hs-city"><City /></g>
          </defs>
          <rect className="hs-sky" width="390" height="262" fill="url(#hs-sky)" />
          <rect className="hs-halo" width="390" height="262" fill="url(#hs-glow)" />
          <g className="hs-stars" fill="#f4f8fb"><circle cx="40" cy="36" r="1.2" /><circle cx="120" cy="60" r="1" /><circle cx="330" cy="40" r="1.3" /><circle cx="360" cy="90" r="1" /><circle cx="80" cy="110" r="0.9" /><circle cx="170" cy="30" r="1" /></g>
          <use href="#hs-city" />
          <rect className="hs-water" y="262" width="390" height="80" fill="url(#hs-water)" />
          <g clipPath="url(#hs-clip)" className="hs-refl"><use href="#hs-city" transform="translate(0 524) scale(1 -1)" /></g>
          <g className="hs-ripple"><rect x="30" y="276" width="90" height="1.5" /><rect x="200" y="288" width="120" height="1.5" /><rect x="90" y="304" width="150" height="1.5" /></g>
        </svg>
      </div>
      <div className="sh-hero-fade decor" aria-hidden="true" />
      <div className="sh-hero-top">
        <button type="button" className="sh-glass-btn glass" aria-label={t('nav.alerts')} onClick={() => go('alerts')}>
          <Bell size={24} aria-hidden="true" />
        </button>
        <div className="sh-pill glass">
          <img src={mark} alt="" aria-hidden="true" />
          <span>{t('app.name')}</span>
        </div>
      </div>
      <div className="sh-hero-text">
        <h1>{t('hm.greeting')}</h1>
        <p>{t('hm.how')}</p>
      </div>
    </section>
  );
}
