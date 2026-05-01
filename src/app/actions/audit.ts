"use server"

import { createClient } from "@/lib/supabase/server"

export type AuditAction = 'create' | 'update' | 'delete' | 'revoke' | 'offboarding_start' | 'offboarding_complete' | 'assign_access'

export async function logAudit(action: AuditAction, targetTable: string, targetId: string | null, changesJson: Record<string, any>) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    console.error("Cannot log audit: No active session")
    return
  }

  const { error } = await supabase
    .from('audit_logs')
    .insert({
      actor_id: session.user.id,
      action: action,
      target_table: targetTable,
      target_id: targetId,
      changes_json: changesJson
    })

  if (error) {
    console.error("Failed to insert audit log:", error)
  }
}

export async function fetchAuditLogs() {
  const supabase = await createClient()
  
  // Also fetch the actor's profile to get the name
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      id,
      action,
      target_table,
      target_id,
      changes_json,
      created_at,
      profiles:actor_id (
        full_name,
        role
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  
  return data.map(log => ({
    id: log.id,
    action: log.action.toUpperCase(),
    targetTable: log.target_table,
    targetId: log.target_id || "N/A",
    actor: log.profiles ? (log.profiles as any).full_name || (log.profiles as any).role : "Unknown",
    changes: JSON.stringify(log.changes_json),
    timestamp: new Date(log.created_at).toLocaleString()
  }))
}
