import Link from "next/link";
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "white";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-coral text-white shadow-[0_8px_16px_-6px_rgba(235,78,78,0.5)]",
  secondary: "bg-white text-sky-deep border-2 border-line",
  white: "bg-white text-sky-deep",
};

interface BaseProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

// Renders as a <Link> when `href` is passed, otherwise a real <button>.
type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: string };

export default function Button({
  variant = "primary",
  href,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const classes = `font-display text-sm text-center py-3 px-4 rounded-2xl w-full
    active:scale-[0.98] transition-transform ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={`block ${classes}`}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
