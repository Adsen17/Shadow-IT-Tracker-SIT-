"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { BrutalCard, BrutalCardContent, BrutalCardHeader, BrutalCardTitle } from "@/components/ui/BrutalCard"
import { BrutalButton } from "@/components/ui/BrutalButton"
import { BrutalModal } from "@/components/ui/BrutalModal"
import { ArrowLeft, CheckCircle2, AlertTriangle, Printer } from "lucide-react"
import { useRouter } from "next/navigation"

import { fetchEmployeeDetails, revokeAccess, completeOffboarding } from "@/app/actions/employees"

// Remove mockEmployee and initialTools

export default function OffboardingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const [profile, setProfile] = React.useState<any>(null)
  const [tools, setTools] = React.useState<any[]>([])
  const [isInitializing, setIsInitializing] = React.useState(true)
  
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false)
  const [isCompleted, setIsCompleted] = React.useState(false)

  const loadData = async () => {
    try {
      const data = await fetchEmployeeDetails(id)
      setProfile(data.profile)
      setTools(data.userTools || [])
    } catch (e) {
      console.error(e)
    } finally {
      setIsInitializing(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [id])

  const pendingCount = tools.filter(t => t.status === "active").length

  const handleRevoke = async (toolId: string) => {
    // Optimistic update
    setTools(current => current.map(t => t.tool_id === toolId ? { ...t, status: "revoked" } : t))
    await revokeAccess(id, toolId)
  }

  const handleComplete = async () => {
    setIsConfirmOpen(false)
    setIsCompleted(true)
    await completeOffboarding(id)
    setTimeout(() => {
      router.push("/employees")
    }, 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  if (isCompleted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <CheckCircle2 size={80} className="text-green mx-auto" />
        </motion.div>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Offboarding Complete</h1>
          <p className="text-muted font-bold text-lg">All access has been securely revoked for {profile?.full_name}.</p>
        </div>
      </div>
    )
  }

  if (isInitializing) return <div className="p-8">Loading...</div>
  if (!profile) return <div className="p-8">Employee not found.</div>

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href={`/employees/${profile.id}`} className="inline-flex items-center gap-2 text-sm font-bold hover:underline mb-4">
            <ArrowLeft size={16} /> Cancel Offboarding
          </Link>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Offboarding Generator</h1>
          <p className="text-muted font-bold">Revoke all third-party SaaS access for {profile.full_name}.</p>
        </div>
        <div className="flex gap-2">
          <BrutalButton variant="secondary" onClick={handlePrint} className="print-hidden">
            <Printer size={20} className="mr-2" />
            Print Checklist
          </BrutalButton>
        </div>
      </div>

      <BrutalCard className="border-4 border-ink shadow-[8px_8px_0_#111]">
        <BrutalCardHeader className="bg-primary text-white border-b-4">
          <div className="flex justify-between items-center">
            <BrutalCardTitle className="text-2xl">Access Checklist</BrutalCardTitle>
            <span className="bg-ink text-white px-3 py-1 font-black rounded-none border-2 border-white">
              {pendingCount} Pending
            </span>
          </div>
        </BrutalCardHeader>
        <BrutalCardContent className="p-0 bg-surface">
          <ul className="divide-y-4 divide-ink">
            <AnimatePresence>
              {tools.map((tool) => (
                <motion.li
                  key={tool.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 flex items-center justify-between transition-colors ${
                    tool.status === "revoked" ? "bg-white" : ""
                  }`}
                >
                  <div>
                    <p className={`font-black text-xl ${tool.status === "revoked" ? "line-through text-muted" : "text-ink"}`}>
                      {tool.name}
                    </p>
                    <p className="text-sm font-bold text-muted">{tool.category}</p>
                  </div>
                  
                  {tool.status === "active" ? (
                    <BrutalButton variant="warning" onClick={() => handleRevoke(tool.tool_id)}>
                      Revoke Access
                    </BrutalButton>
                  ) : (
                    <span className="flex items-center gap-2 font-black text-green border-2 border-green bg-green/10 px-3 py-2">
                      <CheckCircle2 size={20} /> Revoked
                    </span>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </BrutalCardContent>
      </BrutalCard>

      <div className="flex justify-end pt-4">
        <BrutalButton 
          size="lg"
          variant={pendingCount === 0 ? "primary" : "secondary"}
          onClick={() => pendingCount === 0 ? setIsConfirmOpen(true) : alert("Please revoke all access first.")}
          className={pendingCount !== 0 ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
        >
          Complete Offboarding
        </BrutalButton>
      </div>

      <BrutalModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Offboarding Completion"
      >
        <div className="space-y-6">
          <div className="p-4 border-4 border-ink bg-yellow flex items-start gap-4">
            <AlertTriangle className="text-ink shrink-0 mt-1" size={24} />
            <div>
              <p className="font-black text-lg leading-tight mb-2">Are you absolutely sure?</p>
              <p className="text-sm font-bold">By completing this offboarding, you confirm that all external SaaS accounts for {profile.full_name} have been successfully deleted or suspended.</p>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <BrutalButton variant="ghost" onClick={() => setIsConfirmOpen(false)}>Cancel</BrutalButton>
            <BrutalButton variant="danger" onClick={handleComplete}>Yes, Complete Offboarding</BrutalButton>
          </div>
        </div>
      </BrutalModal>
    </div>
  )
}
