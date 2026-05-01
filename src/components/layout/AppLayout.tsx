"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Wrench, Users, ShieldAlert, Menu, X, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { BrutalModal } from "@/components/ui/BrutalModal"
import { BrutalButton } from "@/components/ui/BrutalButton"
import { useAuth } from "@/lib/auth-context"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tools Registry", href: "/tools", icon: Wrench },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Audit Trail", href: "/audit", icon: ShieldAlert },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false)
  const { logoutUser, role } = useAuth()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b-4 border-ink bg-primary px-4 flex items-center justify-between z-50">
        <span className="text-xl font-black text-white tracking-tight">SIT Tracker</span>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 border-2 border-ink bg-white active:translate-y-1 active:translate-x-1 shadow-[2px_2px_0_#111] active:shadow-none"
        >
          {mobileMenuOpen ? <X size={20} className="text-ink" /> : <Menu size={20} className="text-ink" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-16 left-0 right-0 border-b-4 border-ink bg-white z-40 p-4 shadow-brutal-lg">
          <nav className="flex flex-col space-y-2">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 font-bold border-2 transition-transform",
                    isActive 
                      ? "bg-primary text-white border-ink shadow-[2px_2px_0_#111] translate-x-[-2px] translate-y-[-2px]" 
                      : "bg-surface text-ink border-transparent hover:border-ink hover:shadow-[2px_2px_0_#111] hover:-translate-x-0.5 hover:-translate-y-0.5"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex items-center gap-3 px-4 py-3 font-bold border-2 bg-surface text-ink border-transparent hover:border-ink hover:bg-red/10 hover:text-red transition-transform w-full text-left focus-visible:ring-4 focus-visible:ring-ink"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 fixed top-0 bottom-0 left-0 border-r-4 border-ink bg-surface shadow-[4px_0_0_#111] z-10">
        <div className="h-20 flex items-center px-6 border-b-4 border-ink bg-primary">
          <span className="text-2xl font-black text-white tracking-tighter">Shadow IT<br/>Tracker</span>
        </div>
        <nav className="flex-1 p-6 space-y-4">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 font-bold border-2 transition-transform",
                  isActive 
                    ? "bg-yellow text-ink border-ink shadow-[4px_4px_0_#111] translate-x-[-4px] translate-y-[-4px]" 
                    : "bg-white text-ink border-ink hover:bg-yellow/50 hover:shadow-[4px_4px_0_#111] hover:-translate-x-1 hover:-translate-y-1"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-6 border-t-4 border-ink bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-ink bg-cyan flex items-center justify-center font-black">
              AD
            </div>
            <div>
              <p className="font-bold text-sm uppercase">{role || 'User'}</p>
              <p className="text-xs font-bold text-muted uppercase">Global Access</p>
            </div>
            <button onClick={() => setIsLogoutModalOpen(true)} className="ml-auto p-2 text-muted hover:text-red hover:bg-red/10 border-2 border-transparent hover:border-red transition-colors focus-visible:ring-4 focus-visible:ring-ink outline-none" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
      {/* Logout Confirmation Modal */}
      <BrutalModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} title="Confirm Logout">
        <div className="space-y-6 text-center flex flex-col items-center p-4">
          <LogOut size={64} className="text-red" />
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Leaving so soon?</h3>
            <p className="font-bold text-muted">Are you sure you want to end your secure session?</p>
          </div>
          <div className="flex gap-4 w-full">
            <BrutalButton variant="secondary" className="flex-1 justify-center" onClick={() => setIsLogoutModalOpen(false)}>
              Cancel
            </BrutalButton>
            <BrutalButton variant="danger" className="flex-1 justify-center" onClick={() => { setIsLogoutModalOpen(false); logoutUser(); }}>
              Yes, Logout
            </BrutalButton>
          </div>
        </div>
      </BrutalModal>
    </div>
  )
}
