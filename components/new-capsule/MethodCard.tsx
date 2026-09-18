"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import Icon from "@/components/ui/Icon";

interface MethodCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  active?: boolean;
  disabled?: boolean;
  badge?: string;
  onClick?: () => void;
}

export default function MethodCard({
  icon: Glyph,
  title,
  subtitle,
  active,
  disabled,
  badge,
  onClick,
}: MethodCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={disabled ? undefined : !!active}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`w-full text-left rounded-2xl p-4 mb-3 border-2 flex gap-3 items-start transition-colors ${
        active
          ? "border-accent bg-tint"
          : "border-line bg-surface"
      } ${disabled ? "opacity-50" : "hover:border-accent"}`}
    >
      <motion.div
        animate={{ scale: active ? 1.08 : 1, rotate: active ? -6 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white transition-colors ${
          active ? "bg-coral" : "bg-sky-deep"
        } ${disabled ? "!bg-gray-300" : ""}`}
      >
        <Icon as={Glyph} size="sm" />
      </motion.div>
      <div>
        <p className="font-bold text-body text-ink flex items-center gap-2">
          {title}
          {badge && (
            <span className="text-micro font-bold bg-sun text-on-sun px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </p>
        <p className="text-caption text-ink-soft mt-1">
          {subtitle}
        </p>
      </div>
    </motion.button>
  );
}
