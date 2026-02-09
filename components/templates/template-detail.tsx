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
  ChevronRight,
  List,
  BarChart3,
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

type ScheduleView = "table" | "gantt"

export function TemplateDetail({ template, skipWeekends }: TemplateDetailProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [previewDate, setPreviewDate] = useState("")
  const [scheduleView, setScheduleView] = useState<ScheduleView>("table")

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
            className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border/50"
          >
            {template.tasks.map((task, index) => {
              const assignee = ASSIGNEE_LABELS[task.assignee_type] ?? ASSIGNEE_LABELS.employee
              const AssigneeIcon = assignee.icon
              const attachments = (task.attachments ?? []) as {
                name: string
                url: string
              }[]

              return (
                <TaskRow
                  key={task.id}
                  task={task}
                  index={index}
                  assigneeLabel={assignee.label}
                  AssigneeIcon={AssigneeIcon}
                  attachments={attachments}
                />
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
            <div className="flex items-center gap-3">
              {previewSchedule && (
                <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
                  <button
                    type="button"
                    onClick={() => setScheduleView("table")}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      scheduleView === "table"
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                    Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleView("gantt")}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      scheduleView === "gantt"
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    Gantt
                  </button>
                </div>
              )}
              <label htmlFor="preview-date" className="sr-only">
                Start date
              </label>
              <Input
                id="preview-date"
                type="date"
                value={previewDate}
                onChange={(e) => setPreviewDate(e.target.value)}
                className="w-44 scheme-dark"
              />
            </div>
          </div>

          {previewSchedule && scheduleView === "table" && (
            <motion.div
              key="table-view"
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

          {previewSchedule && scheduleView === "gantt" && (
            <GanttChart tasks={previewSchedule} />
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

const ASSIGNEE_COLORS: Record<string, { bg: string; glow: string; text: string }> = {
  employee: {
    bg: "bg-primary",
    glow: "shadow-primary/40",
    text: "text-primary",
  },
  manager: {
    bg: "bg-emerald-500",
    glow: "shadow-emerald-500/40",
    text: "text-emerald-400",
  },
  custom_email: {
    bg: "bg-amber-500",
    glow: "shadow-amber-500/40",
    text: "text-amber-400",
  },
}

function formatGanttDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
}

function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function GanttChart({
  tasks,
}: {
  tasks: Array<TemplateWithTasks["tasks"][number] & { dueDate: Date }>
}) {
  const dateColumns = useMemo(() => {
    if (tasks.length === 0) return []

    const dueDates = tasks.map((t) => t.dueDate.getTime())
    const minTime = Math.min(...dueDates)
    const maxTime = Math.max(...dueDates)

    const columns: Date[] = []
    const current = new Date(minTime)
    while (current.getTime() <= maxTime) {
      columns.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return columns
  }, [tasks])

  const taskDateMap = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const task of tasks) {
      const key = getDateKey(task.dueDate)
      if (!map.has(key)) map.set(key, new Set())
      map.get(key)!.add(task.id)
    }
    return map
  }, [tasks])

  if (dateColumns.length === 0) return null

  const ROW_H = 36
  const COL_W = 100
  const LABEL_W = 180

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <div className="overflow-x-auto">
        <div
          className="relative"
          style={{ minWidth: LABEL_W + dateColumns.length * COL_W }}
        >
          {/* Header row */}
          <div className="flex border-b border-border">
            {/* Sticky label header */}
            <div
              className="sticky left-0 z-20 flex shrink-0 items-center border-r border-border bg-card px-4"
              style={{ width: LABEL_W, height: ROW_H }}
            >
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Task
              </span>
            </div>

            {/* Date columns */}
            <div className="flex">
              {dateColumns.map((date, i) => {
                const isWeekend = date.getDay() === 0 || date.getDay() === 6
                return (
                  <div
                    key={i}
                    className={`flex shrink-0 items-center justify-center border-r border-dashed border-border/50 font-mono text-[10px] ${
                      isWeekend
                        ? "text-amber-400/70 bg-amber-500/5"
                        : "text-muted-foreground"
                    }`}
                    style={{ width: COL_W, height: ROW_H }}
                  >
                    {formatGanttDate(date)}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Task rows */}
          {tasks.map((task, rowIndex) => {
            const colors = ASSIGNEE_COLORS[task.assignee_type] ?? ASSIGNEE_COLORS.employee

            return (
              <motion.div
                key={task.id}
                variants={listItemVariants}
                className={`flex border-b border-border/30 last:border-b-0 ${
                  rowIndex % 2 === 1 ? "bg-muted/5" : ""
                }`}
              >
                {/* Sticky task name */}
                <div
                  className="sticky left-0 z-10 flex shrink-0 items-center gap-2 border-r border-border bg-card px-4"
                  style={{ width: LABEL_W, height: ROW_H }}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${colors.bg}`}
                  />
                  <span className="min-w-0 truncate text-sm font-medium">
                    {task.title}
                  </span>
                </div>

                {/* Date cells */}
                <div className="flex">
                  {dateColumns.map((date, colIndex) => {
                    const dateKey = getDateKey(date)
                    const isHit = taskDateMap.get(dateKey)?.has(task.id)
                    const isWeekend =
                      date.getDay() === 0 || date.getDay() === 6

                    return (
                      <div
                        key={colIndex}
                        className={`flex shrink-0 items-center justify-center border-r border-dashed border-border/30 ${
                          isWeekend ? "bg-amber-500/5" : ""
                        }`}
                        style={{ width: COL_W, height: ROW_H }}
                      >
                        {isHit && (
                          <div
                            className={`h-5 rounded-md ${colors.bg} shadow-[0_0_10px_1px] ${colors.glow}`}
                            style={{ width: COL_W * 0.75 }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 border-t border-border px-4 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Assignee
        </span>
        {Object.entries(ASSIGNEE_LABELS).map(([key, { label }]) => {
          const colors = ASSIGNEE_COLORS[key] ?? ASSIGNEE_COLORS.employee
          return (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`h-2 w-4 rounded-sm ${colors.bg}`} />
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

function TaskRow({
  task,
  index,
  assigneeLabel,
  AssigneeIcon,
  attachments,
}: {
  task: TemplateWithTasks["tasks"][number]
  index: number
  assigneeLabel: string
  AssigneeIcon: typeof User
  attachments: { name: string; url: string }[]
}) {
  const [expanded, setExpanded] = useState(false)
  const hasDetails = !!task.description || attachments.length > 0

  return (
    <motion.div variants={listItemVariants}>
      <button
        type="button"
        onClick={() => hasDetails && setExpanded(!expanded)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
          hasDetails ? "cursor-pointer hover:bg-muted/30" : "cursor-default"
        }`}
      >
        {/* Expand indicator */}
        <ChevronRight
          className={`h-3 w-3 shrink-0 text-muted-foreground/50 transition-transform ${
            expanded ? "rotate-90" : ""
          } ${!hasDetails ? "invisible" : ""}`}
        />

        {/* Index */}
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-medium text-primary font-mono">
          {index + 1}
        </span>

        {/* Title */}
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {task.title}
        </span>

        {/* Inline meta */}
        <div className="flex shrink-0 items-center gap-2.5">
          <Badge variant="outline" className="gap-1 py-0 h-5 text-[10px]">
            <AssigneeIcon className="h-2.5 w-2.5" />
            {assigneeLabel}
          </Badge>

          {task.assignee_type === "custom_email" && task.custom_email && (
            <span className="hidden sm:inline text-[10px] text-muted-foreground font-mono max-w-[120px] truncate">
              {task.custom_email}
            </span>
          )}

          {attachments.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Paperclip className="h-2.5 w-2.5" />
              {attachments.length}
            </span>
          )}

          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-mono whitespace-nowrap">
            <Calendar className="h-3 w-3" />
            +{task.day_offset}d
          </span>
        </div>
      </button>

      {/* Expandable detail row */}
      {expanded && (
        <div className="px-4 pb-3 pl-[4.25rem]">
          {task.description && (
            <p className="text-xs text-muted-foreground leading-relaxed mb-2">
              {task.description}
            </p>
          )}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {attachments.map((att, i) => (
                <a
                  key={i}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded border border-border bg-background/50 px-2 py-0.5 text-[10px] text-primary transition-colors hover:bg-primary/10"
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                  {att.name}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
