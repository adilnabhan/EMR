'use client'
import { useState } from 'react'
import { getPatientFullDetails } from '@/lib/store'
import { Search, User, Calendar, CircleDollarSign, Activity } from 'lucide-react'

export default function PatientLookup() {
  const [query, setQuery] = useState('')
  const [patientData, setPatientData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setPatientData(null)
    
    try {
      const data = await getPatientFullDetails(query.trim())
      if (!data) {
        setError('No patient found with that ID or Phone Number.')
      } else {
        setPatientData(data)
      }
    } catch (err) {
      setError('An error occurred during search.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/20 dark:bg-slate-800/80 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-md text-white">
              <Search className="w-5 h-5" />
            </div>
            Patient 360° Insights
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Unified view of a patient's bookings, treatments, and payments.</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID or Phone Number" 
            className="px-4 py-2.5 w-full md:w-72 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm dark:text-white transition-all shadow-inner"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all font-semibold text-sm disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-sm border border-rose-100 dark:border-rose-900/50 flex items-center gap-2 animate-fade-in">
          <Activity className="w-4 h-4" />
          {error}
        </div>
      )}

      {patientData && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in mt-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-[100px] -z-10 group-hover:bg-cyan-500/10 transition-colors" />
            <div className="flex items-center gap-3 mb-5 text-cyan-600 dark:text-cyan-400">
              <div className="p-2 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <h3 className="font-semibold tracking-tight">Profile Data</h3>
            </div>
            <div className="space-y-3 text-sm">
              <DetailRow label="Patient ID" value={`#${patientData.id}`} />
              <DetailRow label="Full Name" value={patientData.name} />
              <DetailRow label="Phone Number" value={patientData.phone} />
              <DetailRow label="Age" value={patientData.age || 'N/A'} />
              <DetailRow label="Blood Group" value={patientData.blood_group || 'N/A'} />
              <DetailRow label="Aadhaar" value={patientData.aadhaar || 'N/A'} />
            </div>
          </div>

          {/* Bookings & Treatments Summary */}
          <div className="col-span-1 xl:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SummaryMetric title="Lifetime Bookings" value={patientData.bookings?.length || 0} icon={Calendar} color="text-indigo-500" bg="bg-indigo-50 dark:bg-indigo-500/10" border="border-indigo-100 dark:border-indigo-500/20" />
              <SummaryMetric title="Treatments Served" value={patientData.treatments?.length || 0} icon={Activity} color="text-pink-500" bg="bg-pink-50 dark:bg-pink-500/10" border="border-pink-100 dark:border-pink-500/20" />
              <SummaryMetric 
                title="Total Paid" 
                value={`₹${(patientData.payments || []).reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()}`} 
                icon={CircleDollarSign} 
                color="text-emerald-500" 
                bg="bg-emerald-50 dark:bg-emerald-500/10" 
                border="border-emerald-100 dark:border-emerald-500/20"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bookings List */}
              <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Booking History
                </h4>
                {patientData.bookings && patientData.bookings.length > 0 ? (
                  <div className="space-y-3">
                    {patientData.bookings.map(b => (
                      <div key={b.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{b.room?.name || 'Unknown Room'}</p>
                          <p className="text-xs text-slate-500">Date: {new Date(b.created_at).toLocaleDateString()} • {b.days} Days</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${b.status === 'active' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No bookings found.</p>
                )}
              </div>

              {/* Treatments List */}
              <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-400" />
                  Treatments Prescribed
                </h4>
                {patientData.treatments && patientData.treatments.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patientData.treatments.map(t => (
                      <div key={t.id} className="w-full flex justify-between items-center p-2.5 bg-cyan-50/50 dark:bg-cyan-900/10 text-cyan-800 dark:text-cyan-300 rounded-xl text-sm border border-cyan-100 dark:border-cyan-800/30">
                        <span className="font-medium truncate">{t.name}</span>
                        <span className="text-xs font-bold opacity-80 shrink-0">₹{Number(t.cost).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No treatments found.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 -mx-2 rounded-lg transition-colors">
      <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</span>
      <span className="text-slate-900 dark:text-white font-medium">{value}</span>
    </div>
  )
}

function SummaryMetric({ title, value, icon: Icon, color, bg, border }) {
  return (
    <div className={`p-4 rounded-2xl border flex items-center gap-4 ${bg} ${border}`}>
      <div className={`p-3 rounded-xl bg-white/80 dark:bg-slate-900/50 ${color} shadow-sm border border-white/50 dark:border-slate-700`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5 opacity-80">{title}</p>
        <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
      </div>
    </div>
  )
}
