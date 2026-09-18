"use client";

import { motion } from "framer-motion";

interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function Chip({ label, active, onClick }: ChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={!!active}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`text-body font-bold px-3 py-2 rounded-full border-2 transition-colors ${
        active
          ? "bg-accent text-on-accent border-accent"
          : "bg-surface text-ink-soft border-line hover:border-accent hover:text-accent"
      }`}
    >
      {label}
    </motion.button>
  );
}
