"use client"

import { motion } from "framer-motion"
import { floatingOrbVariants } from "@/lib/motion"

/**
 * Ambient floating gradient orbs for dark backgrounds.
 * Renders behind content with pointer-events-none.
 */
export function BackgroundAnimation() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Primary indigo orb — top left */}
      <motion.div
        className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, oklch(0.60 0.18 265 / 0.4), oklch(0.60 0.18 265 / 0.05) 60%, transparent 80%)",
        }}
        variants={floatingOrbVariants(0)}
        animate="animate"
      />

      {/* Purple orb — top right */}
      <motion.div
        className="absolute -right-32 top-20 h-[500px] w-[500px] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.15 320 / 0.35), oklch(0.65 0.15 320 / 0.05) 60%, transparent 80%)",
        }}
        variants={floatingOrbVariants(7)}
        animate="animate"
      />

      {/* Deep blue orb — bottom center */}
      <motion.div
        className="absolute -bottom-32 left-1/3 h-[700px] w-[700px] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, oklch(0.50 0.20 265 / 0.3), oklch(0.50 0.20 265 / 0.05) 60%, transparent 80%)",
        }}
        variants={floatingOrbVariants(14)}
        animate="animate"
      />
    </div>
  )
}
