"use server"

import { randomUUID } from "crypto"
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

  // Generate ID upfront so we don't need RETURNING (which requires a SELECT
  // policy the user can't satisfy before their membership exists).
  const orgId = randomUUID()

  // Create organization
  const { error: orgError } = await supabase
    .from("organizations")
    .insert({
      id: orgId,
      name,
      timezone,
    })

  if (orgError) {
    console.error("Org creation failed:", orgError.message)
    return { error: "Failed to create organization. Please try again." }
  }

  // Create membership (owner role)
  const { error: membershipError } = await supabase
    .from("memberships")
    .insert({
      org_id: orgId,
      user_id: user.id,
      role: "owner",
    })

  if (membershipError) {
    console.error("Membership creation failed:", membershipError.message)
    // Attempt to clean up the org if membership creation fails
    await supabase.from("organizations").delete().eq("id", orgId)
    return { error: "Failed to set up organization membership. Please try again." }
  }

  // Audit log entry
  await createAuditEntry(
    orgId,
    "org.created",
    "organization",
    orgId,
    { name, timezone }
  )

  redirect("/dashboard")
}
