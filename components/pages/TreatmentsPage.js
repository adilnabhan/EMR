'use client'
import { useState, useEffect } from 'react'
import { getTreatments, addTreatment, getBookings } from '@/lib/store'
import { Modal, EmptyState, PageWrapper } from '@/components/ui'
import { Stethoscope, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

const TREATMENTS_CATALOG = {
  "Full Body Massage (Abhyangam)": 1500,
  "Baby Care & Massage": 1000,
  "Herbal Kashaya Bath (Vethukuli)": 800,
  "Abdominal Binding (Udara Veshtanam)": 700,
  "Ayurvedic Kizhi Therapy": 2000,
  "Face Massage": 500,
  "Anti Stretchmark Treatment": 2500,
  "Herbal Body Scrub": 1200,
  "Varnyam Face & Body Pack": 1800,
  "Kaanthi Facial Treatment": 3000,
  "Postpartum Care Herbal Hair Pack & Kashaya Wash": 2200,
  "Hair Protein Treatment & Hair Spa": 3500,
}

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState([])
  const [bookings, setBookings] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ booking_id: '', name: '', cost: '', date: '' })
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [t, b] = await Promise.all([getTreatments(), getBookings()])
    setTreatments(t); setBookings(b.filter(x => x.status === 'active'))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.booking_id || !form.name || !form.cost) return toast.error('Fill all required fields')
    await addTreatment({ booking_id: parseInt(form.booking_id), name: form.name, cost: parseFloat(form.cost), date: form.date || new Date().toISOString().split('T')[0] })
    await load()
    setForm({ booking_id: '', name: '', cost: '', date: '' })
    setShowModal(false)
    toast.success('Treatment added!')
  }

  const getBookingLabel = (bookingId) => {
    const allB = [...bookings, ...(treatments.length ? [] : [])]
    const b = bookings.find(b => b.id === bookingId)
    return b ? `${b.patient?.name || 'Patient'} — ${b.room?.name || 'Room'}` : `Booking #${bookingId}`
  }

  if (loading) return <PageWrapper><div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin" /></div></PageWrapper>

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Treatments</h1><p className="text-sm text-slate-500">Add and view treatments per booking</p></div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all"><Plus className="w-4 h-4" /> Add Treatment</button>
      </div>
      {treatments.length === 0 ? <EmptyState icon={Stethoscope} title="No treatments yet" description="Add treatments to active bookings" /> : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden"><div className="overflow-x-auto">
          <table className="w-full text-sm"><thead><tr className="text-left text-slate-500 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <th className="px-5 py-3">Booking</th><th className="px-5 py-3">Treatment</th><th className="px-5 py-3">Cost</th><th className="px-5 py-3">Date</th>
          </tr></thead><tbody>{treatments.map(t => (
            <tr key={t.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20">
              <td className="px-5 py-3.5 text-slate-900 dark:text-white font-medium">{getBookingLabel(t.booking_id)}</td>
              <td className="px-5 py-3.5"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center"><Stethoscope className="w-4 h-4 text-purple-600 dark:text-purple-400" /></div><span className="text-slate-700 dark:text-slate-300">{t.name}</span></div></td>
              <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 font-semibold">₹{Number(t.cost).toLocaleString()}</td>
              <td className="px-5 py-3.5 text-slate-500">{t.date}</td>
            </tr>
          ))}</tbody></table>
        </div></div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Treatment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Booking *</label><select value={form.booking_id} onChange={e => setForm({...form, booking_id: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"><option value="">Select Active Booking</option>{bookings.map(b => <option key={b.id} value={b.id}>{b.patient?.name} — {b.room?.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Treatment Name *</label><select value={form.name} onChange={e => setForm({...form, name: e.target.value, cost: TREATMENTS_CATALOG[e.target.value] || ''})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"><option value="">Select Treatment</option>{Object.keys(TREATMENTS_CATALOG).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cost *</label><input type="number" min="0" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" placeholder="₹" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all">Add Treatment</button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
