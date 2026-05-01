"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { logAudit } from "./audit"

const toolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  url: z.string().optional(),
  risk_level: z.enum(["low", "medium", "high"]),
  monthly_cost: z.number().min(0).default(0),
  notes: z.string().optional() // We'll store the text owner here for now
})

export async function fetchTools() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  
  return data.map(tool => ({
    id: tool.id,
    name: tool.name,
    category: tool.category,
    url: tool.url || "",
    risk: tool.risk_level.charAt(0).toUpperCase() + tool.risk_level.slice(1) as "Low" | "Medium" | "High",
    cost: `$${tool.monthly_cost}/mo`,
    owner: tool.notes || "N/A" // Map notes to owner string
  }))
}

export async function createTool(formData: FormData) {
  const supabase = await createClient()
  
  const rawData = {
    name: formData.get("name") as string,
    category: formData.get("category") as string,
    url: formData.get("url") as string,
    risk_level: (formData.get("risk_level") as string).toLowerCase() as "low" | "medium" | "high",
    monthly_cost: Number(formData.get("monthly_cost")) || 0,
    notes: formData.get("owner") as string // Store string owner in notes
  }
  
  const validation = toolSchema.safeParse(rawData)
  if (!validation.success) {
    return { error: validation.error.issues.map(e => e.message).join(", ") }
  }

  const { data, error } = await supabase
    .from('tools')
    .insert(validation.data)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Audit Log
  await logAudit('create', 'tools', data.id, validation.data)
  
  revalidatePath('/tools')
  revalidatePath('/dashboard')
  return { success: true, data }
}

export async function deleteTool(id: string) {
  const supabase = await createClient()
  
  // RBAC validation is primarily handled by Postgres RLS, 
  // but we should still fetch to see what we're deleting for the audit log
  const { data: tool } = await supabase.from('tools').select('name').eq('id', id).single()

  const { error } = await supabase
    .from('tools')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  await logAudit('delete', 'tools', id, { name: tool?.name })
  
  revalidatePath('/tools')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function bulkDeleteTools(ids: string[]) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('tools')
    .delete()
    .in('id', ids)

  if (error) {
    return { error: error.message }
  }

  await logAudit('delete', 'tools', null, { deleted_count: ids.length, ids })
  
  revalidatePath('/tools')
  revalidatePath('/dashboard')
  return { success: true }
}
