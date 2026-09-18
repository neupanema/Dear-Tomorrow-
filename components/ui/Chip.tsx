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
      className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-colors ${
        active
          ? "bg-sky-deep text-white border-sky-deep"
          : "bg-white text-ink-soft border-line hover:border-sky hover:text-sky-deep"
      }`}
    >
      {label}
    </motion.button>
  );
}
