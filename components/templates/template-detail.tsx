"use client"

import { useState, useTransition, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  Calendar,
  User,
  UserCog,
  Mail,
  Paperclip,
  ExternalLink,
  Clock,
  ListChecks,
  Hash,
} from "lucide-react"
import {
  pageVariants,
  containerVariants,
  listItemVariants,
  fadeInVariants,
} from "@/lib/motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { addBusinessDays } from "@/lib/dates"
import { toggleTemplateStatus, deleteTemplate } from "@/lib/actions/templates"
import type { TemplateWithTasks } from "@/lib/queries/templates"
import { toast } from "sonner"

interface TemplateDetailProps {
  template: TemplateWithTasks
  skipWeekends: boolean
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatPreviewDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const ASSIGNEE_LABELS: Record<string, { label: string; icon: typeof User }> = {
  employee: { label: "Employee", icon: User },
  manager: { label: "Manager", icon: UserCog },
  custom_email: { label: "Custom Email", icon: Mail },
}

export function TemplateDetail({ template, skipWeekends }: TemplateDetailProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [previewDate, setPreviewDate] = useState("")

  const previewSchedule = useMemo(() => {
    if (!previewDate) return null
    const start = new Date(previewDate + "T00:00:00")
    if (isNaN(start.getTime())) return null

    return template.tasks.map((task) => ({
      ...task,
      dueDate: addBusinessDays(start, task.day_offset, skipWeekends),
    }))
  }, [previewDate, template.tasks, skipWeekends])

  function handleToggleStatus() {
    const newStatus = template.status === "active" ? "inactive" : "active"
    startTransition(async () => {
      const result = await toggleTemplateStatus(template.id, newStatus)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(
          `Template ${newStatus === "active" ? "activated" : "deactivated"}`
        )
        router.refresh()
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteTemplate(template.id)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      {/* Back link */}
      <Link
        href="/templates"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All Templates
      </Link>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {template.name}
            </h1>
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

          {template.role_description && (
            <p className="text-muted-foreground leading-7">
              {template.role_description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5" />
              <span className="font-mono">v{template.version}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ListChecks className="h-3.5 w-3.5" />
              {template.tasks.length} task{template.tasks.length !== 1 && "s"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(template.created_at)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/templates/${template.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            disabled={isPending}
          >
            {template.status === "active" ? (
              <>
                <ToggleRight className="h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4" />
                Activate
              </>
            )}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isPending}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete template</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &ldquo;{template.name}&rdquo; and
                  all its tasks. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Delete Template
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-8 h-px w-full bg-border" />

      {/* Task List */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Tasks</h2>

        {template.tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <ListChecks className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              No tasks defined yet. Edit this template to add tasks.
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-3"
          >
            {template.tasks.map((task, index) => {
              const assignee = ASSIGNEE_LABELS[task.assignee_type] ?? ASSIGNEE_LABELS.employee
              const AssigneeIcon = assignee.icon
              const attachments = (task.attachments ?? []) as {
                name: string
                url: string
              }[]

              return (
                <motion.div
                  key={task.id}
                  variants={listItemVariants}
                  className="rounded-xl border border-border bg-card px-5 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary font-mono">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-medium leading-snug">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 text-sm text-muted-foreground">
                      <span
                        className="inline-flex items-center gap-1.5"
                        title="Day offset from start date"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        Day {task.day_offset}
                      </span>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="mt-3 flex flex-wrap items-center gap-3 pl-9">
                    <Badge variant="outline" className="gap-1.5">
                      <AssigneeIcon className="h-3 w-3" />
                      {assignee.label}
                    </Badge>

                    {task.assignee_type === "custom_email" &&
                      task.custom_email && (
                        <span className="text-xs text-muted-foreground font-mono">
                          {task.custom_email}
                        </span>
                      )}

                    {attachments.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Paperclip className="h-3 w-3" />
                        {attachments.length} attachment
                        {attachments.length !== 1 && "s"}
                      </span>
                    )}
                  </div>

                  {/* Attachments */}
                  {attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2 pl-9">
                      {attachments.map((att, i) => (
                        <a
                          key={i}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/50 px-2.5 py-1 text-xs text-primary transition-colors hover:bg-primary/10"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {att.name}
                        </a>
                      ))}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </section>

      {/* Preview Schedule */}
      {template.tasks.length > 0 && (
        <motion.section
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Preview Schedule
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a hypothetical start date to see the full task schedule
                {skipWeekends && " (weekends are skipped)"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="preview-date" className="sr-only">
                Start date
              </label>
              <Input
                id="preview-date"
                type="date"
                value={previewDate}
                onChange={(e) => setPreviewDate(e.target.value)}
                className="w-44"
              />
            </div>
          </div>

          {previewSchedule && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              {/* Table header */}
              <div className="grid grid-cols-[auto_1fr_120px_140px] gap-4 border-b border-border px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span className="w-8">#</span>
                <span>Task</span>
                <span>Day Offset</span>
                <span>Due Date</span>
              </div>

              {/* Rows */}
              {previewSchedule.map((task, index) => {
                const dueDay = task.dueDate.getDay()
                const isWeekend = dueDay === 0 || dueDay === 6

                return (
                  <motion.div
                    key={task.id}
                    variants={listItemVariants}
                    className="grid grid-cols-[auto_1fr_120px_140px] items-center gap-4 border-b border-border/50 px-5 py-3 last:border-b-0"
                  >
                    <span className="w-8 text-xs font-mono text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium truncate">
                      {task.title}
                    </span>
                    <span className="text-sm text-muted-foreground font-mono">
                      +{task.day_offset}d
                    </span>
                    <span
                      className={`text-sm font-mono ${
                        isWeekend
                          ? "text-amber-400"
                          : "text-foreground"
                      }`}
                    >
                      {formatPreviewDate(task.dueDate)}
                    </span>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {!previewSchedule && (
            <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mx-auto">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Select a start date above to preview the task schedule
              </p>
            </div>
          )}
        </motion.section>
      )}
    </motion.div>
  )
}
