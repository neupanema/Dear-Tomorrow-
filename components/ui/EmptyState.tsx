"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import Button from "./Button";
import Icon from "./Icon";

interface EmptyStateProps {
  /** Spot illustration (or a small icon tile for compact states). */
  illustration: React.ReactNode;
  title: string;
  body: string;
  /** The one thing to do next. */
  action: {
    label: string;
    icon?: LucideIcon;
    href?: string;
    onClick?: () => void;
    variant?: "primary" | "secondary";
  };
  className?: string;
}

export default function EmptyState({
  illustration,
  title,
  body,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`flex flex-col items-center text-center px-6 ${className}`}
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        className="mb-4"
      >
        {illustration}
      </motion.div>
      <h2 className="font-display text-heading text-ink mb-1">{title}</h2>
      <p className="text-body text-ink-soft max-w-[260px] mb-5">{body}</p>
      <div className="w-full max-w-[220px]">
        <Button
          href={action.href}
          onClick={action.onClick}
          variant={action.variant ?? "primary"}
          className="!inline-flex items-center justify-center gap-2"
        >
          {action.icon && <Icon as={action.icon} />}
          {action.label}
        </Button>
      </div>
    </motion.div>
  );
}
