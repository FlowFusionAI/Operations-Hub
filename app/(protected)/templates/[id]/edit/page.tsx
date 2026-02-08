import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { getTemplateById, getTemplateTasks } from "@/lib/queries/templates"
import { TemplateForm } from "@/components/templates/template-form"

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .single()

  if (!membership) {
    redirect("/create-org")
  }

  const template = await getTemplateById(id, membership.org_id)

  if (!template) {
    notFound()
  }

  const tasks = await getTemplateTasks(id, membership.org_id)

  return <TemplateForm template={template} existingTasks={tasks} />
}
