// Custom illustrations for the three onboarding slides. Flat fills + a chunky
// ink outline, all drawn from the Doraemon Sky palette via Tailwind's
// fill-* / stroke-* utilities (so they follow the theme tokens). They sit on
// the sky-blue gradient, so most of the "paper" is white or cream.

import type { SVGProps } from "react";

const BASE: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 240 200",
  fill: "none",
  role: "presentation",
  "aria-hidden": true,
  focusable: false,
};

/** Four-point sparkle centred on (0,0); place with a <g transform>. */
function Sparkle({ size = 10 }: { size?: number }) {
  const s = size;
  const i = size * 0.28;
  return (
    <path
      d={`M0 ${-s} L${i} ${-i} L${s} 0 L${i} ${i} L0 ${s} L${-i} ${i} L${-s} 0 L${-i} ${-i} Z`}
      className="fill-sun stroke-night"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  );
}

/** Slide 1 — a letter with a few lines written and a pencil mid-sentence. */
export function WriteIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="120" cy="102" r="86" className="fill-white" opacity="0.14" />

      {/* paper */}
      <g strokeLinejoin="round" strokeLinecap="round">
        <rect x="58" y="30" width="110" height="136" rx="14" className="fill-white stroke-night" strokeWidth="3.5" />
        <rect x="58" y="30" width="110" height="26" rx="14" className="fill-sun stroke-night" strokeWidth="3.5" />
        <rect x="58" y="44" width="110" height="12" className="fill-sun" />
        <path d="M58 56 H168" className="stroke-night" strokeWidth="3.5" />
        {/* date tag */}
        <path d="M76 43 H104" className="stroke-night" strokeWidth="4" />
        {/* body lines */}
        <path d="M76 78 H150" className="stroke-sky-deep" strokeWidth="5" />
        <path d="M76 96 H140" className="stroke-sky-deep" strokeWidth="5" />
        <path d="M76 114 H148" className="stroke-sky-deep" strokeWidth="5" />
        <path d="M76 132 H112" className="stroke-coral" strokeWidth="5" />
      </g>

      {/* pencil, tip resting at the end of the last line */}
      <g transform="translate(118 138) rotate(32)" strokeLinejoin="round">
        <rect x="-8" y="-58" width="16" height="12" rx="3" className="fill-coral stroke-night" strokeWidth="3" />
        <rect x="-8" y="-48" width="16" height="6" className="fill-white stroke-night" strokeWidth="3" />
        <rect x="-8" y="-42" width="16" height="42" className="fill-sun stroke-night" strokeWidth="3" />
        <path d="M-8 0 L8 0 L0 16 Z" className="fill-cream stroke-night" strokeWidth="3" />
        <path d="M-3.5 10 L3.5 10 L0 16 Z" className="fill-night" />
      </g>

      <g transform="translate(40 48)"><Sparkle size={11} /></g>
      <g transform="translate(196 70)"><Sparkle size={8} /></g>
      <g transform="translate(190 152)">
        <path
          d="M0 8 C-14 -2 -10 -14 0 -8 C10 -14 14 -2 0 8 Z"
          className="fill-coral stroke-night"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/** Slide 2 — a capsule with a padlock across its seam. */
export function SealIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <defs>
        <clipPath id="ob-capsule-clip">
          <rect x="82" y="24" width="76" height="152" rx="38" />
        </clipPath>
      </defs>
      <circle cx="120" cy="100" r="86" className="fill-white" opacity="0.14" />
      {/* orbit */}
      <ellipse
        cx="120"
        cy="100"
        rx="94"
        ry="30"
        transform="rotate(-18 120 100)"
        className="stroke-white"
        strokeWidth="2.5"
        strokeDasharray="2 9"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* capsule body */}
      <g clipPath="url(#ob-capsule-clip)">
        <rect x="82" y="24" width="76" height="76" className="fill-coral" />
        <rect x="82" y="100" width="76" height="76" className="fill-white" />
        <rect x="82" y="92" width="76" height="16" className="fill-sun" />
        <path d="M82 92 H158 M82 108 H158" className="stroke-night" strokeWidth="3.5" />
        {/* shine */}
        <path d="M96 48 V70" className="stroke-white" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
        <path d="M96 128 V150" className="stroke-sky" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
      </g>
      <rect x="82" y="24" width="76" height="152" rx="38" className="stroke-night" strokeWidth="3.5" />

      {/* padlock */}
      <g strokeLinejoin="round" strokeLinecap="round">
        <path d="M110 92 V84 a10 10 0 0 1 20 0 V92" className="stroke-night" strokeWidth="4" />
        <rect x="102" y="90" width="36" height="30" rx="8" className="fill-white stroke-night" strokeWidth="3.5" />
        <circle cx="120" cy="103" r="4" className="fill-night" />
        <path d="M120 105 V112" className="stroke-night" strokeWidth="3.5" />
      </g>

      <g transform="translate(50 46)"><Sparkle size={10} /></g>
      <g transform="translate(194 148)"><Sparkle size={12} /></g>
      <g transform="translate(200 52)"><Sparkle size={7} /></g>
    </svg>
  );
}

/** Slide 3 — the capsule cracked open, a letter and sunshine rising out. */
export function MeetIllustration(props: SVGProps<SVGSVGElement>) {
  const rays = Array.from({ length: 9 }, (_, i) => -160 + i * 17.5);
  return (
    <svg {...BASE} {...props}>
      <circle cx="120" cy="102" r="86" className="fill-white" opacity="0.14" />

      {/* sun + rays behind the letter */}
      <g transform="translate(120 92)">
        {rays.map((deg) => (
          <path
            key={deg}
            d="M0 -54 V-66"
            transform={`rotate(${deg + 90})`}
            className="stroke-sun"
            strokeWidth="6"
            strokeLinecap="round"
          />
        ))}
        <circle r="42" className="fill-sun stroke-night" strokeWidth="3.5" />
      </g>

      {/* letter rising out of the capsule */}
      <g strokeLinejoin="round" strokeLinecap="round">
        <rect x="94" y="62" width="52" height="76" rx="8" className="fill-white stroke-night" strokeWidth="3.5" />
        <path d="M104 80 H136 M104 92 H130" className="stroke-sky-deep" strokeWidth="4.5" />
        <path
          d="M120 118 C109 110 111 102 120 106 C129 102 131 110 120 118 Z"
          className="fill-coral stroke-night"
          strokeWidth="2.5"
        />
      </g>

      {/* capsule bottom half */}
      <g strokeLinejoin="round">
        <path
          d="M72 130 H168 V148 a26 26 0 0 1 -26 26 H98 a26 26 0 0 1 -26 -26 Z"
          className="fill-white stroke-night"
          strokeWidth="3.5"
        />
        <rect x="68" y="124" width="104" height="14" rx="7" className="fill-sun stroke-night" strokeWidth="3.5" />
        <path d="M84 152 V162" className="stroke-sky" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
      </g>

      {/* capsule lid, popped off and floating away */}
      <g transform="translate(188 52) rotate(26) scale(0.52) translate(-122 -102)" strokeLinejoin="round">
        <path
          d="M72 124 H172 V106 a26 26 0 0 0 -26 -26 H98 a26 26 0 0 0 -26 26 Z"
          className="fill-coral stroke-night"
          strokeWidth="3.5"
        />
        <path d="M86 100 V92" className="stroke-white" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      </g>

      <g transform="translate(44 52)"><Sparkle size={11} /></g>
      <g transform="translate(40 128)"><Sparkle size={8} /></g>
      <g transform="translate(204 128)"><Sparkle size={9} /></g>
    </svg>
  );
}
