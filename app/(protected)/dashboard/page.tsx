import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("role, organizations(name)")
    .eq("user_id", user.id)
    .limit(1)
    .single()

  if (!membership) {
    redirect("/create-org")
  }

  const org = membership.organizations as unknown as { name: string }

  return <DashboardContent orgName={org.name} userRole={membership.role} />
}
