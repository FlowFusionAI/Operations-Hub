import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getTemplatesWithTaskCount } from "@/lib/queries/templates"
import { TemplatesList } from "@/components/templates/templates-list"

export default async function TemplatesPage() {
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

  const templates = await getTemplatesWithTaskCount(membership.org_id)

  return <TemplatesList templates={templates} />
}
