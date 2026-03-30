'use client'
import { useState, useEffect } from 'react'
import { getBookings, dischargeBooking, getBookingById, getTreatments, getPayments } from '@/lib/store'
import { Modal, StatusBadge, EmptyState, PageWrapper } from '@/components/ui'
import { Activity, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DischargePage() {
  const [bookings, setBookings] = useState([])
  const [showDischarge, setShowDischarge] = useState(null)

  useEffect(() => { setBookings(getBookings()) }, [])

  const activeBookings = bookings.filter(b => b.status === 'active')
  const dischargedBookings = bookings.filter(b => b.status === 'discharged')

  const handleDischarge = (id) => {
    const result = dischargeBooking(id)
    if (result) {
      setBookings(getBookings())
      setShowDischarge(null)
      toast.success('Patient discharged successfully!')
    }
  }

  const viewDischargeDetails = (id) => {
    const booking = getBookingById(id)
    setShowDischarge(booking)
  }

  return (
    <PageWrapper>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Discharge</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Discharge patients and generate final bills</p>
      </div>

      {/* Active Bookings */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Active Bookings</h2>
        {activeBookings.length === 0 ? (
          <EmptyState icon={Activity} title="No active bookings" description="All patients have been discharged" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBookings.map(b => (
              <div key={b.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{b.patient?.name || 'N/A'}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{b.room?.name} • {b.days} days</p>
                    </div>
                  </div>
                  <StatusBadge status="active" />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-2.5 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">₹{b.total.toLocaleString()}</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-2.5 text-center">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Paid</p>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">₹{b.advance.toLocaleString()}</p>
                  </div>
                  <div className="bg-rose-50 dark:bg-rose-500/10 rounded-xl p-2.5 text-center">
                    <p className="text-xs text-rose-600 dark:text-rose-400">Balance</p>
                    <p className="text-sm font-bold text-rose-700 dark:text-rose-400">₹{b.balance.toLocaleString()}</p>
                  </div>
                </div>
                <button onClick={() => viewDischargeDetails(b.id)}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Discharge Patient
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discharged History */}
      {dischargedBookings.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Discharged</h2>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-5 py-3 font-medium">Patient</th>
                    <th className="px-5 py-3 font-medium">Room</th>
                    <th className="px-5 py-3 font-medium">Total</th>
                    <th className="px-5 py-3 font-medium">Balance</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dischargedBookings.map(b => (
                    <tr key={b.id} className="border-b border-slate-100 dark:border-slate-700/50">
                      <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">{b.patient?.name || 'N/A'}</td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{b.room?.name || 'N/A'}</td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">₹{b.total.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">₹{b.balance.toLocaleString()}</td>
                      <td className="px-5 py-3.5"><StatusBadge status="discharged" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Discharge Confirmation Modal */}
      <Modal isOpen={!!showDischarge} onClose={() => setShowDischarge(null)} title="Confirm Discharge" maxWidth="max-w-xl">
        {showDischarge && (
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4">
              <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">
                You are about to discharge <strong>{showDischarge.patient?.name}</strong> from <strong>{showDischarge.room?.name}</strong>.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-slate-900 dark:text-white">Bill Summary</h4>
              <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Room Charges</span>
                  <span className="text-slate-900 dark:text-white">₹{(showDischarge.days * (showDischarge.room?.price_per_day || 0)).toLocaleString()}</span>
                </div>
                {showDischarge.treatments?.map(t => (
                  <div key={t.id} className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{t.name}</span>
                    <span className="text-slate-900 dark:text-white">₹{t.cost.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 dark:border-slate-600 pt-2 flex justify-between font-bold">
                  <span className="text-slate-900 dark:text-white">Grand Total</span>
                  <span className="text-slate-900 dark:text-white">₹{showDischarge.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Total Paid</span>
                  <span>₹{showDischarge.payments?.reduce((s, p) => s + p.amount, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-rose-600 dark:text-rose-400">
                  <span>Balance Due</span>
                  <span>₹{showDischarge.balance.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowDischarge(null)} className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
              <button onClick={() => handleDischarge(showDischarge.id)} className="px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all">Confirm Discharge</button>
            </div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  )
}
