'use client'
import { useState, useEffect } from 'react'
import { getRooms } from '@/lib/store'
import { PageWrapper, StatusBadge } from '@/components/ui'
import { BedDouble, Check, X } from 'lucide-react'

export default function RoomsPage() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { async function load() { setLoading(true); setRooms(await getRooms()); setLoading(false) } load() }, [])

  if (loading) return <PageWrapper><div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin" /></div></PageWrapper>

  const available = rooms.filter(r => r.status === 'available').length
  const occupied = rooms.filter(r => r.status === 'occupied').length

  return (
    <PageWrapper>
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Room Management</h1><p className="text-sm text-slate-500">Monitor room availability and status</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50"><p className="text-sm text-slate-500">Total Rooms</p><p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{rooms.length}</p></div>
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white"><p className="text-sm text-emerald-100">Available</p><p className="text-3xl font-bold mt-1">{available}</p></div>
        <div className="bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl p-5 text-white"><p className="text-sm text-rose-100">Occupied</p><p className="text-3xl font-bold mt-1">{occupied}</p></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map(room => (
          <div key={room.id} className={`rounded-2xl p-5 border-2 transition-all duration-300 hover:shadow-lg ${room.status === 'available' ? 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400' : 'bg-rose-50/50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/30'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${room.status === 'available' ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-rose-100 dark:bg-rose-500/20'}`}>
                  <BedDouble className={`w-5 h-5 ${room.status === 'available' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} />
                </div>
                <div><h3 className="font-bold text-slate-900 dark:text-white">{room.name}</h3><p className="text-xs text-slate-500">₹{room.price_per_day.toLocaleString()}/day</p></div>
              </div>
              <StatusBadge status={room.status} />
            </div>
            <div className="flex items-center gap-2">
              {room.status === 'available' ? <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><Check className="w-4 h-4" /><span className="text-sm font-medium">Ready for booking</span></div>
              : <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400"><X className="w-4 h-4" /><span className="text-sm font-medium">Currently occupied</span></div>}
            </div>
          </div>
        ))}
      </div>
    </PageWrapper>
  )
}
