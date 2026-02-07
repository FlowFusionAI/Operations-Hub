import { createClient } from "@/lib/supabase/server"
import type { Json } from "@/types/database"

export async function insertEvent(
  type: string,
  orgId: string,
  payload: Json,
  idempotencyKey?: string | null
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("events")
    .insert({
      type,
      org_id: orgId,
      payload,
      idempotency_key: idempotencyKey ?? null,
    })
    .select("id")
    .single()

  if (error) {
    console.error("Failed to insert event:", error.message)
    throw new Error(`Failed to insert event: ${error.message}`)
  }

  return data.id
}
