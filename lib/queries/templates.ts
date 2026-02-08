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
