import { createClient } from "@/lib/supabase/server"

export async function getTemplatesWithTaskCount(orgId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("onboarding_templates")
    .select("id, name, status, version, created_at, template_tasks(count)")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to load templates.")
  }

  return (data ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    status: t.status,
    version: t.version,
    created_at: t.created_at,
    task_count: (t.template_tasks as unknown as { count: number }[])[0]?.count ?? 0,
  }))
}

export type TemplateListItem = Awaited<
  ReturnType<typeof getTemplatesWithTaskCount>
>[number]

export async function getTemplateById(templateId: string, orgId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("onboarding_templates")
    .select("id, name, role_description, status, version, created_at, updated_at")
    .eq("id", templateId)
    .eq("org_id", orgId)
    .single()

  if (error) {
    return null
  }

  return data
}

export type TemplateDetail = NonNullable<
  Awaited<ReturnType<typeof getTemplateById>>
>

export async function getTemplateTasks(templateId: string, orgId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("template_tasks")
    .select("id, title, description, day_offset, assignee_type, custom_email, sort_order, attachments")
    .eq("template_id", templateId)
    .eq("org_id", orgId)
    .order("sort_order", { ascending: true })

  if (error) {
    return []
  }

  return data ?? []
}

export type TemplateTaskRow = Awaited<
  ReturnType<typeof getTemplateTasks>
>[number]
