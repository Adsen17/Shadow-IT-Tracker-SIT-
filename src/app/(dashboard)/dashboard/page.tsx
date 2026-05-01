import { BrutalCard, BrutalCardContent, BrutalCardHeader, BrutalCardTitle } from "@/components/ui/BrutalCard"
import { RiskBadge } from "@/components/ui/RiskBadge"
import { ShieldAlert, CreditCard, LayoutGrid } from "lucide-react"

export default function DashboardPage() {
  // Mock Data
  const metrics = [
    { title: "Total Tools", value: "42", icon: LayoutGrid, color: "bg-cyan" },
    { title: "Monthly Cost", value: "$4,250", icon: CreditCard, color: "bg-green" },
    { title: "High Risk Tools", value: "8", icon: ShieldAlert, color: "bg-red" },
  ]

  const recentAuditLogs = [
    { id: 1, action: "REVOKE", target: "Figma", actor: "Admin IT", time: "10 mins ago" },
    { id: 2, action: "ASSIGN", target: "AWS", actor: "Admin IT", time: "2 hours ago" },
    { id: 3, action: "CREATE", target: "Notion", actor: "HR Manager", time: "1 day ago" },
    { id: 4, action: "OFFBOARDING_START", target: "Budi", actor: "HR Manager", time: "1 day ago" },
  ]

  const riskDistribution = [
    { level: "Low", count: 20 },
    { level: "Medium", count: 14 },
    { level: "High", count: 8 },
  ] as const

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Dashboard</h1>
        <p className="text-muted font-bold">Overview of Shadow IT usage and risks.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <BrutalCard key={metric.title}>
            <BrutalCardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-muted uppercase tracking-wider mb-2">{metric.title}</p>
                <p className="text-5xl font-black">{metric.value}</p>
              </div>
              <div className={`w-16 h-16 border-2 border-ink ${metric.color} flex items-center justify-center shadow-[4px_4px_0_#111]`}>
                <metric.icon size={32} className={metric.color === "bg-red" ? "text-white" : "text-ink"} />
              </div>
            </BrutalCardContent>
          </BrutalCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution */}
        <BrutalCard className="lg:col-span-1">
          <BrutalCardHeader>
            <BrutalCardTitle>Risk Distribution</BrutalCardTitle>
          </BrutalCardHeader>
          <BrutalCardContent>
            <div className="space-y-4">
              {riskDistribution.map((risk) => (
                <div key={risk.level} className="flex items-center justify-between">
                  <RiskBadge risk={risk.level} />
                  <span className="font-black text-xl">{risk.count}</span>
                </div>
              ))}
            </div>
          </BrutalCardContent>
        </BrutalCard>

        {/* Recent Activity */}
        <BrutalCard className="lg:col-span-2">
          <BrutalCardHeader>
            <BrutalCardTitle>Recent Audit Logs</BrutalCardTitle>
          </BrutalCardHeader>
          <BrutalCardContent>
            <div className="space-y-4">
              {recentAuditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between border-2 border-ink p-4 bg-surface">
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 text-xs font-black uppercase border-2 border-ink ${
                      log.action === "REVOKE" ? "bg-red text-white" : "bg-yellow text-ink"
                    }`}>
                      {log.action}
                    </span>
                    <span className="font-bold">{log.target}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{log.actor}</p>
                    <p className="text-xs text-muted font-bold">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </BrutalCardContent>
        </BrutalCard>
      </div>
    </div>
  )
}
