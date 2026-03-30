'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import {
  LayoutDashboard, Users, BedDouble, CalendarCheck, Stethoscope,
  CreditCard, LogOut as LogOutIcon, UserPlus, Building2, X, Activity
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patients', label: 'Patients', icon: Users },
  { href: '/rooms', label: 'Rooms', icon: BedDouble },
  { href: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/treatments', label: 'Treatments', icon: Stethoscope },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/discharge', label: 'Discharge', icon: Activity },
  { href: '/leads', label: 'Leads', icon: UserPlus },
  { href: '/employees', label: 'Employees', icon: Building2, adminOnly: true },
]

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname()
  const { isAdmin, logout, user } = useAuth()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-[260px] bg-gradient-to-b from-[#0f172a] to-[#1e293b]
        border-r border-white/5 flex flex-col transition-transform duration-300
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base tracking-tight">MedCore</h1>
              <p className="text-[10px] text-cyan-400/80 uppercase tracking-widest">Hospital ERP</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems
            .filter(item => !item.adminOnly || isAdmin)
            .map(item => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-200 group
                    ${isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 shadow-lg shadow-cyan-500/5'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {item.label}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                </Link>
              )
            })}
        </nav>

        {/* User */}
        {user && (
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {user.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{user.name}</p>
                <p className="text-[10px] text-cyan-400/70 uppercase tracking-wider">{isAdmin ? 'Admin' : 'Staff'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <LogOutIcon className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
