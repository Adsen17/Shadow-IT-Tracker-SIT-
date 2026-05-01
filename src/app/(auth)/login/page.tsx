"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { BrutalCard, BrutalCardContent, BrutalCardHeader, BrutalCardTitle } from "@/components/ui/BrutalCard"
import { BrutalInput } from "@/components/ui/BrutalInput"
import { BrutalButton } from "@/components/ui/BrutalButton"
import { BrutalModal } from "@/components/ui/BrutalModal"
import { ShieldAlert, Loader2, CheckCircle2, AlertTriangle, Users } from "lucide-react"
import { login } from "@/app/actions/auth"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  
  const [isErrorOpen, setIsErrorOpen] = React.useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("Invalid email or password.")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData()
    formData.append("email", email)
    formData.append("password", password)
    
    try {
      // Using the server action indirectly to prevent unhandled redirects in try-catch
      const result = await login(formData)
      if (result && result.error) {
        setErrorMessage(result.error)
        setIsErrorOpen(true)
        setIsLoading(false)
      }
    } catch (err) {
      // Next.js redirect() throws an error that we must catch but ignore if we want to do something, 
      // but in server actions, redirect is usually returned. If it throws, it's a redirect error.
      // So if we reach here and it's not a redirect error, it's a real error.
      if ((err as Error).message !== "NEXT_REDIRECT") {
        setErrorMessage("An unexpected error occurred.")
        setIsErrorOpen(true)
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-cyan border-4 border-ink shadow-brutal opacity-50 hidden md:block" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-yellow border-4 border-ink shadow-brutal opacity-50 rounded-full hidden md:block" />
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary border-4 border-ink shadow-[4px_4px_0_#111] flex items-center justify-center mb-4 text-white">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">SIT Tracker</h1>
          <p className="text-muted font-bold text-sm">Shadow IT Management Portal</p>
        </div>

        <BrutalCard className="border-4 shadow-[8px_8px_0_#111]">
          <BrutalCardHeader className="bg-surface border-b-4 border-ink">
            <BrutalCardTitle className="text-2xl text-center">System Login</BrutalCardTitle>
          </BrutalCardHeader>
          <BrutalCardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="font-bold text-sm uppercase">Email Address</label>
                <BrutalInput 
                  type="email" 
                  required 
                  placeholder="admin@company.com" 
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus-visible:ring-4 focus-visible:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="font-bold text-sm uppercase">Password</label>
                <BrutalInput 
                  type="password" 
                  required 
                  placeholder="admin123" 
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus-visible:ring-4 focus-visible:ring-primary/50"
                />
              </div>
              
              <BrutalButton type="submit" className="w-full justify-center focus-visible:ring-4 focus-visible:ring-primary/50 focus-visible:ring-offset-2" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Authenticating...
                  </>
                ) : (
                  "Login"
                )}
              </BrutalButton>
              
              <div className="mt-4 p-3 bg-surface border-2 border-ink text-sm">
                <p className="font-black mb-1">Demo Credentials:</p>
                <div className="font-mono text-xs flex justify-between border-b border-ink/20 pb-1 mb-1">
                  <span>admin@company.com</span><span>admin123</span>
                </div>
                <div className="font-mono text-xs flex justify-between text-muted">
                  <span>manager@company.com</span><span>manager123</span>
                </div>
              </div>
            </form>
          </BrutalCardContent>
        </BrutalCard>
      </motion.div>

      {/* Error Modal */}
      <BrutalModal isOpen={isErrorOpen} onClose={() => setIsErrorOpen(false)} title="Authentication Failed">
        <div className="space-y-6 text-center flex flex-col items-center p-4">
          <AlertTriangle size={64} className="text-red" />
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Login Failed</h3>
            <p className="font-bold text-muted">{errorMessage}</p>
          </div>
          <BrutalButton variant="danger" className="w-full justify-center" onClick={() => setIsErrorOpen(false)}>
            Try Again
          </BrutalButton>
        </div>
      </BrutalModal>

      {/* Success Modal (Not easily triggered with direct server action redirect, but keeping structure) */}
      <BrutalModal isOpen={isSuccessOpen} onClose={() => {}} title="Authentication Success">
        <div className="space-y-6 flex flex-col items-center text-center p-4">
          <ShieldAlert size={64} className="text-green" />
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Welcome Back</h3>
            <p className="font-bold text-muted">Redirecting to your dashboard...</p>
          </div>
        </div>
      </BrutalModal>
    </div>
  )
}
