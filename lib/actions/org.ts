"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAuditEntry } from "@/lib/audit"

export async function createOrganization(formData: FormData) {
  const name = (formData.get("name") as string)?.trim()
  const timezone = (formData.get("timezone") as string)?.trim()

  if (!name) {
    return { error: "Organization name is required." }
  }

  if (name.length < 2) {
    return { error: "Organization name must be at least 2 characters." }
  }

  if (!timezone) {
    return { error: "Timezone is required." }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to create an organization." }
  }

  // Check if user already has an org membership
  const { data: existingMembership } = await supabase
    .from("memberships")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .single()

  if (existingMembership) {
    redirect("/dashboard")
  }

  // Create organization
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name,
      timezone,
    })
    .select("id")
    .single()

  if (orgError) {
    return { error: "Failed to create organization. Please try again." }
  }

  // Create membership (owner role)
  const { error: membershipError } = await supabase
    .from("memberships")
    .insert({
      org_id: org.id,
      user_id: user.id,
      role: "owner",
    })

  if (membershipError) {
    // Attempt to clean up the org if membership creation fails
    await supabase.from("organizations").delete().eq("id", org.id)
    return { error: "Failed to set up organization membership. Please try again." }
  }

  // Audit log entry
  await createAuditEntry(
    org.id,
    "org.created",
    "organization",
    org.id,
    { name, timezone }
  )

  redirect("/dashboard")
}
