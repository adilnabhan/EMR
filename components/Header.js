'use client'
import { Menu, Bell, Search } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function Header({ onMenuClick, title }) {
  const { user, isAdmin } = useAuth()

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700/50">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title || 'Dashboard'}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Welcome back, {user?.name || 'Admin'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none w-40 placeholder:text-slate-400"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Role badge */}
          <span className={`
            hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-semibold
            ${isAdmin
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-600 dark:text-cyan-400'
              : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
            }
          `}>
            {isAdmin ? 'Admin' : 'Staff'}
          </span>
        </div>
      </div>
    </header>
  )
}
