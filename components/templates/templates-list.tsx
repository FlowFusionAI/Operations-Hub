"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { FileText, Plus, ListChecks } from "lucide-react"
import {
  pageVariants,
  containerVariants,
  listItemVariants,
} from "@/lib/motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import type { TemplateListItem } from "@/lib/queries/templates"

interface TemplatesListProps {
  templates: TemplateListItem[]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function TemplatesList({ templates }: TemplatesListProps) {
  const [activeOnly, setActiveOnly] = useState(true)

  const filtered = activeOnly
    ? templates.filter((t) => t.status === "active")
    : templates

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Templates
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Onboarding Templates
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create and manage reusable onboarding workflows
          </p>
        </div>

        <Button asChild>
          <Link href="/templates/new">
            <Plus className="h-4 w-4" />
            New Template
          </Link>
        </Button>
      </div>

      {/* Filter */}
      <div className="mb-6 flex items-center gap-3">
        <Switch
          id="active-filter"
          checked={activeOnly}
          onCheckedChange={setActiveOnly}
        />
        <label
          htmlFor="active-filter"
          className="cursor-pointer text-sm text-muted-foreground select-none"
        >
          Active only
        </label>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState hasTemplates={templates.length > 0} />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-3"
        >
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_100px_80px_100px_120px] gap-4 px-5 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>Name</span>
            <span>Status</span>
            <span>Version</span>
            <span>Tasks</span>
            <span>Created</span>
          </div>

          {filtered.map((template) => (
            <motion.div key={template.id} variants={listItemVariants}>
              <Link
                href={`/templates/${template.id}`}
                className="group block rounded-xl border border-border bg-card px-5 py-4 transition-shadow hover-glow sm:grid sm:grid-cols-[1fr_100px_80px_100px_120px] sm:items-center sm:gap-4"
              >
                {/* Name */}
                <div className="flex items-center gap-3">
                  <FileText className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
                  <span className="font-medium group-hover:text-primary transition-colors">
                    {template.name}
                  </span>
                </div>

                {/* Status badge */}
                <div className="mt-2 sm:mt-0">
                  <Badge
                    variant={template.status === "active" ? "default" : "secondary"}
                    className={
                      template.status === "active"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {template.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Version */}
                <div className="mt-1 sm:mt-0">
                  <span className="text-sm text-muted-foreground sm:text-foreground">
                    <span className="sm:hidden text-xs text-muted-foreground">v</span>
                    {template.version}
                  </span>
                </div>

                {/* Task count */}
                <div className="mt-1 sm:mt-0">
                  <span className="text-sm text-muted-foreground sm:text-foreground">
                    <span className="sm:hidden text-xs text-muted-foreground mr-1">Tasks:</span>
                    {template.task_count}
                  </span>
                </div>

                {/* Created date */}
                <div className="mt-1 sm:mt-0">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(template.created_at)}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

function EmptyState({ hasTemplates }: { hasTemplates: boolean }) {
  return (
    <motion.div
      variants={listItemVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <ListChecks className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">
        {hasTemplates ? "No active templates" : "No templates yet"}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {hasTemplates
          ? "All your templates are inactive. Toggle the filter above to see them, or create a new one."
          : "Templates are reusable onboarding plans. Create your first template to get started."}
      </p>
      {!hasTemplates && (
        <Button asChild className="mt-6">
          <Link href="/templates/new">
            <Plus className="h-4 w-4" />
            Create Template
          </Link>
        </Button>
      )}
    </motion.div>
  )
}
