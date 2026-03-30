'use client'
import { useState, useEffect } from 'react'
import { getBookings, createBooking, getPatients, getRooms } from '@/lib/store'
import { Modal, StatusBadge, EmptyState, PageWrapper } from '@/components/ui'
import { CalendarCheck, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [patients, setPatients] = useState([])
  const [rooms, setRooms] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ patient_id: '', room_id: '', days: '', advance: '' })
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [b, p, r] = await Promise.all([getBookings(), getPatients(), getRooms()])
    setBookings(b); setPatients(p); setRooms(r)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const availableRooms = rooms.filter(r => r.status === 'available')

  useEffect(() => {
    if (form.room_id && form.days) {
      const room = rooms.find(r => r.id === parseInt(form.room_id))
      if (room) {
        const total = room.price_per_day * parseInt(form.days)
        const advance = parseInt(form.advance) || 0
        setPreview({ total, advance, balance: total - advance, pricePerDay: room.price_per_day })
      }
    } else { setPreview(null) }
  }, [form.room_id, form.days, form.advance, rooms])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.patient_id || !form.room_id || !form.days) return toast.error('Please fill all required fields')
    await createBooking({ patient_id: form.patient_id, room_id: parseInt(form.room_id), days: parseInt(form.days), advance: parseInt(form.advance) || 0 })
    await load()
    setForm({ patient_id: '', room_id: '', days: '', advance: '' })
    setShowModal(false)
    toast.success('Booking created successfully!')
  }

  if (loading) return <PageWrapper><div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin" /></div></PageWrapper>

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bookings</h1><p className="text-sm text-slate-500">Manage patient room bookings</p></div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all"><Plus className="w-4 h-4" /> New Booking</button>
      </div>
      {bookings.length === 0 ? <EmptyState icon={CalendarCheck} title="No bookings yet" description="Create your first booking" /> : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden"><div className="overflow-x-auto">
          <table className="w-full text-sm"><thead><tr className="text-left text-slate-500 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <th className="px-5 py-3">Patient</th><th className="px-5 py-3">Room</th><th className="px-5 py-3">Days</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Advance</th><th className="px-5 py-3">Balance</th><th className="px-5 py-3">Status</th>
          </tr></thead><tbody>{bookings.map(b => (
            <tr key={b.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20">
              <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">{b.patient?.name || 'N/A'}</td>
              <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{b.room?.name || 'N/A'}</td>
              <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{b.days}</td>
              <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 font-semibold">₹{Number(b.total).toLocaleString()}</td>
              <td className="px-5 py-3.5 text-emerald-600 dark:text-emerald-400">₹{Number(b.advance).toLocaleString()}</td>
              <td className="px-5 py-3.5 text-rose-600 dark:text-rose-400 font-semibold">₹{Number(b.balance).toLocaleString()}</td>
              <td className="px-5 py-3.5"><StatusBadge status={b.status} /></td>
            </tr>
          ))}</tbody></table>
        </div></div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Booking" maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Patient *</label><select value={form.patient_id} onChange={e => setForm({...form, patient_id: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"><option value="">Select Patient</option>{patients.map(p => <option key={p.id} value={p.id}>{p.name} — {p.phone}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Room *</label><select value={form.room_id} onChange={e => setForm({...form, room_id: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"><option value="">Select Room</option>{availableRooms.map(r => <option key={r.id} value={r.id}>{r.name} — ₹{r.price_per_day}/day</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Days *</label><input type="number" min="1" value={form.days} onChange={e => setForm({...form, days: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Advance</label><input type="number" min="0" value={form.advance} onChange={e => setForm({...form, advance: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" placeholder="₹0" /></div>
          </div>
          {preview && (
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 space-y-2 animate-in">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Rate</span><span className="text-slate-700 dark:text-slate-300">₹{preview.pricePerDay.toLocaleString()} × {form.days} days</span></div>
              <div className="flex justify-between text-sm font-semibold"><span>Total</span><span>₹{preview.total.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm text-emerald-600"><span>Advance</span><span>- ₹{preview.advance.toLocaleString()}</span></div>
              <div className="border-t border-slate-200 dark:border-slate-600 pt-2 flex justify-between text-sm font-bold text-rose-600"><span>Balance</span><span>₹{preview.balance.toLocaleString()}</span></div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all">Create Booking</button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
