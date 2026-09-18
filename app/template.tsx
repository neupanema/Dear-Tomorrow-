"use client";

import { motion } from "framer-motion";

// Unlike layout.tsx, a template re-mounts on every navigation, which makes
// it the simplest place for a subtle fade + slide-up between routes.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
