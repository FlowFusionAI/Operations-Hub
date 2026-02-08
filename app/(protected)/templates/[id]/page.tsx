import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { getTemplateWithTasks } from "@/lib/queries/templates"
import { TemplateDetail } from "@/components/templates/template-detail"

export default async function TemplateDetailPage({
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

  const template = await getTemplateWithTasks(id, membership.org_id)

  if (!template) {
    notFound()
  }

  // Get org skip_weekends setting for preview schedule
  const { data: org } = await supabase
    .from("organizations")
    .select("skip_weekends")
    .eq("id", membership.org_id)
    .single()

  const skipWeekends = org?.skip_weekends ?? false

  return <TemplateDetail template={template} skipWeekends={skipWeekends} />
}
