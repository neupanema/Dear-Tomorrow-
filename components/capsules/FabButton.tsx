"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

const MotionLink = motion.create(Link);

export default function FabButton() {
  return (
    <MotionLink
      href="/new-capsule"
      className="absolute bottom-20 right-4 w-14 h-14 rounded-full bg-coral text-white
                 flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(235,78,78,0.5)]"
      aria-label="Create a new capsule"
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 350, damping: 20, delay: 0.25 }}
    >
      <Plus size={26} />
    </MotionLink>
  );
}
