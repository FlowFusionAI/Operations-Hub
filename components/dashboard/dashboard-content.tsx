"use client"

import { motion } from "framer-motion"
import {
  Users,
  FileText,
  PlayCircle,
  Activity,
} from "lucide-react"
import { pageVariants, containerVariants, listItemVariants } from "@/lib/motion"

const PLACEHOLDER_CARDS = [
  {
    label: "Active Employees",
    value: "--",
    icon: Users,
    description: "Onboarding in progress",
  },
  {
    label: "Templates",
    value: "--",
    icon: FileText,
    description: "Available workflows",
  },
  {
    label: "Active Onboardings",
    value: "--",
    icon: PlayCircle,
    description: "Currently running",
  },
  {
    label: "Tasks Due Today",
    value: "--",
    icon: Activity,
    description: "Pending completion",
  },
] as const

interface DashboardContentProps {
  orgName: string
  userRole: string
}

export function DashboardContent({ orgName, userRole }: DashboardContentProps) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {userRole}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Welcome to {orgName}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your operations dashboard. Manage onboarding workflows, employees, and
          tasks from here.
        </p>
      </div>

      {/* Placeholder metric cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {PLACEHOLDER_CARDS.map(({ label, value, icon: Icon, description }) => (
          <motion.div
            key={label}
            variants={listItemVariants}
            className="rounded-xl border border-border bg-card p-5 transition-shadow hover-glow"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
