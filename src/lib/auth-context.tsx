"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Session, User } from "@supabase/supabase-js"
import { logout } from "@/app/actions/auth"

export type Role = "admin" | "manager" | "hr" | "it" | "staff" | null

interface AuthContextType {
  isAuthenticated: boolean
  role: Role
  user: User | null
  session: Session | null
  logoutUser: () => void
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null)
  const [user, setUser] = React.useState<User | null>(null)
  const [role, setRole] = React.useState<Role>(null)
  const [isInitializing, setIsInitializing] = React.useState(true)
  
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  React.useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user || null)
      
      if (session?.user) {
        // Fetch role from profiles table
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          
        setRole((data?.role as Role) || 'staff')
      }
      setIsInitializing(false)
    }

    fetchSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user || null)
      
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        setRole((data?.role as Role) || 'staff')
      } else {
        setRole(null)
      }
      
      if (event === 'SIGNED_IN') {
        router.refresh()
      } else if (event === 'SIGNED_OUT') {
        router.refresh()
        router.push('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const logoutUser = async () => {
    await logout()
  }

  // We no longer manually block routes here, we will use Next.js Middleware instead for real apps,
  // but for now, we can keep the client-side bounce for safety.
  React.useEffect(() => {
    if (isInitializing) return

    // Protect dashboard routes
    if (!session && (pathname?.startsWith("/dashboard") || pathname?.startsWith("/tools") || pathname?.startsWith("/employees") || pathname?.startsWith("/audit"))) {
      router.replace("/login")
    }
  }, [session, isInitializing, pathname, router])

  const isAuthenticated = !!session

  // We allow rendering immediately. The protected route logic in the useEffect will handle redirects.

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, user, session, logoutUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
