"use client"

import * as React from "react"
import Link from "next/link"
import { BrutalCard, BrutalCardContent, BrutalCardHeader, BrutalCardTitle } from "@/components/ui/BrutalCard"
import { BrutalButton } from "@/components/ui/BrutalButton"
import { RiskBadge } from "@/components/ui/RiskBadge"
import { BrutalModal } from "@/components/ui/BrutalModal"
import { UserMinus, ArrowLeft, Plus, CheckCircle2, AlertTriangle } from "lucide-react"

import { fetchEmployeeDetails } from "@/app/actions/employees"

// Remove mockEmployee

type ToolStatus = "Active" | "Revoked";
type RiskLevel = "Low" | "Medium" | "High";

interface AssignedTool {
  id: number;
  name: string;
  category: string;
  risk: RiskLevel;
  grantedAt: string;
  status: ToolStatus;
}

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [profile, setProfile] = React.useState<any>(null)
  const [tools, setTools] = React.useState<AssignedTool[]>([])
  const [isInitializing, setIsInitializing] = React.useState(true)
  
  const [isAssignOpen, setIsAssignOpen] = React.useState(false)
  const [isRevokeOpen, setIsRevokeOpen] = React.useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState("")
  const [selectedTool, setSelectedTool] = React.useState<number | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const loadData = async () => {
    try {
      const data = await fetchEmployeeDetails(id)
      setProfile(data.profile)
      setTools(data.userTools as any)
    } catch (e) {
      console.error(e)
    } finally {
      setIsInitializing(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [id])

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setIsAssignOpen(false)
      setSuccessMessage("Tool successfully assigned to employee.")
      setIsSuccessOpen(true)
    }, 800)
  }

  const handleRevokeClick = (id: number) => {
    setSelectedTool(id)
    setIsRevokeOpen(true)
  }

  const confirmRevoke = () => {
    setIsLoading(true)
    setTimeout(() => {
      setTools(tools.map(t => t.id === selectedTool ? { ...t, status: "Revoked" } : t))
      setIsLoading(false)
      setIsRevokeOpen(false)
      setSuccessMessage("Access has been revoked successfully.")
      setIsSuccessOpen(true)
    }, 800)
  }

  if (isInitializing) return <div className="p-8">Loading...</div>
  if (!profile) return <div className="p-8">Employee not found.</div>

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/employees" className="inline-flex items-center gap-2 text-sm font-bold hover:underline mb-4">
            <ArrowLeft size={16} /> Back to Employees
          </Link>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">{profile.full_name}</h1>
          <p className="text-muted font-bold">{profile.email} • {profile.department}</p>
        </div>
        <Link href={`/employees/${profile.id}/offboarding`}>
          <BrutalButton variant="danger" className="shadow-[4px_4px_0_#111]">
            <UserMinus size={20} />
            Initiate Offboarding
          </BrutalButton>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BrutalCard className="lg:col-span-1 h-fit">
          <BrutalCardHeader>
            <BrutalCardTitle>Profile</BrutalCardTitle>
          </BrutalCardHeader>
          <BrutalCardContent className="space-y-4">
            <div>
              <p className="text-xs font-bold text-muted uppercase">Status</p>
              <p className="font-black text-lg text-green">{profile.is_active ? "Active" : "Terminated"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-muted uppercase">Department</p>
              <p className="font-black text-lg">{profile.department}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-muted uppercase">Active Tools</p>
              <p className="font-black text-lg">{tools.filter(t => t.status === "Active").length}</p>
            </div>
          </BrutalCardContent>
        </BrutalCard>

        <BrutalCard className="lg:col-span-2">
          <div className="p-4 border-b-2 border-ink flex items-center justify-between bg-surface">
            <BrutalCardTitle>Assigned Tools</BrutalCardTitle>
            <BrutalButton size="sm" onClick={() => setIsAssignOpen(true)}>
              <Plus size={16} />
              Assign Tool
            </BrutalButton>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-ink bg-surface">
                  <th className="p-4 font-black uppercase tracking-wider">Tool</th>
                  <th className="p-4 font-black uppercase tracking-wider">Risk</th>
                  <th className="p-4 font-black uppercase tracking-wider">Granted At</th>
                  <th className="p-4 font-black uppercase tracking-wider">Status</th>
                  <th className="p-4 font-black uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool, idx) => (
                  <tr key={tool.id} className={idx !== tools.length - 1 ? "border-b-2 border-ink" : ""}>
                    <td className="p-4 font-black">{tool.name}</td>
                    <td className="p-4">
                      <RiskBadge risk={tool.risk} />
                    </td>
                    <td className="p-4 font-bold text-sm">{tool.grantedAt}</td>
                    <td className="p-4">
                      {tool.status === "Active" ? (
                        <span className="px-2 py-1 text-xs font-black uppercase border-2 border-ink bg-green text-ink">Active</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-black uppercase border-2 border-ink bg-muted text-white">Revoked</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {tool.status === "Active" && (
                        <BrutalButton variant="ghost" className="text-red hover:bg-red/10 border-2 border-transparent hover:border-red" onClick={() => handleRevokeClick(tool.id)}>
                          Revoke
                        </BrutalButton>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BrutalCard>
      </div>

      {/* Assign Tool Modal */}
      <BrutalModal isOpen={isAssignOpen} onClose={() => !isLoading && setIsAssignOpen(false)} title="Assign Tool to Employee">
        <form className="space-y-4" onSubmit={handleAssignSubmit}>
          <div className="space-y-2">
            <label className="font-bold text-sm uppercase">Select Tool</label>
            <select required disabled={isLoading} className="w-full h-10 px-3 border-2 border-ink font-bold focus:outline-none focus:ring-4 focus:ring-primary/30 bg-white">
              <option value="">-- Choose a tool --</option>
              <option value="trello">Trello</option>
              <option value="slack">Slack</option>
              <option value="github">GitHub</option>
            </select>
          </div>
          <div className="p-4 border-2 border-ink bg-yellow/20 mt-4">
            <p className="text-sm font-bold">Note: This will log an assignment action in the audit trail.</p>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <BrutalButton type="button" variant="ghost" onClick={() => setIsAssignOpen(false)} disabled={isLoading}>Cancel</BrutalButton>
            <BrutalButton type="submit" disabled={isLoading}>{isLoading ? "Assigning..." : "Assign Access"}</BrutalButton>
          </div>
        </form>
      </BrutalModal>

      {/* Revoke Confirmation Modal */}
      <BrutalModal isOpen={isRevokeOpen} onClose={() => !isLoading && setIsRevokeOpen(false)} title="Confirm Revocation">
        <div className="space-y-6">
          <div className="p-4 border-4 border-ink bg-red text-white flex items-start gap-4">
            <AlertTriangle className="shrink-0 mt-1" size={24} />
            <div>
              <p className="font-black text-lg leading-tight mb-2">Revoke this access?</p>
              <p className="text-sm font-bold">This immediately revokes access for the selected tool. Are you sure?</p>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <BrutalButton variant="ghost" onClick={() => setIsRevokeOpen(false)} disabled={isLoading}>Cancel</BrutalButton>
            <BrutalButton variant="danger" onClick={confirmRevoke} disabled={isLoading}>
              {isLoading ? "Revoking..." : "Yes, Revoke Access"}
            </BrutalButton>
          </div>
        </div>
      </BrutalModal>

      {/* Success Modal */}
      <BrutalModal isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} title="Action Successful">
        <div className="space-y-6 flex flex-col items-center text-center p-4">
          <CheckCircle2 size={64} className="text-green" />
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Success</h3>
            <p className="font-bold text-muted">{successMessage}</p>
          </div>
          <BrutalButton className="w-full justify-center" onClick={() => setIsSuccessOpen(false)}>
            Acknowledge
          </BrutalButton>
        </div>
      </BrutalModal>
    </div>
  )
}
