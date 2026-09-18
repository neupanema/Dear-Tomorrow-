import type { LucideIcon, LucideProps } from "lucide-react";

// The icon size scale for the whole app. Use these names instead of raw
// pixel numbers so icons stay consistent from screen to screen.
export const ICON_SIZE = {
  sm: 16, // inside chips, tiles, list rows
  md: 20, // navigation, back arrows, controls
  lg: 24, // decorative tiles, FAB
  xl: 32, // hero / status icons
} as const;

interface IconProps extends Omit<LucideProps, "size"> {
  as: LucideIcon;
  size?: keyof typeof ICON_SIZE;
}

/**
 * Thin wrapper around a lucide icon: applies the size scale above and hides
 * the glyph from screen readers. Icons here are decorative, the button or
 * link around them carries the accessible name. If an icon ever stands
 * alone, pass `aria-hidden={false}` and an `aria-label`.
 */
export default function Icon({ as: Glyph, size = "sm", ...props }: IconProps) {
  return <Glyph size={ICON_SIZE[size]} aria-hidden="true" focusable="false" {...props} />;
}
