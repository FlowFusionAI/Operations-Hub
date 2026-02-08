"use server"

import { randomUUID } from "crypto"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAuditEntry } from "@/lib/audit"

interface TaskData {
  title: string
  description: string | null
  day_offset: number
  assignee_type: "employee" | "manager" | "custom_email"
  custom_email: string | null
  sort_order: number
  attachments: { name: string; url: string }[]
}

function parseTasks(formData: FormData): TaskData[] {
  const tasksJson = formData.get("tasks") as string
  if (!tasksJson) return []
  try {
    return JSON.parse(tasksJson) as TaskData[]
  } catch {
    return []
  }
}

export async function createTemplate(formData: FormData) {
  const name = (formData.get("name") as string)?.trim()
  const roleDescription = (formData.get("role_description") as string)?.trim() || null
  const status = formData.get("status") === "inactive" ? "inactive" as const : "active" as const
  const tasks = parseTasks(formData)

  if (!name) {
    return { error: "Template name is required." }
  }

  if (name.length < 2) {
    return { error: "Template name must be at least 2 characters." }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in." }
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("org_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .single()

  if (!membership) {
    return { error: "You must belong to an organization." }
  }

  if (membership.role !== "owner" && membership.role !== "admin") {
    return { error: "Only admins can create templates." }
  }

  const templateId = randomUUID()

  const { error: insertError } = await supabase
    .from("onboarding_templates")
    .insert({
      id: templateId,
      org_id: membership.org_id,
      name,
      role_description: roleDescription,
      status,
    })

  if (insertError) {
    console.error("Template creation failed:", insertError.message)
    return { error: "Failed to create template. Please try again." }
  }

  if (tasks.length > 0) {
    const { error: taskInsertError } = await supabase
      .from("template_tasks")
      .insert(
        tasks.map((task, index) => ({
          template_id: templateId,
          org_id: membership.org_id,
          title: task.title,
          description: task.description || null,
          day_offset: task.day_offset,
          assignee_type: task.assignee_type,
          custom_email: task.assignee_type === "custom_email" ? task.custom_email : null,
          sort_order: index,
          attachments: task.attachments || [],
        }))
      )

    if (taskInsertError) {
      console.error("Task creation failed:", taskInsertError.message)
      return { error: "Template created but failed to save tasks. Please edit and try again." }
    }
  }

  await createAuditEntry(
    membership.org_id,
    "template.created",
    "template",
    templateId,
    { name, status, task_count: tasks.length }
  )

  redirect(`/templates/${templateId}`)
}

export async function updateTemplate(formData: FormData) {
  const templateId = formData.get("template_id") as string
  const name = (formData.get("name") as string)?.trim()
  const roleDescription = (formData.get("role_description") as string)?.trim() || null
  const status = formData.get("status") === "inactive" ? "inactive" as const : "active" as const
  const currentVersion = Number(formData.get("version"))
  const tasks = parseTasks(formData)

  if (!templateId) {
    return { error: "Template ID is missing." }
  }

  if (!name) {
    return { error: "Template name is required." }
  }

  if (name.length < 2) {
    return { error: "Template name must be at least 2 characters." }
  }

  if (isNaN(currentVersion)) {
    return { error: "Invalid template version." }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in." }
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("org_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .single()

  if (!membership) {
    return { error: "You must belong to an organization." }
  }

  if (membership.role !== "owner" && membership.role !== "admin") {
    return { error: "Only admins can edit templates." }
  }

  const { error: updateError } = await supabase
    .from("onboarding_templates")
    .update({
      name,
      role_description: roleDescription,
      status,
      version: currentVersion + 1,
    })
    .eq("id", templateId)
    .eq("org_id", membership.org_id)

  if (updateError) {
    console.error("Template update failed:", updateError.message)
    return { error: "Failed to update template. Please try again." }
  }

  // Delete existing tasks and re-insert
  const { error: deleteError } = await supabase
    .from("template_tasks")
    .delete()
    .eq("template_id", templateId)
    .eq("org_id", membership.org_id)

  if (deleteError) {
    console.error("Task deletion failed:", deleteError.message)
    return { error: "Failed to update tasks. Please try again." }
  }

  if (tasks.length > 0) {
    const { error: taskInsertError } = await supabase
      .from("template_tasks")
      .insert(
        tasks.map((task, index) => ({
          template_id: templateId,
          org_id: membership.org_id,
          title: task.title,
          description: task.description || null,
          day_offset: task.day_offset,
          assignee_type: task.assignee_type,
          custom_email: task.assignee_type === "custom_email" ? task.custom_email : null,
          sort_order: index,
          attachments: task.attachments || [],
        }))
      )

    if (taskInsertError) {
      console.error("Task insertion failed:", taskInsertError.message)
      return { error: "Template updated but failed to save tasks. Please try again." }
    }
  }

  await createAuditEntry(
    membership.org_id,
    "template.updated",
    "template",
    templateId,
    { name, status, version: currentVersion + 1, task_count: tasks.length }
  )

  redirect(`/templates/${templateId}`)
}
