"use client"

import { type HTMLMotionProps, motion } from "framer-motion"
import { cardVariants } from "@/lib/motion"
import { cn } from "@/lib/utils"

/**
 * Card wrapper with entrance animation and hover lift.
 * Renders a glass-elevated card with framer-motion animations.
 */
export function AnimatedCard({
  className,
  children,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm transition-shadow hover-glow",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
