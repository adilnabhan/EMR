'use client'

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto animate-in`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function StatsCard({ title, value, icon: Icon, color = 'cyan', trend }) {
  const colors = {
    cyan: 'from-cyan-500 to-blue-600',
    green: 'from-emerald-500 to-teal-600',
    orange: 'from-orange-500 to-amber-600',
    purple: 'from-purple-500 to-indigo-600',
    red: 'from-rose-500 to-red-600',
    pink: 'from-pink-500 to-rose-600',
  }
  const bgColors = {
    cyan: 'bg-cyan-50 dark:bg-cyan-500/10',
    green: 'bg-emerald-50 dark:bg-emerald-500/10',
    orange: 'bg-orange-50 dark:bg-orange-500/10',
    purple: 'bg-purple-50 dark:bg-purple-500/10',
    red: 'bg-rose-50 dark:bg-rose-500/10',
    pink: 'bg-pink-50 dark:bg-pink-500/10',
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
          {trend && <p className={`text-xs mt-1 ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl ${bgColors[color]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          {Icon && <Icon className={`w-5 h-5 bg-gradient-to-r ${colors[color]} bg-clip-text text-transparent`} style={{ color: color === 'cyan' ? '#06b6d4' : color === 'green' ? '#10b981' : color === 'orange' ? '#f97316' : color === 'purple' ? '#8b5cf6' : color === 'red' ? '#ef4444' : '#ec4899' }} />}
        </div>
      </div>
    </div>
  )
}

export function StatusBadge({ status }) {
  const styles = {
    active: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
    discharged: 'bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-400',
    available: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
    occupied: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400',
    new: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
    'follow-up': 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
    converted: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
    admin: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400',
    staff: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
    advance: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400',
    final: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
  }

  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  )
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-700 border-t-cyan-500 rounded-full animate-spin" />
    </div>
  )
}

export function PageWrapper({ children }) {
  return (
    <div className="p-4 lg:p-6 space-y-6 animate-in">
      {children}
    </div>
  )
}
