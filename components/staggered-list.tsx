"use client"

import { motion } from "framer-motion"
import { containerVariants, listItemVariants } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface StaggeredListProps {
  children: React.ReactNode
  className?: string
}

/**
 * Container that staggers the entrance of its children.
 * Children should be wrapped in <StaggeredListItem>.
 */
export function StaggeredList({ children, className }: StaggeredListProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

/**
 * Individual item inside a StaggeredList.
 */
export function StaggeredListItem({ children, className }: StaggeredListProps) {
  return (
    <motion.div variants={listItemVariants} className={cn(className)}>
      {children}
    </motion.div>
  )
}
