// Small spot illustrations for empty states. Same visual language as the
// onboarding art (flat fills, chunky ink outline) but drawn for light
// surfaces, so they use dashed sky outlines for "nothing here yet" slots.

import type { SVGProps } from "react";

const BASE: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 200 160",
  fill: "none",
  role: "presentation",
  "aria-hidden": true,
  focusable: false,
};

function Sparkle({ x, y, s = 8 }: { x: number; y: number; s?: number }) {
  const i = s * 0.28;
  return (
    <path
      transform={`translate(${x} ${y})`}
      d={`M0 ${-s} L${i} ${-i} L${s} 0 L${i} ${i} L0 ${s} L${-i} ${i} L${-s} 0 L${-i} ${-i} Z`}
      className="fill-sun stroke-night"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  );
}

/** Dashboard: an open, empty capsule with a dashed slot where a letter goes. */
export function EmptyCapsulesIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <ellipse cx="100" cy="146" rx="58" ry="7" className="fill-night" opacity="0.08" />
      <circle cx="100" cy="84" r="62" className="fill-sky" opacity="0.12" />

      {/* dashed "your letter goes here" slot */}
      <g strokeLinejoin="round" strokeLinecap="round">
        <rect x="74" y="46" width="52" height="60" rx="8" className="stroke-sky-deep" strokeWidth="3" strokeDasharray="6 6" />
        <path d="M84 64 H116 M84 76 H108" className="stroke-sky-deep" strokeWidth="3" strokeDasharray="1 7" opacity="0.7" />
      </g>

      {/* capsule bottom half */}
      <g strokeLinejoin="round">
        <path
          d="M48 106 H152 V120 a26 26 0 0 1 -26 26 H74 a26 26 0 0 1 -26 -26 Z"
          className="fill-white stroke-night"
          strokeWidth="3.5"
        />
        <rect x="44" y="100" width="112" height="14" rx="7" className="fill-sun stroke-night" strokeWidth="3.5" />
        <path d="M62 126 V134" className="stroke-sky" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
      </g>

      {/* lid, set aside */}
      <g transform="translate(150 40) rotate(22) scale(0.5) translate(-100 -60)" strokeLinejoin="round">
        <path
          d="M48 76 H152 V58 a26 26 0 0 0 -26 -26 H74 a26 26 0 0 0 -26 26 Z"
          className="fill-coral stroke-night"
          strokeWidth="3.5"
        />
        <path d="M64 54 V46" className="stroke-white" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      </g>

      <Sparkle x={40} y={52} s={9} />
      <Sparkle x={168} y={98} s={7} />
    </svg>
  );
}

/** Map: a little map with a dashed route ending at a "+" pin. */
export function EmptyMapIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <ellipse cx="100" cy="146" rx="62" ry="7" className="fill-night" opacity="0.08" />
      <defs>
        <clipPath id="empty-map-clip">
          <rect x="28" y="40" width="144" height="98" rx="16" />
        </clipPath>
      </defs>

      <g clipPath="url(#empty-map-clip)">
        <rect x="28" y="40" width="144" height="98" className="fill-map-land" />
        <rect x="40" y="50" width="34" height="24" rx="3" className="fill-map-park" />
        <rect x="128" y="96" width="34" height="30" rx="3" className="fill-map-park" />
        <rect x="84" y="102" width="30" height="24" rx="3" className="fill-map-park" />
        <path d="M28 88 H172 M76 40 V138 M136 40 V138" className="stroke-map-road" strokeWidth="9" />
        {/* the route that leads nowhere yet */}
        <path
          d="M46 122 C 70 122, 76 96, 100 92 S 118 70, 118 66"
          className="stroke-coral"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="2 8"
        />
        <circle cx="46" cy="122" r="5" className="fill-white stroke-night" strokeWidth="3" />
      </g>
      <rect x="28" y="40" width="144" height="98" rx="16" className="stroke-night" strokeWidth="3.5" />

      {/* empty pin waiting for a first place */}
      <g strokeLinejoin="round" strokeLinecap="round">
        <path
          d="M118 22 c-14 0 -23 10 -23 23 c0 17 23 40 23 40 s23 -23 23 -40 c0 -13 -9 -23 -23 -23 z"
          className="fill-white stroke-night"
          strokeWidth="3.5"
        />
        <path d="M118 36 V54 M109 45 H127" className="stroke-coral" strokeWidth="4.5" />
      </g>

      <Sparkle x={168} y={30} s={9} />
      <Sparkle x={34} y={26} s={7} />
    </svg>
  );
}
