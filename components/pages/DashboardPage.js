'use client'
import { useState, useEffect } from 'react'
import { getDashboardStats, getBookings, getPatientFullDetails } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { StatsCard, PageWrapper } from '@/components/ui'
import PatientLookup from '@/components/PatientLookup'
import { Users, BedDouble, CalendarCheck, CreditCard, TrendingUp, AlertCircle, UserPlus, Building2, Activity, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'

export default function DashboardPage() {
  const { user, role } = useAuth()
  const [stats, setStats] = useState(null)
  const [bookings, setBookings] = useState([])
  const [patientData, setPatientData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      if (role === 'admin' || role === 'staff') {
        const [s, b] = await Promise.all([getDashboardStats(), getBookings()])
        setStats(s)
        setBookings(b)
      } else if (role === 'patient') {
        const pData = await getPatientFullDetails(user.phone)
        setPatientData(pData)
      }
      setLoading(false)
    }
    if (user) load()
  }, [user, role])

  if (loading || (!stats && role !== 'patient') || (!patientData && role === 'patient')) return (
    <PageWrapper>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-cyan-500 rounded-full animate-spin shadow-lg" />
      </div>
    </PageWrapper>
  )

  // PATIENT VIEW
  if (role === 'patient') {
    return (
      <PageWrapper>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome back, {patientData.name.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 dark:text-slate-400">Here is your wellness summary.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-cyan-500/20">
            <Activity className="w-8 h-8 mb-4 opacity-80" />
            <h3 className="text-lg font-semibold opacity-90">Total Treatments</h3>
            <p className="text-4xl font-bold mt-2">{patientData.treatments.length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20">
            <Calendar className="w-8 h-8 mb-4 opacity-80" />
            <h3 className="text-lg font-semibold opacity-90">Total Bookings</h3>
            <p className="text-4xl font-bold mt-2">{patientData.bookings.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700">
            <CreditCard className="w-8 h-8 mb-4 text-emerald-500" />
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">Total Spent</h3>
            <p className="text-4xl font-bold text-slate-900 dark:text-white mt-2">
              ₹{(patientData.payments || []).reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Active & Past Bookings</h2>
          {patientData.bookings.length === 0 ? (
            <p className="text-slate-500">No bookings available.</p>
          ) : (
            <div className="space-y-4">
              {patientData.bookings.map(b => (
                 <div key={b.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{b.room?.name || 'Assigned Room'}</p>
                      <p className="text-sm text-slate-500">{new Date(b.created_at).toLocaleDateString()} • {b.days} Days</p>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${b.status === 'active' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                        {b.status}
                      </span>
                    </div>
                 </div>
              ))}
            </div>
          )}
        </div>
      </PageWrapper>
    )
  }

  // ADMIN / STAFF VIEW
  const roomData = [
    { name: 'Available', value: stats.availableRooms, fill: '#14b8a6' }, // Teal
    { name: 'Occupied', value: stats.occupiedRooms, fill: '#f43f5e' }, // Rose
  ]
  const revenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 62000 },
    { month: 'Mar', revenue: stats.totalRevenue },
  ]
  const bookingData = [
    { day: 'Mon', bookings: 3 }, { day: 'Tue', bookings: 5 },
    { day: 'Wed', bookings: 2 }, { day: 'Thu', bookings: 8 },
    { day: 'Fri', bookings: 4 }, { day: 'Sat', bookings: 6 }, { day: 'Sun', bookings: 1 },
  ]

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Executive Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Overview of your clinic's performance and patient operations.</p>
      </div>

      {/* Embedded Patient Lookup Component */}
      <PatientLookup />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total Patients" value={stats.totalPatients} icon={Users} color="cyan" trend={12} />
        <StatsCard title="Active Bookings" value={stats.activeBookings} icon={CalendarCheck} color="indigo" trend={8} />
        <StatsCard title="Available Rooms" value={`${stats.availableRooms}/${stats.totalRooms}`} icon={BedDouble} color="purple" />
        <StatsCard title="Life Revenue" value={`₹${(stats.totalRevenue/1000).toFixed(1)}k`} icon={TrendingUp} color="emerald" trend={15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/80 backdrop-blur rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -z-10" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Revenue Growth (Q1)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={val => `₹${val/1000}k`} />
              <Tooltip cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ background: 'rgba(30,41,59,0.9)', border: 'none', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#06b6d4" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800/80 backdrop-blur rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Room Occupancy</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={roomData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="value" stroke="none">
                {roomData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip cursor={false} contentStyle={{ background: 'rgba(30,41,59,0.9)', border: 'none', borderRadius: '12px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-3 mt-4">
            {roomData.map((entry, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.fill }} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{entry.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800/80 backdrop-blur rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Live Booking Feed</h3>
          <div className="space-y-4">
            {bookings.slice(0, 5).map(b => (
              <div key={b.id} className="flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-900/50 p-3 rounded-2xl transition-colors -mx-3">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${b.status === 'active' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {b.patient?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{b.patient?.name || 'Unknown'}</h4>
                    <p className="text-xs text-slate-500">{b.room?.name || 'N/A'} • {b.days} Days</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${b.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                    {b.status}
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">₹{Number(b.total).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 backdrop-blur rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Patient Admission Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bookingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} contentStyle={{ background: 'rgba(30,41,59,0.9)', border: 'none', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="bookings" fill="#06b6d4" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PageWrapper>
  )
}
