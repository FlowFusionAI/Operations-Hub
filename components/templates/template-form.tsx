"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2, FileText, Plus, Trash2, ChevronUp, ChevronDown, Paperclip, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { createTemplate, updateTemplate } from "@/lib/actions/templates"
import { pageVariants, cardVariants, transitions } from "@/lib/motion"
import type { TemplateDetail, TemplateTaskRow } from "@/lib/queries/templates"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TaskRow {
  id: string
  title: string
  description: string
  day_offset: number
  assignee_type: "employee" | "manager" | "custom_email"
  custom_email: string
  attachments: { name: string; url: string }[]
}

function createEmptyTask(): TaskRow {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    day_offset: 0,
    assignee_type: "employee",
    custom_email: "",
    attachments: [],
  }
}

function initTasksFromTemplate(tasks: TemplateTaskRow[]): TaskRow[] {
  return tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description ?? "",
    day_offset: t.day_offset,
    assignee_type: t.assignee_type,
    custom_email: t.custom_email ?? "",
    attachments: Array.isArray(t.attachments)
      ? (t.attachments as { name: string; url: string }[])
      : [],
  }))
}

interface TemplateFormProps {
  template?: TemplateDetail
  existingTasks?: TemplateTaskRow[]
}

export function TemplateForm({ template, existingTasks }: TemplateFormProps) {
  const isEdit = !!template
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isActive, setIsActive] = useState(
    template ? template.status === "active" : true
  )
  const [tasks, setTasks] = useState<TaskRow[]>(
    existingTasks ? initTasksFromTemplate(existingTasks) : []
  )

  function updateTask(id: string, updates: Partial<TaskRow>) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    )
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function moveTask(index: number, direction: -1 | 1) {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= tasks.length) return
    setTasks((prev) => {
      const next = [...prev]
      const temp = next[index]
      next[index] = next[newIndex]
      next[newIndex] = temp
      return next
    })
  }

  function addAttachment(taskId: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, attachments: [...t.attachments, { name: "", url: "" }] }
          : t
      )
    )
  }

  function updateAttachment(
    taskId: string,
    index: number,
    field: "name" | "url",
    value: string
  ) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t
        const attachments = [...t.attachments]
        attachments[index] = { ...attachments[index], [field]: value }
        return { ...t, attachments }
      })
    )
  }

  function removeAttachment(taskId: string, index: number) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t
        const attachments = t.attachments.filter((_, i) => i !== index)
        return { ...t, attachments }
      })
    )
  }

  function validate(formData: FormData) {
    const newErrors: Record<string, string> = {}
    const name = (formData.get("name") as string)?.trim()

    if (!name) {
      newErrors.name = "Template name is required."
    } else if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters."
    }

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      if (!task.title.trim()) {
        newErrors[`task_${i}_title`] = "Task title is required."
      }
      if (task.day_offset < 0 || isNaN(task.day_offset)) {
        newErrors[`task_${i}_day_offset`] = "Day offset must be 0 or greater."
      }
      if (task.assignee_type === "custom_email" && !task.custom_email.trim()) {
        newErrors[`task_${i}_custom_email`] = "Custom email is required."
      }
    }

    return newErrors
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set("status", isActive ? "active" : "inactive")

    const validationErrors = validate(formData)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the errors before submitting.")
      return
    }

    // Serialize tasks into hidden field
    const tasksPayload = tasks.map((t, index) => ({
      title: t.title.trim(),
      description: t.description.trim() || null,
      day_offset: t.day_offset,
      assignee_type: t.assignee_type,
      custom_email: t.assignee_type === "custom_email" ? t.custom_email.trim() : null,
      sort_order: index,
      attachments: t.attachments.filter((a) => a.name.trim() && a.url.trim()),
    }))
    formData.set("tasks", JSON.stringify(tasksPayload))

    startTransition(async () => {
      const action = isEdit ? updateTemplate : createTemplate
      const result = await action(formData)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-2xl"
    >
      <Link
        href={template ? `/templates/${template.id}` : "/templates"}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {template ? "Back to template" : "All Templates"}
      </Link>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="glass-elevated glow-primary">
          <CardHeader className="space-y-2 pb-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...transitions.smooth, delay: 0.1 }}
              className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10"
            >
              <FileText className="h-5 w-5 text-primary" />
            </motion.div>
            <CardTitle className="text-center text-xl tracking-tight">
              {isEdit ? "Edit template" : "Create template"}
            </CardTitle>
            <CardDescription className="text-center">
              {isEdit
                ? "Update the template metadata and tasks"
                : "Set up a new onboarding template with tasks"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-5">
              {isEdit && (
                <>
                  <input type="hidden" name="template_id" value={template.id} />
                  <input
                    type="hidden"
                    name="version"
                    value={template.version}
                  />
                </>
              )}

              {/* Template name */}
              <div className="grid gap-2">
                <Label htmlFor="name" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Template name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g. Engineering Onboarding"
                  defaultValue={template?.name ?? ""}
                  autoFocus
                  disabled={isPending}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Role description */}
              <div className="grid gap-2">
                <Label htmlFor="role_description" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Role description
                </Label>
                <Textarea
                  id="role_description"
                  name="role_description"
                  placeholder="Describe the role this template is for (optional)"
                  defaultValue={template?.role_description ?? ""}
                  rows={3}
                  disabled={isPending}
                />
              </div>

              {/* Status toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
                <div className="grid gap-0.5">
                  <Label htmlFor="status" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Status
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {isActive ? "Template is active" : "Template is inactive"}
                  </p>
                </div>
                <Switch
                  id="status"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={isPending}
                />
              </div>

              {/* Tasks section */}
              <div className="grid gap-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Tasks ({tasks.length})
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setTasks((prev) => [...prev, createEmptyTask()])}
                    disabled={isPending}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add task
                  </Button>
                </div>

                {tasks.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border/50 px-4 py-8 text-center text-sm text-muted-foreground">
                    No tasks yet. Add tasks to define the onboarding workflow.
                  </div>
                )}

                <div className="grid gap-3">
                  {tasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={transitions.smooth}
                    >
                      <Card className="border-border/50 bg-muted/20">
                        <CardContent className="grid gap-3 p-4">
                          {/* Task header row */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-muted-foreground">
                              Task {index + 1}
                            </span>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => moveTask(index, -1)}
                                disabled={isPending || index === 0}
                              >
                                <ChevronUp className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => moveTask(index, 1)}
                                disabled={isPending || index === tasks.length - 1}
                              >
                                <ChevronDown className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => removeTask(task.id)}
                                disabled={isPending}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          {/* Title */}
                          <div className="grid gap-1.5">
                            <Label className="text-xs text-muted-foreground">
                              Title
                            </Label>
                            <Input
                              placeholder="e.g. Complete IT setup form"
                              value={task.title}
                              onChange={(e) =>
                                updateTask(task.id, { title: e.target.value })
                              }
                              disabled={isPending}
                            />
                            {errors[`task_${index}_title`] && (
                              <p className="text-xs text-destructive">
                                {errors[`task_${index}_title`]}
                              </p>
                            )}
                          </div>

                          {/* Description */}
                          <div className="grid gap-1.5">
                            <Label className="text-xs text-muted-foreground">
                              Description (optional)
                            </Label>
                            <Textarea
                              placeholder="Additional details about this task"
                              value={task.description}
                              onChange={(e) =>
                                updateTask(task.id, {
                                  description: e.target.value,
                                })
                              }
                              rows={2}
                              disabled={isPending}
                            />
                          </div>

                          {/* Day offset + Assignee row */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                              <Label className="text-xs text-muted-foreground">
                                Day offset
                              </Label>
                              <Input
                                type="number"
                                min={0}
                                value={task.day_offset}
                                onChange={(e) =>
                                  updateTask(task.id, {
                                    day_offset: parseInt(e.target.value, 10) || 0,
                                  })
                                }
                                disabled={isPending}
                              />
                              {errors[`task_${index}_day_offset`] && (
                                <p className="text-xs text-destructive">
                                  {errors[`task_${index}_day_offset`]}
                                </p>
                              )}
                            </div>
                            <div className="grid gap-1.5">
                              <Label className="text-xs text-muted-foreground">
                                Assignee
                              </Label>
                              <Select
                                value={task.assignee_type}
                                onValueChange={(val: "employee" | "manager" | "custom_email") =>
                                  updateTask(task.id, { assignee_type: val })
                                }
                                disabled={isPending}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="employee">Employee</SelectItem>
                                  <SelectItem value="manager">Manager</SelectItem>
                                  <SelectItem value="custom_email">Custom email</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Custom email (conditional) */}
                          {task.assignee_type === "custom_email" && (
                            <div className="grid gap-1.5">
                              <Label className="text-xs text-muted-foreground">
                                Custom email address
                              </Label>
                              <Input
                                type="email"
                                placeholder="e.g. it-team@company.com"
                                value={task.custom_email}
                                onChange={(e) =>
                                  updateTask(task.id, {
                                    custom_email: e.target.value,
                                  })
                                }
                                disabled={isPending}
                              />
                              {errors[`task_${index}_custom_email`] && (
                                <p className="text-xs text-destructive">
                                  {errors[`task_${index}_custom_email`]}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Attachments */}
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-muted-foreground">
                                <Paperclip className="mr-1 inline h-3 w-3" />
                                Attachments
                              </Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => addAttachment(task.id)}
                                disabled={isPending}
                              >
                                <Plus className="mr-1 h-3 w-3" />
                                Add
                              </Button>
                            </div>
                            {task.attachments.map((att, attIdx) => (
                              <div
                                key={attIdx}
                                className="flex items-center gap-2"
                              >
                                <Input
                                  placeholder="Name"
                                  value={att.name}
                                  onChange={(e) =>
                                    updateAttachment(
                                      task.id,
                                      attIdx,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  className="flex-1"
                                  disabled={isPending}
                                />
                                <Input
                                  placeholder="URL"
                                  value={att.url}
                                  onChange={(e) =>
                                    updateAttachment(
                                      task.id,
                                      attIdx,
                                      "url",
                                      e.target.value
                                    )
                                  }
                                  className="flex-[2]"
                                  disabled={isPending}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                                  onClick={() =>
                                    removeAttachment(task.id, attIdx)
                                  }
                                  disabled={isPending}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="mt-1 w-full"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEdit ? "Saving changes..." : "Creating template..."}
                  </>
                ) : isEdit ? (
                  "Save changes"
                ) : (
                  "Create template"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
