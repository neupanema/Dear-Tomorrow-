import { hashString, mulberry32 } from "@/lib/utils";

// The 4 theme colors CoverArt draws from by default. "ink" only shows up
// as a mood-biased base color (reflective/anxious), never in the random pick.
const THEME_COLORS = ["sky", "sky-deep", "coral", "sun"] as const;
type ThemeColor = (typeof THEME_COLORS)[number] | "ink";

const MOOD_PALETTES: Record<string, ThemeColor[]> = {
  hopeful: ["coral", "sun"],
  excited: ["coral", "sun"],
  reflective: ["sky", "ink"],
  nostalgic: ["sky", "ink"],
  anxious: ["ink", "sky-deep"],
};

function colorVar(color: ThemeColor): string {
  return `rgb(var(--${color}))`;
}

/** Seeded Fisher-Yates pick of `count` colors from `pool`. */
function pickRandom(rand: () => number, pool: readonly ThemeColor[], count: number): ThemeColor[] {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

function pickPalette(mood: string | undefined, rand: () => number): ThemeColor[] {
  const base = MOOD_PALETTES[mood?.trim().toLowerCase() ?? ""] ?? pickRandom(rand, THEME_COLORS, 2);

  // Seeded 35% chance of a 3rd accent color for extra variety.
  if (rand() < 0.35) {
    const rest = THEME_COLORS.filter((c) => !base.includes(c));
    return [...base, rest[Math.floor(rand() * rest.length)]];
  }
  return base;
}

interface CoverArtProps {
  /** Same capsuleId always seeds the same art — it's the sole source of randomness. */
  capsuleId: string;
  mood?: string;
  size?: number;
}

/** Abstract, seeded cover art for a sealed capsule — a small wash of 3-4 soft blurred blobs. */
export default function CoverArt({ capsuleId, mood, size = 40 }: CoverArtProps) {
  const rand = mulberry32(hashString(capsuleId));
  const palette = pickPalette(mood, rand);
  const blobCount = 3 + Math.floor(rand() * 2); // 3 or 4
  const filterId = `coverart-blur-${hashString(capsuleId).toString(36)}`;

  const blobs = Array.from({ length: blobCount }, (_, i) => ({
    key: i,
    color: palette[Math.floor(rand() * palette.length)],
    cx: 15 + rand() * 70,
    cy: 15 + rand() * 70,
    r: 28 + rand() * 30,
    opacity: 0.35 + rand() * 0.35,
  }));

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-xl overflow-hidden flex-shrink-0 bg-tint"
      role="img"
      aria-label="Sealed — cover art"
    >
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>
        <g filter={`url(#${filterId})`}>
          {blobs.map((blob) => (
            <circle
              key={blob.key}
              cx={blob.cx}
              cy={blob.cy}
              r={blob.r}
              fill={colorVar(blob.color)}
              fillOpacity={blob.opacity}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
