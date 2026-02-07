import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/sidebar"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user's membership + org info
  const { data: membership } = await supabase
    .from("memberships")
    .select("id, role, org_id, organizations(id, name)")
    .eq("user_id", user.id)
    .limit(1)
    .single()

  if (!membership) {
    redirect("/create-org")
  }

  const org = membership.organizations as unknown as { id: string; name: string }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar orgName={org.name} userEmail={user.email ?? ""} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
