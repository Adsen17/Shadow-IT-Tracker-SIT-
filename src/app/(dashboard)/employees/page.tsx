"use client"

import * as React from "react"
import Link from "next/link"
import { BrutalCard } from "@/components/ui/BrutalCard"
import { BrutalButton } from "@/components/ui/BrutalButton"
import { BrutalInput } from "@/components/ui/BrutalInput"
import { BrutalModal } from "@/components/ui/BrutalModal"
import { Search, Plus, Wrench, AlertTriangle, CheckCircle2, Trash, Edit, Lock } from "lucide-react"
import { TableSkeleton } from "@/components/ui/BrutalSkeleton"
import { EmptyState } from "@/components/ui/EmptyState"
import { useToast } from "@/components/ui/BrutalToast"
import { useAuth } from "@/lib/auth-context"
import { FloatingActionBar } from "@/components/ui/FloatingActionBar"
import { Pagination } from "@/components/ui/Pagination"
import { fetchEmployees, createEmployee, deleteEmployee, bulkDeleteEmployees } from "@/app/actions/employees"

interface Employee {
  id: string
  name: string
  email: string
  department: string
  status: "Active" | "Offboarding" | "Terminated"
  toolsCount: number
}

const ITEMS_PER_PAGE = 5

export default function EmployeesPage() {
  const { role } = useAuth()
  const { showToast } = useToast()
  
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [isInitializing, setIsInitializing] = React.useState(true)
  
  // Filtering & Pagination State
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  
  // Selection State
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  // Modal states
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = React.useState(false)
  
  const [successMessage, setSuccessMessage] = React.useState("")
  const [editingEmployee, setEditingEmployee] = React.useState<Employee | null>(null)
  const [employeeToDelete, setEmployeeToDelete] = React.useState<string | "bulk" | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  // Form State
  const [formData, setFormData] = React.useState({ name: "", email: "", department: "" })

  const loadEmployees = async () => {
    try {
      const data = await fetchEmployees()
      setEmployees(data as any)
    } catch (e: any) {
      showToast(e.message, "error")
    } finally {
      setIsInitializing(false)
    }
  }

  React.useEffect(() => {
    loadEmployees()
  }, [])

  // Derived state
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.department.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "" || emp.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE)
  const currentEmployees = filteredEmployees.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value)
    setCurrentPage(1)
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
    if (selectedIds.size === currentEmployees.length && currentEmployees.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(currentEmployees.map(e => String(e.id))))
    }
  }

  const handleOpenAdd = () => {
    setEditingEmployee(null)
    setFormData({ name: "", email: "", department: "" })
    setIsFormOpen(true)
  }

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp)
    setFormData({ name: emp.name, email: emp.email, department: emp.department })
    setIsFormOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    if (editingEmployee) {
      setTimeout(() => {
        setEmployees(employees.map(emp => emp.id === editingEmployee.id ? { ...emp, ...formData } : emp))
        setSuccessMessage("Employee details updated successfully.")
        setIsLoading(false)
        setIsFormOpen(false)
        setIsSuccessOpen(true)
        showToast("Employee details updated.", "success")
      }, 800)
    } else {
      const form = new FormData()
      form.append("name", formData.name)
      form.append("email", formData.email)
      form.append("department", formData.department)

      const result = await createEmployee(form)
      setIsLoading(false)
      
      if (result.error) {
        showToast(result.error, "error")
      } else {
        setSuccessMessage("New employee successfully registered.")
        setIsFormOpen(false)
        setIsSuccessOpen(true)
        showToast("New employee registered.", "success")
        loadEmployees()
      }
    }
  }

  const handleDeleteClick = (id: string | "bulk") => {
    if (role === "admin") {
      showToast("Admins do not have permission to delete employees.", "error")
      return
    }
    setEmployeeToDelete(id)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    setIsLoading(true)
    
    if (employeeToDelete === "bulk") {
      const result = await bulkDeleteEmployees(Array.from(selectedIds))
      setIsLoading(false)
      if (result.error) {
        showToast(result.error, "error")
      } else {
        setSelectedIds(new Set())
        setSuccessMessage(`${selectedIds.size} employees have been securely removed.`)
        setIsDeleteOpen(false)
        setIsSuccessOpen(true)
        showToast("Bulk deletion successful.", "info")
        loadEmployees()
      }
    } else if (employeeToDelete) {
      const result = await deleteEmployee(employeeToDelete)
      setIsLoading(false)
      if (result.error) {
        showToast(result.error, "error")
      } else {
        setSuccessMessage("Employee successfully removed from the registry.")
        setIsDeleteOpen(false)
        setIsSuccessOpen(true)
        showToast("Employee deleted.", "info")
        loadEmployees()
      }
    }

    if (currentEmployees.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const isAdmin = role === "admin"

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Employee Registry</h1>
          <p className="text-muted font-bold">Manage employee profiles and track their assigned SaaS tools.</p>
        </div>
        <BrutalButton onClick={handleOpenAdd}>
          <Plus size={20} />
          Add Employee
        </BrutalButton>
      </div>

      <BrutalCard>
        <div className="p-4 border-b-2 border-ink flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-surface print-hidden">
          <div className="relative w-full sm:flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
            <BrutalInput 
              type="search"
              className="pl-10 w-full" 
              placeholder="Search by name, email, or dept (Cmd+K)" 
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              className="h-10 px-3 border-2 border-ink font-bold focus-visible:ring-4 focus-visible:ring-ink outline-none bg-white w-full sm:w-auto cursor-pointer"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Offboarding">Offboarding</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
        </div>
        
        {isInitializing ? (
          <div className="p-4"><TableSkeleton /></div>
        ) : filteredEmployees.length === 0 ? (
          <EmptyState 
            title="No Employees Found" 
            description={employees.length === 0 ? "There are currently no employees in the registry. Add a new employee to start tracking their access." : "No employees match your search criteria."}
            action={employees.length === 0 ? <BrutalButton onClick={handleOpenAdd}>Add First Employee</BrutalButton> : undefined}
          />
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-ink bg-surface">
                    <th className="p-4 w-12 print-hidden">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 border-2 border-ink cursor-pointer focus-visible:ring-4 focus-visible:ring-ink"
                        checked={currentEmployees.length > 0 && selectedIds.size === currentEmployees.length}
                        onChange={toggleAllSelection}
                      />
                    </th>
                    <th className="p-4 font-black uppercase tracking-wider">Employee</th>
                    <th className="p-4 font-black uppercase tracking-wider">Department</th>
                    <th className="p-4 font-black uppercase tracking-wider">Status</th>
                    <th className="p-4 font-black uppercase tracking-wider">Active Tools</th>
                    <th className="p-4 font-black uppercase tracking-wider text-right print-hidden">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmployees.map((emp, idx) => {
                    const isSelected = selectedIds.has(emp.id)
                    return (
                      <tr key={emp.id} className={`${idx !== currentEmployees.length - 1 ? "border-b-2 border-ink" : ""} ${isSelected ? "bg-yellow/20" : "hover:bg-ink/5"} transition-colors`}>
                        <td className="p-4 print-hidden">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 border-2 border-ink cursor-pointer focus-visible:ring-4 focus-visible:ring-ink"
                            checked={isSelected}
                            onChange={() => toggleSelection(emp.id)}
                          />
                        </td>
                        <td className="p-4">
                          <p className="font-black text-lg">{emp.name}</p>
                          <p className="text-xs text-muted font-bold">{emp.email}</p>
                        </td>
                        <td className="p-4 font-bold">{emp.department}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-black uppercase border-2 border-ink ${
                            emp.status === "Active" ? "bg-green text-ink" : 
                            emp.status === "Offboarding" ? "bg-yellow text-ink" : "bg-red text-white"
                          }`}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 font-black">
                            <Wrench size={16} className="text-muted" />
                            {emp.toolsCount}
                          </div>
                        </td>
                        <td className="p-4 text-right space-x-2 print-hidden">
                          <BrutalButton variant="secondary" size="sm" onClick={() => handleOpenEdit(emp)}>
                            <Edit size={16} className="md:mr-2" />
                            <span className="hidden md:inline">Edit</span>
                          </BrutalButton>
                          <BrutalButton 
                            variant="ghost" 
                            size="icon" 
                            className={`border-2 border-transparent ${isAdmin ? "opacity-50 cursor-not-allowed text-muted" : "text-red hover:bg-red/10 hover:border-red"}`}
                            onClick={() => handleDeleteClick(emp.id)}
                            disabled={isAdmin}
                            title={isAdmin ? "Admins cannot delete" : "Delete Employee"}
                          >
                            {isAdmin ? <Lock size={16} /> : <Trash size={16} />}
                          </BrutalButton>
                          <Link href={`/employees/${emp.id}`}>
                            <BrutalButton size="sm">Manage Access</BrutalButton>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col divide-y-4 divide-ink">
              {currentEmployees.map((emp) => {
                const isSelected = selectedIds.has(emp.id)
                return (
                  <div key={emp.id} className={`p-4 ${isSelected ? "bg-yellow/20" : "bg-white"} flex flex-col gap-4 relative transition-colors`}>
                    <div className="absolute top-4 right-4 z-10 print-hidden">
                      <input 
                        type="checkbox" 
                        className="w-6 h-6 border-2 border-ink cursor-pointer focus-visible:ring-4 focus-visible:ring-ink"
                        checked={isSelected}
                        onChange={() => toggleSelection(emp.id)}
                      />
                    </div>
                    <div className="flex justify-between items-start pr-10">
                      <div>
                        <p className="font-black text-xl leading-none">{emp.name}</p>
                        <p className="text-sm font-bold text-muted">{emp.email}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-black uppercase border-2 border-ink ${
                        emp.status === "Active" ? "bg-green text-ink" : 
                        emp.status === "Offboarding" ? "bg-yellow text-ink" : "bg-red text-white"
                      }`}>
                        {emp.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-surface p-2 border-2 border-ink">
                      <span className="font-bold text-sm uppercase">Department: {emp.department}</span>
                      <div className="flex items-center gap-2 font-black text-sm">
                        <Wrench size={14} /> {emp.toolsCount} Tools
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end print-hidden flex-wrap">
                      <BrutalButton variant="secondary" size="sm" onClick={() => handleOpenEdit(emp)}>Edit</BrutalButton>
                      <BrutalButton 
                        variant="ghost" 
                        size="sm" 
                        className={`border-2 border-transparent ${isAdmin ? "opacity-50 cursor-not-allowed text-muted" : "text-red hover:bg-red/10 hover:border-red"}`}
                        onClick={() => handleDeleteClick(emp.id)}
                        disabled={isAdmin}
                      >
                        {isAdmin ? <Lock size={16} className="mr-1 inline" /> : null}
                        Delete
                      </BrutalButton>
                      <Link href={`/employees/${emp.id}`} className="w-full sm:w-auto">
                        <BrutalButton size="sm" className="w-full justify-center">Manage Access</BrutalButton>
                      </Link>
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

      {/* Floating Action Bar */}
      <FloatingActionBar 
        isVisible={selectedIds.size > 0} 
        selectedCount={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
      >
        <BrutalButton 
          variant="danger" 
          onClick={() => handleDeleteClick("bulk")}
          disabled={isAdmin}
          title={isAdmin ? "Admins cannot delete" : "Delete Selected"}
        >
          {isAdmin ? <Lock size={16} className="mr-2" /> : <Trash size={16} className="mr-2" />}
          Delete Selected
        </BrutalButton>
      </FloatingActionBar>

      {/* Form Modal */}
      <BrutalModal isOpen={isFormOpen} onClose={() => !isLoading && setIsFormOpen(false)} title={editingEmployee ? "Edit Employee" : "Add New Employee"}>
        <form className="space-y-4" onSubmit={handleSave}>
          <div className="space-y-2">
            <label className="font-bold text-sm uppercase">Full Name *</label>
            <select 
              required 
              disabled={isLoading}
              value={formData.name}
              onChange={e => {
                const name = e.target.value;
                const email = name.toLowerCase().replace(/\s+/g, ".") + "@company.com";
                setFormData({...formData, name, email});
              }}
              className="w-full h-10 px-3 border-2 border-ink font-bold focus-visible:ring-4 focus-visible:ring-ink outline-none bg-white"
            >
              <option value="" disabled>Select Employee</option>
              <option value="Budi Santoso">Budi Santoso</option>
              <option value="Siti Aminah">Siti Aminah</option>
              <option value="Andi Pratama">Andi Pratama</option>
              <option value="Rina Melati">Rina Melati</option>
              <option value="John Doe">John Doe</option>
              <option value="Jane Smith">Jane Smith</option>
              <option value="Alex Johnson">Alex Johnson</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="font-bold text-sm uppercase">Email Address *</label>
            <BrutalInput 
              type="email"
              required 
              placeholder="e.g., jane@company.com" 
              disabled={isLoading || true} // Make it readonly
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="bg-ink/5"
            />
          </div>
          <div className="space-y-2">
            <label className="font-bold text-sm uppercase">Department *</label>
            <select 
              required 
              disabled={isLoading} 
              className="w-full h-10 px-3 border-2 border-ink font-bold focus-visible:ring-4 focus-visible:ring-ink outline-none bg-white"
              value={formData.department}
              onChange={e => setFormData({...formData, department: e.target.value})}
            >
              <option value="">-- Select Department --</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
              <option value="Sales">Sales</option>
            </select>
          </div>
          
          <div className="pt-4 flex justify-end gap-2">
            <BrutalButton type="button" variant="ghost" onClick={() => setIsFormOpen(false)} disabled={isLoading}>Cancel</BrutalButton>
            <BrutalButton type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save Employee"}</BrutalButton>
          </div>
        </form>
      </BrutalModal>

      {/* Delete Modal */}
      <BrutalModal isOpen={isDeleteOpen} onClose={() => !isLoading && setIsDeleteOpen(false)} title={employeeToDelete === "bulk" ? "Confirm Bulk Deletion" : "Confirm Deletion"}>
        <div className="space-y-6">
          <div className="p-4 border-4 border-ink bg-red text-white flex items-start gap-4">
            <AlertTriangle className="shrink-0 mt-1" size={24} />
            <div>
              <p className="font-black text-lg leading-tight mb-2">
                {employeeToDelete === "bulk" ? `Delete ${selectedIds.size} employees?` : "Delete this employee?"}
              </p>
              <p className="text-sm font-bold">This will permanently remove the record and detach all tool assignments.</p>
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
