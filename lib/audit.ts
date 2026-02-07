import { createClient } from "@/lib/supabase/server"
import type { Json } from "@/types/database"

export async function createAuditEntry(
  orgId: string,
  action: string,
  entityType: string,
  entityId?: string | null,
  meta?: Json,
  actorUserId?: string | null
) {
  const supabase = await createClient()

  // If no actor provided, get the current user
  let userId = actorUserId
  if (!userId) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    userId = user?.id ?? null
  }

  const { error } = await supabase.from("audit_log").insert({
    org_id: orgId,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    meta: meta ?? {},
    actor_user_id: userId,
  })

  if (error) {
    console.error("Failed to create audit log entry:", error.message)
  }
}
