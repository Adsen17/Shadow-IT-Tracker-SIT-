"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { logAudit } from "./audit"
import { z } from "zod"

export async function fetchEmployees() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      department,
      is_active,
      user_tools (id, status)
    `)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  
  return data.map(emp => {
    // Count active tools
    const toolsCount = emp.user_tools?.filter((t: any) => t.status === 'active').length || 0
    
    // Determine status string
    let status: "Active" | "Offboarding" | "Terminated" = "Active"
    if (!emp.is_active) status = "Terminated"
    // We would ideally check offboarding_sessions table here for "Offboarding" status, 
    // but for simplicity, we derive it from active tools if is_active is true but an offboarding session exists.
    // For now, let's keep it simple.

    return {
      id: emp.id,
      name: emp.full_name || "Unnamed",
      email: emp.email,
      department: emp.department || "Unassigned",
      status: status,
      toolsCount: toolsCount
    }
  })
}

export async function fetchEmployeeDetails(id: string) {
  const supabase = await createClient()
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  
  const { data: userTools } = await supabase
    .from('user_tools')
    .select(`
      id,
      status,
      access_granted_at,
      tools (
        id,
        name,
        category,
        risk_level
      )
    `)
    .eq('user_id', id)

  return {
    profile,
    userTools: userTools?.map(ut => ({
      id: ut.id,
      tool_id: (ut.tools as any).id,
      name: (ut.tools as any).name,
      category: (ut.tools as any).category,
      risk: (ut.tools as any).risk_level,
      status: ut.status,
      granted_at: ut.access_granted_at
    })) || []
  }
}

export async function createEmployee(formData: FormData) {
  const supabase = await createClient()
  
  const rawData = {
    full_name: formData.get("name") as string,
    email: formData.get("email") as string,
    department: formData.get("department") as string,
    role: "staff", // Defaulting to staff for newly created users via this form
    is_active: true
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert(rawData)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Log the creation
  await logAudit('create', 'profiles', data.id, { name: rawData.full_name, department: rawData.department })

  revalidatePath('/employees')
  revalidatePath('/dashboard')
  return { success: true, data }
}

export async function deleteEmployee(id: string) {
  const supabase = await createClient()
  
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', id).single()

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  await logAudit('delete', 'profiles', id, { name: profile?.full_name })
  
  revalidatePath('/employees')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function bulkDeleteEmployees(ids: string[]) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('profiles')
    .delete()
    .in('id', ids)

  if (error) {
    return { error: error.message }
  }

  await logAudit('delete', 'profiles', null, { deleted_count: ids.length, ids })
  
  revalidatePath('/employees')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function revokeAccess(userId: string, toolId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('user_tools')
    .update({ status: 'revoked' })
    .eq('user_id', userId)
    .eq('tool_id', toolId)

  if (error) {
    return { error: error.message }
  }

  await logAudit('revoke', 'user_tools', `${userId}:${toolId}`, { status: 'revoked' })
  
  revalidatePath('/employees')
  revalidatePath(`/employees/${userId}`)
  revalidatePath(`/employees/${userId}/offboarding`)
  return { success: true }
}

export async function completeOffboarding(userId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: false })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  await logAudit('offboarding_complete', 'profiles', userId, { is_active: false })
  
  revalidatePath('/employees')
  revalidatePath(`/employees/${userId}`)
  return { success: true }
}
