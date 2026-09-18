"use client";

import Link from "next/link";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import Icon from "./Icon";

type Variant = "primary" | "secondary" | "white";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-coral text-white shadow-[0_8px_16px_-6px_rgba(235,78,78,0.5)] hover:brightness-105",
  secondary:
    "bg-white text-sky-deep border-2 border-line hover:border-sky",
  white: "bg-white text-sky-deep hover:bg-cream",
};

const MotionLink = motion.create(Link);

interface BaseProps {
  variant?: Variant;
  /** Shows a spinner and blocks clicks while an async action runs. */
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

// Renders as a <Link> when `href` is passed, otherwise a real <button>.
type ButtonProps = BaseProps &
  Omit<HTMLMotionProps<"button">, "children" | "className"> & { href?: string };

// One shared press/hover feel for every button in the app.
const press = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring", stiffness: 500, damping: 30 },
} as const;

export default function Button({
  variant = "primary",
  href,
  children,
  className = "",
  loading = false,
  disabled,
  ...rest
}: ButtonProps) {
  const inactive = loading || disabled;
  const classes = `font-display text-sm text-center py-3 px-4 rounded-2xl w-full
    transition-colors ${variantClasses[variant]} ${className}
    disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:brightness-100`;

  if (href) {
    return (
      <MotionLink href={href} className={`block ${classes}`} {...press}>
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.button
      className={`${classes} ${loading ? "!inline-flex items-center justify-center gap-2" : ""}`}
      {...(inactive ? {} : press)}
      disabled={inactive}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Icon as={Loader2} className="animate-spin" />}
      {children}
    </motion.button>
  );
}
