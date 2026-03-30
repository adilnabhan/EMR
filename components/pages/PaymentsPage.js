'use client'
import { useState, useEffect, useRef } from 'react'
import { getPayments, addPayment, getBookings, getBookingById } from '@/lib/store'
import { Modal, StatusBadge, EmptyState, PageWrapper } from '@/components/ui'
import { CreditCard, Plus, FileText, Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [bookings, setBookings] = useState([])
  const [allBookings, setAllBookings] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showInvoice, setShowInvoice] = useState(null)
  const [form, setForm] = useState({ booking_id: '', amount: '', type: 'advance' })
  const [loading, setLoading] = useState(true)
  const invoiceRef = useRef(null)

  const load = async () => {
    setLoading(true)
    const [p, b] = await Promise.all([getPayments(), getBookings()])
    setPayments(p); setAllBookings(b); setBookings(b.filter(x => x.status === 'active'))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.booking_id || !form.amount) return toast.error('Fill all required fields')
    await addPayment({ booking_id: parseInt(form.booking_id), amount: parseFloat(form.amount), type: form.type })
    await load()
    setForm({ booking_id: '', amount: '', type: 'advance' })
    setShowModal(false)
    toast.success('Payment recorded!')
  }

  const viewInvoice = async (bookingId) => {
    const booking = await getBookingById(bookingId)
    if (booking) setShowInvoice(booking)
  }

  const handleDownloadPDF = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default
      const canvas = await html2canvas(invoiceRef.current, { scale: 2 })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`invoice-${showInvoice.id}.pdf`)
      toast.success('PDF downloaded!')
    } catch { toast.error('PDF download failed') }
  }

  const getBookingLabel = (bookingId) => {
    const b = allBookings.find(b => b.id === bookingId)
    return b ? `${b.patient?.name || 'Patient'} — ${b.room?.name || 'Room'}` : `Booking #${bookingId}`
  }

  if (loading) return <PageWrapper><div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin" /></div></PageWrapper>

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payments</h1><p className="text-sm text-slate-500">Track payments and generate invoices</p></div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all"><Plus className="w-4 h-4" /> Record Payment</button>
      </div>
      {payments.length === 0 ? <EmptyState icon={CreditCard} title="No payments yet" description="Record payments for bookings" /> : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden"><div className="overflow-x-auto">
          <table className="w-full text-sm"><thead><tr className="text-left text-slate-500 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <th className="px-5 py-3">Booking</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Invoice</th>
          </tr></thead><tbody>{payments.map(p => (
            <tr key={p.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20">
              <td className="px-5 py-3.5 text-slate-900 dark:text-white font-medium">{getBookingLabel(p.booking_id)}</td>
              <td className="px-5 py-3.5 text-emerald-600 font-semibold">₹{Number(p.amount).toLocaleString()}</td>
              <td className="px-5 py-3.5"><StatusBadge status={p.type} /></td>
              <td className="px-5 py-3.5 text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
              <td className="px-5 py-3.5"><button onClick={() => viewInvoice(p.booking_id)} className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-cyan-50 transition-colors"><FileText className="w-4 h-4" /></button></td>
            </tr>
          ))}</tbody></table>
        </div></div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Payment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Booking *</label><select value={form.booking_id} onChange={e => setForm({...form, booking_id: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"><option value="">Select Booking</option>{bookings.map(b => <option key={b.id} value={b.id}>{b.patient?.name} — {b.room?.name} (Bal: ₹{Number(b.balance).toLocaleString()})</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount *</label><input type="number" min="1" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" placeholder="₹" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label><select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"><option value="advance">Advance</option><option value="final">Final</option></select></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all">Record</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!showInvoice} onClose={() => setShowInvoice(null)} title="Invoice" maxWidth="max-w-2xl">
        {showInvoice && (
          <div>
            <div ref={invoiceRef} className="bg-white p-6 rounded-xl" style={{color:'#0f172a'}}>
              <div className="flex justify-between items-start mb-6 border-b pb-4"><div><h2 className="text-xl font-bold" style={{color:'#0f172a'}}>MedCore Hospital</h2><p className="text-sm" style={{color:'#64748b'}}>Invoice #{showInvoice.id}</p></div><div className="text-right"><p className="text-sm" style={{color:'#64748b'}}>Date: {new Date().toLocaleDateString()}</p><p className="text-sm" style={{color:'#64748b'}}>Status: {showInvoice.status}</p></div></div>
              <div className="grid grid-cols-2 gap-4 mb-6"><div><p className="text-xs font-medium" style={{color:'#64748b'}}>Patient</p><p className="font-semibold">{showInvoice.patient?.name}</p></div><div><p className="text-xs font-medium" style={{color:'#64748b'}}>Room</p><p className="font-semibold">{showInvoice.room?.name} ({showInvoice.days} days)</p></div></div>
              <table className="w-full text-sm mb-4"><thead><tr className="border-b"><th className="text-left py-2" style={{color:'#64748b'}}>Description</th><th className="text-right py-2" style={{color:'#64748b'}}>Amount</th></tr></thead><tbody>
                <tr className="border-b"><td className="py-2">Room ({showInvoice.days} × ₹{showInvoice.room?.price_per_day?.toLocaleString()})</td><td className="py-2 text-right">₹{(showInvoice.days * (showInvoice.room?.price_per_day || 0)).toLocaleString()}</td></tr>
                {showInvoice.treatments?.map(t => <tr key={t.id} className="border-b"><td className="py-2">{t.name}</td><td className="py-2 text-right">₹{Number(t.cost).toLocaleString()}</td></tr>)}
              </tbody></table>
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between font-semibold"><span>Grand Total</span><span>₹{Number(showInvoice.total).toLocaleString()}</span></div>
                <div className="flex justify-between text-sm" style={{color:'#10b981'}}><span>Paid</span><span>₹{(showInvoice.payments || []).reduce((s,p) => s + Number(p.amount), 0).toLocaleString()}</span></div>
                <div className="flex justify-between font-bold text-lg" style={{color: Number(showInvoice.balance)>0?'#ef4444':'#10b981'}}><span>Balance</span><span>₹{Number(showInvoice.balance).toLocaleString()}</span></div>
              </div>
            </div>
            <div className="flex justify-end mt-4"><button onClick={handleDownloadPDF} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all"><Download className="w-4 h-4" /> Download PDF</button></div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  )
}
