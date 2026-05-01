"use client"

import * as React from "react"
import { BrutalButton } from "@/components/ui/BrutalButton"
import { BrutalCard } from "@/components/ui/BrutalCard"
import { RiskBadge } from "@/components/ui/RiskBadge"
import { BrutalModal } from "@/components/ui/BrutalModal"
import { BrutalInput } from "@/components/ui/BrutalInput"
import { Plus, Search, CheckCircle2, AlertTriangle, Trash, Lock } from "lucide-react"
import { TableSkeleton } from "@/components/ui/BrutalSkeleton"
import { EmptyState } from "@/components/ui/EmptyState"
import { useToast } from "@/components/ui/BrutalToast"
import { useAuth } from "@/lib/auth-context"
import { FloatingActionBar } from "@/components/ui/FloatingActionBar"
import { Pagination } from "@/components/ui/Pagination"
import { fetchTools, createTool, deleteTool, bulkDeleteTools } from "@/app/actions/tools"

type RiskLevel = "Low" | "Medium" | "High";

interface Tool {
  id: string
  name: string
  category: string
  url: string
  risk: RiskLevel
  cost: string
  owner: string
}

const ITEMS_PER_PAGE = 5

export default function ToolsPage() {
  const { role } = useAuth()
  const { showToast } = useToast()
  
  const [tools, setTools] = React.useState<Tool[]>([])
  const [isInitializing, setIsInitializing] = React.useState(true)
  
  // Filtering & Pagination State
  const [searchQuery, setSearchQuery] = React.useState("")
  const [riskFilter, setRiskFilter] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  
  // Selection State
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  // Modal States
  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState("")
  const [toolToDelete, setToolToDelete] = React.useState<string | "bulk" | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  // Form State
  const [formData, setFormData] = React.useState({ name: "", category: "", url: "", risk_level: "medium", monthly_cost: "0", owner: "" })

  const loadTools = async () => {
    try {
      const data = await fetchTools()
      setTools(data)
    } catch (e: any) {
      showToast(e.message, "error")
    } finally {
      setIsInitializing(false)
    }
  }

  React.useEffect(() => {
    loadTools()
  }, [])

  // Derived state
  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRisk = riskFilter === "" || tool.risk === riskFilter
    return matchesSearch && matchesRisk
  })

  const totalPages = Math.ceil(filteredTools.length / ITEMS_PER_PAGE)
  const currentTools = filteredTools.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset pagination on search
  }

  const handleRiskFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRiskFilter(e.target.value)
    setCurrentPage(1) // Reset pagination on filter
  }

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedIds(newSelection)
  }

  const toggleAllSelection = () => {
    if (selectedIds.size === currentTools.length && currentTools.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(currentTools.map(t => t.id)))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    const form = new FormData()
    form.append("name", formData.name)
    form.append("category", formData.category)
    form.append("url", formData.url)
    form.append("risk_level", formData.risk_level)
    form.append("monthly_cost", formData.monthly_cost)
    form.append("owner", formData.owner)

    const result = await createTool(form)
    setIsLoading(false)
    
    if (result.error) {
      showToast(result.error, "error")
    } else {
      setSuccessMessage("Tool has been successfully registered and logged in the audit trail.")
      setIsRegisterOpen(false)
      setIsSuccessOpen(true)
      showToast("Tool registered successfully", "success")
      setFormData({ name: "", category: "", url: "", risk_level: "medium", monthly_cost: "0", owner: "" })
      loadTools()
    }
  }

  const handleDeleteClick = (id: string | "bulk") => {
    if (role === "admin") {
      showToast("Admins do not have permission to delete tools.", "error")
      return
    }
    setToolToDelete(id)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    setIsLoading(true)
    
    if (toolToDelete === "bulk") {
      const result = await bulkDeleteTools(Array.from(selectedIds))
      setIsLoading(false)
      if (result.error) {
        showToast(result.error, "error")
      } else {
        setSelectedIds(new Set())
        setSuccessMessage(`${selectedIds.size} tools have been securely deleted.`)
        setIsDeleteOpen(false)
        setIsSuccessOpen(true)
        showToast("Bulk deletion successful.", "info")
        loadTools()
      }
    } else if (toolToDelete) {
      const result = await deleteTool(toolToDelete)
      setIsLoading(false)
      if (result.error) {
        showToast(result.error, "error")
      } else {
        setSuccessMessage("Tool successfully removed from the catalog.")
        setIsDeleteOpen(false)
        setIsSuccessOpen(true)
        showToast("Tool deleted.", "info")
        loadTools()
      }
    }

    if (currentTools.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const isManager = role === "manager"

  return (
    <div className="space-y-8 pb-24"> {/* pb-24 to avoid floating bar overlap */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Tool Registry</h1>
          <p className="text-muted font-bold">Manage and monitor all third-party SaaS applications.</p>
        </div>
        <BrutalButton onClick={() => setIsRegisterOpen(true)}>
          <Plus size={20} />
          Register Tool
        </BrutalButton>
      </div>

      <BrutalCard>
        <div className="p-4 border-b-2 border-ink flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-surface print-hidden">
          <div className="relative w-full sm:flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
            <BrutalInput 
              type="search"
              className="pl-10 w-full" 
              placeholder="Search by name, category, or owner (Cmd+K)" 
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              className="h-10 px-3 border-2 border-ink font-bold focus-visible:ring-4 focus-visible:ring-ink outline-none bg-white w-full sm:w-auto cursor-pointer"
              value={riskFilter}
              onChange={handleRiskFilterChange}
            >
              <option value="">All Risks</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>
        </div>
        
        {isInitializing ? (
          <div className="p-4"><TableSkeleton /></div>
        ) : filteredTools.length === 0 ? (
          <EmptyState 
            title="Registry Empty" 
            description={tools.length === 0 ? "No SaaS applications are currently tracked. Register your first tool to begin monitoring." : "No tools match your current search and filter criteria."}
            action={tools.length === 0 ? <BrutalButton onClick={() => setIsRegisterOpen(true)}>Register First Tool</BrutalButton> : undefined}
          />
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-ink bg-surface">
                    <th className="p-4 w-12 print-hidden">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 border-2 border-ink cursor-pointer focus-visible:ring-4 focus-visible:ring-ink"
                        checked={currentTools.length > 0 && selectedIds.size === currentTools.length}
                        onChange={toggleAllSelection}
                      />
                    </th>
                    <th className="p-4 font-black uppercase tracking-wider">Name</th>
                    <th className="p-4 font-black uppercase tracking-wider">Category</th>
                    <th className="p-4 font-black uppercase tracking-wider">Risk Level</th>
                    <th className="p-4 font-black uppercase tracking-wider">Cost</th>
                    <th className="p-4 font-black uppercase tracking-wider">Owner</th>
                    <th className="p-4 font-black uppercase tracking-wider text-right print-hidden">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTools.map((tool, idx) => {
                    const isSelected = selectedIds.has(tool.id)
                    return (
                      <tr key={tool.id} className={`${idx !== currentTools.length - 1 ? "border-b-2 border-ink" : ""} ${isSelected ? "bg-yellow/20" : "hover:bg-ink/5"} transition-colors`}>
                        <td className="p-4 print-hidden">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 border-2 border-ink cursor-pointer focus-visible:ring-4 focus-visible:ring-ink"
                            checked={isSelected}
                            onChange={() => toggleSelection(tool.id)}
                          />
                        </td>
                        <td className="p-4">
                          <p className="font-black text-lg">{tool.name}</p>
                          <a href={`https://${tool.url}`} className="text-xs text-muted font-bold hover:underline" target="_blank" rel="noreferrer">
                            {tool.url}
                          </a>
                        </td>
                        <td className="p-4 font-bold">{tool.category}</td>
                        <td className="p-4">
                          <RiskBadge risk={tool.risk} />
                        </td>
                        <td className="p-4 font-bold">{tool.cost}</td>
                        <td className="p-4 font-bold">{tool.owner}</td>
                        <td className="p-4 text-right space-x-2 print-hidden">
                          <BrutalButton variant="secondary" size="sm">Edit</BrutalButton>
                          <BrutalButton 
                            variant="ghost" 
                            size="icon" 
                            className={`border-2 border-transparent ${role === "admin" ? "opacity-50 cursor-not-allowed text-muted hover:border-transparent hover:bg-transparent" : "text-red hover:bg-red/10 hover:border-red"}`}
                            onClick={() => handleDeleteClick(tool.id)}
                            disabled={role === "admin"}
                            title={role === "admin" ? "Admins cannot delete tools" : "Delete Tool"}
                          >
                            {role === "admin" ? <Lock size={16} /> : <Trash size={16} />}
                          </BrutalButton>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col divide-y-4 divide-ink">
              {currentTools.map((tool) => {
                const isSelected = selectedIds.has(tool.id)
                return (
                  <div key={tool.id} className={`p-4 ${isSelected ? "bg-yellow/20" : "bg-white"} flex flex-col gap-4 relative transition-colors`}>
                    <div className="absolute top-4 right-4 z-10 print-hidden">
                      <input 
                        type="checkbox" 
                        className="w-6 h-6 border-2 border-ink cursor-pointer focus-visible:ring-4 focus-visible:ring-ink"
                        checked={isSelected}
                        onChange={() => toggleSelection(tool.id)}
                      />
                    </div>
                    <div className="flex justify-between items-start pr-10">
                      <div>
                        <p className="font-black text-xl leading-none">{tool.name}</p>
                        <a href={`https://${tool.url}`} className="text-sm text-primary hover:underline font-bold" target="_blank" rel="noreferrer">
                          {tool.url}
                        </a>
                      </div>
                      <RiskBadge risk={tool.risk} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm bg-surface p-2 border-2 border-ink">
                      <div>
                        <p className="text-muted font-bold uppercase text-xs">Category</p>
                        <p className="font-black">{tool.category}</p>
                      </div>
                      <div>
                        <p className="text-muted font-bold uppercase text-xs">Cost</p>
                        <p className="font-black">{tool.cost}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted font-bold uppercase text-xs">Owner</p>
                        <p className="font-black">{tool.owner}</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 print-hidden">
                      <BrutalButton variant="secondary" size="sm">Edit</BrutalButton>
                      <BrutalButton 
                        variant="ghost" 
                        size="sm" 
                        className={`border-2 border-transparent ${role === "admin" ? "opacity-50 cursor-not-allowed text-muted" : "text-red hover:bg-red/10 hover:border-red"}`}
                        onClick={() => handleDeleteClick(tool.id)}
                        disabled={role === "admin"}
                      >
                        {role === "admin" ? <Lock size={16} className="mr-1 inline" /> : null}
                        Delete
                      </BrutalButton>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
        )}
      </BrutalCard>

      {/* Floating Action Bar for Bulk Actions */}
      <FloatingActionBar 
        isVisible={selectedIds.size > 0} 
        selectedCount={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
      >
        <BrutalButton 
          variant="danger" 
          onClick={() => handleDeleteClick("bulk")}
          disabled={role === "admin"}
          title={role === "admin" ? "Admins cannot delete" : "Delete Selected"}
        >
          {role === "admin" ? <Lock size={16} className="mr-2" /> : <Trash size={16} className="mr-2" />}
          Delete Selected
        </BrutalButton>
      </FloatingActionBar>

      {/* Register Modal */}
      <BrutalModal isOpen={isRegisterOpen} onClose={() => !isLoading && setIsRegisterOpen(false)} title="Register New Tool">
        <form className="space-y-4" onSubmit={handleSave}>
          <div className="space-y-2">
            <label className="font-bold text-sm uppercase">Tool Name *</label>
            <select 
              required 
              disabled={isLoading}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full h-10 px-3 border-2 border-ink font-bold focus-visible:ring-4 focus-visible:ring-ink outline-none bg-white"
            >
              <option value="" disabled>Select a tool</option>
              <option value="Figma">Figma</option>
              <option value="AWS">AWS</option>
              <option value="Notion">Notion</option>
              <option value="Datadog">Datadog</option>
              <option value="Slack">Slack</option>
              <option value="Canva">Canva</option>
              <option value="JIRA">JIRA</option>
              <option value="GitHub">GitHub</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="font-bold text-sm uppercase">Category *</label>
            <select 
              required 
              disabled={isLoading}
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full h-10 px-3 border-2 border-ink font-bold focus-visible:ring-4 focus-visible:ring-ink outline-none bg-white"
            >
              <option value="" disabled>Select a category</option>
              <option value="Design">Design</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Productivity">Productivity</option>
              <option value="Monitoring">Monitoring</option>
              <option value="Communication">Communication</option>
              <option value="Project Management">Project Management</option>
              <option value="Development">Development</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="font-bold text-sm uppercase">URL</label>
            <BrutalInput type="url" placeholder="https://" disabled={isLoading} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-bold text-sm uppercase">Risk Level *</label>
              <select 
                required 
                disabled={isLoading} 
                value={formData.risk_level}
                onChange={(e) => setFormData({...formData, risk_level: e.target.value})}
                className="w-full h-10 px-3 border-2 border-ink font-bold focus-visible:ring-4 focus-visible:ring-ink outline-none bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-bold text-sm uppercase">Monthly Cost</label>
              <BrutalInput 
                type="number" 
                min="0" 
                placeholder="0" 
                disabled={isLoading} 
                value={formData.monthly_cost}
                onChange={(e) => setFormData({...formData, monthly_cost: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-bold text-sm uppercase">Owner</label>
            <BrutalInput 
              placeholder="Department or Person" 
              disabled={isLoading} 
              value={formData.owner}
              onChange={(e) => setFormData({...formData, owner: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="font-bold text-sm uppercase">URL</label>
            <BrutalInput 
              type="url" 
              placeholder="https://" 
              disabled={isLoading} 
              value={formData.url}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-2">
            <BrutalButton type="button" variant="ghost" onClick={() => setIsRegisterOpen(false)} disabled={isLoading}>Cancel</BrutalButton>
            <BrutalButton type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save Tool"}</BrutalButton>
          </div>
        </form>
      </BrutalModal>

      {/* Delete Confirmation Modal */}
      <BrutalModal isOpen={isDeleteOpen} onClose={() => !isLoading && setIsDeleteOpen(false)} title={toolToDelete === "bulk" ? "Confirm Bulk Deletion" : "Confirm Deletion"}>
        <div className="space-y-6">
          <div className="p-4 border-4 border-ink bg-red text-white flex items-start gap-4">
            <AlertTriangle className="shrink-0 mt-1" size={24} />
            <div>
              <p className="font-black text-lg leading-tight mb-2">
                {toolToDelete === "bulk" ? `Delete ${selectedIds.size} tools?` : "Delete this tool?"}
              </p>
              <p className="text-sm font-bold">This action cannot be undone and will be permanently recorded in the audit trail.</p>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <BrutalButton variant="ghost" onClick={() => setIsDeleteOpen(false)} disabled={isLoading}>Cancel</BrutalButton>
            <BrutalButton variant="danger" onClick={confirmDelete} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Yes, Delete"}
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
