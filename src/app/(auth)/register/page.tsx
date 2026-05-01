"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { BrutalCard, BrutalCardContent, BrutalCardHeader, BrutalCardTitle } from "@/components/ui/BrutalCard"
import { BrutalInput } from "@/components/ui/BrutalInput"
import { BrutalButton } from "@/components/ui/BrutalButton"
import { ShieldAlert, Loader2 } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call and redirect
    setTimeout(() => {
      router.push("/login")
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-10 right-10 w-32 h-32 bg-green border-4 border-ink shadow-brutal opacity-50 hidden md:block" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-primary border-4 border-ink shadow-brutal opacity-50 rounded-full hidden md:block" />
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary border-4 border-ink shadow-brutal flex items-center justify-center mb-4 text-white">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">SIT Tracker</h1>
        </div>

        <BrutalCard className="border-4 shadow-brutal-lg">
          <BrutalCardHeader className="bg-surface border-b-4 border-ink">
            <BrutalCardTitle className="text-2xl text-center">Create Account</BrutalCardTitle>
          </BrutalCardHeader>
          <BrutalCardContent className="p-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label className="font-bold text-sm uppercase">Full Name</label>
                <BrutalInput required placeholder="Budi Santoso" disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <label className="font-bold text-sm uppercase">Email Address</label>
                <BrutalInput type="email" required placeholder="admin@company.com" disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <label className="font-bold text-sm uppercase">Password</label>
                <BrutalInput type="password" required placeholder="••••••••" disabled={isLoading} />
              </div>
              
              <BrutalButton type="submit" className="w-full justify-center" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Creating Account...
                  </>
                ) : (
                  "Register"
                )}
              </BrutalButton>
              
              <p className="text-center text-sm font-bold mt-4">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Login here
                </Link>
              </p>
            </form>
          </BrutalCardContent>
        </BrutalCard>
      </motion.div>
    </div>
  )
}
