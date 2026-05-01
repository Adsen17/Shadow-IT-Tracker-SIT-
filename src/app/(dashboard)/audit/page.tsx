"use client"

import * as React from "react"
import { BrutalCard } from "@/components/ui/BrutalCard"
import { BrutalInput } from "@/components/ui/BrutalInput"
import { Search, Filter, Download } from "lucide-react"
import { TableSkeleton } from "@/components/ui/BrutalSkeleton"
import { EmptyState } from "@/components/ui/EmptyState"
import { Pagination } from "@/components/ui/Pagination"
import { exportToCSV } from "@/lib/export"
import { BrutalButton } from "@/components/ui/BrutalButton"

import { fetchAuditLogs } from "@/app/actions/audit"

const ITEMS_PER_PAGE = 5

export default function AuditTrailPage() {
  const [logs, setLogs] = React.useState<{id: string, action: string, targetTable: string, targetId: string, actor: string, changes: string, timestamp: string}[]>([])
  const [isInitializing, setIsInitializing] = React.useState(true)
  
  const [searchQuery, setSearchQuery] = React.useState("")
  const [actionFilter, setActionFilter] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)

  const loadLogs = async () => {
    try {
      const data = await fetchAuditLogs()
      setLogs(data)
    } catch (e: any) {
      console.error(e)
    } finally {
      setIsInitializing(false)
    }
  }

  React.useEffect(() => {
    loadLogs()
  }, [])

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.targetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.changes.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAction = actionFilter === "" || log.action === actionFilter
    return matchesSearch && matchesAction
  })

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE)
  const currentLogs = filteredLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleExport = () => {
    exportToCSV(filteredLogs, 'audit_trail_export')
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Audit Trail</h1>
          <p className="text-muted font-bold">Append-only security log for all sensitive mutations.</p>
        </div>
        <BrutalButton onClick={handleExport} className="print-hidden">
          <Download size={20} className="mr-2" />
          Export to CSV
        </BrutalButton>
      </div>

      <BrutalCard>
        <div className="p-4 border-b-2 border-ink flex flex-wrap items-center gap-4 bg-surface print-hidden">
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
            <BrutalInput 
              className="pl-10 w-full" 
              placeholder="Search logs (Cmd+K)" 
              type="search"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center border-2 border-ink bg-white px-2 focus-within:ring-4 focus-within:ring-ink">
              <Filter size={16} className="text-muted mr-2" />
              <select 
                className="h-10 font-bold outline-none bg-transparent cursor-pointer"
                value={actionFilter}
                onChange={e => { setActionFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">All Actions</option>
                <option value="REVOKE_ACCESS">REVOKE_ACCESS</option>
                <option value="CREATE_TOOL">CREATE_TOOL</option>
                <option value="ASSIGN_ACCESS">ASSIGN_ACCESS</option>
                <option value="DELETE_TOOL">DELETE_TOOL</option>
                <option value="INITIATE_OFFBOARDING">INITIATE_OFFBOARDING</option>
              </select>
            </div>
            <input type="date" className="h-10 px-3 border-2 border-ink font-bold focus-visible:ring-4 focus-visible:ring-ink outline-none bg-white cursor-pointer" />
          </div>
        </div>
        
        {isInitializing ? (
          <div className="p-4"><TableSkeleton /></div>
        ) : filteredLogs.length === 0 ? (
          <EmptyState 
            title="No Logs Available" 
            description="No audit logs match your search and filter criteria."
          />
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b-2 border-ink bg-surface">
                    <th className="p-4 font-black uppercase tracking-wider">Timestamp</th>
                    <th className="p-4 font-black uppercase tracking-wider">Action</th>
                    <th className="p-4 font-black uppercase tracking-wider">Actor</th>
                    <th className="p-4 font-black uppercase tracking-wider">Target</th>
                    <th className="p-4 font-black uppercase tracking-wider">Changes JSON</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-sm">
                  {currentLogs.map((log, idx) => (
                    <tr key={log.id} className={`hover:bg-ink/5 transition-colors ${idx !== currentLogs.length - 1 ? "border-b-2 border-ink" : ""}`}>
                      <td className="p-4 text-muted font-bold">{log.timestamp}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 font-black text-xs uppercase border-2 border-ink ${
                          log.action.includes("REVOKE") || log.action.includes("OFFBOARDING") || log.action.includes("DELETE") ? "bg-red text-white" : 
                          log.action.includes("CREATE") || log.action.includes("ASSIGN") ? "bg-green text-ink" : "bg-yellow text-ink"
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 font-bold">{log.actor}</td>
                      <td className="p-4">
                        <p className="font-bold">{log.targetId}</p>
                        <p className="text-xs text-muted">Table: {log.targetTable}</p>
                      </td>
                      <td className="p-4">
                        <code className="bg-surface px-2 py-1 border border-ink text-xs">{log.changes}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col divide-y-4 divide-ink">
              {currentLogs.map((log) => (
                <div key={log.id} className="p-4 bg-white flex flex-col gap-3 font-mono text-sm">
                  <div className="flex justify-between items-start">
                    <span className={`px-2 py-1 font-black text-xs uppercase border-2 border-ink ${
                      log.action.includes("REVOKE") || log.action.includes("OFFBOARDING") || log.action.includes("DELETE") ? "bg-red text-white" : 
                      log.action.includes("CREATE") || log.action.includes("ASSIGN") ? "bg-green text-ink" : "bg-yellow text-ink"
                    }`}>
                      {log.action}
                    </span>
                    <span className="text-xs text-muted font-bold">{log.timestamp}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 bg-surface p-2 border-2 border-ink">
                    <div>
                      <span className="text-xs font-bold text-muted uppercase font-sans">Actor</span>
                      <p className="font-bold">{log.actor}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-muted uppercase font-sans">Target</span>
                      <p className="font-bold">{log.targetId}</p>
                    </div>
                  </div>
                  <div className="bg-ink/5 p-2 border border-ink overflow-x-auto">
                    <code className="text-xs break-all">{log.changes}</code>
                  </div>
                </div>
              ))}
            </div>
            
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </BrutalCard>
    </div>
  )
}
