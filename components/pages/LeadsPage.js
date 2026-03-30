'use client'
import { useState, useEffect } from 'react'
import { getLeads, addLead, updateLeadStatus, convertLeadToPatient } from '@/lib/store'
import { Modal, StatusBadge, EmptyState, PageWrapper } from '@/components/ui'
import { UserPlus, Plus, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', enquiry: '' })

  useEffect(() => { setLeads(getLeads()) }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) return toast.error('Name and phone required')
    addLead(form)
    setLeads(getLeads())
    setForm({ name: '', phone: '', enquiry: '' })
    setShowModal(false)
    toast.success('Lead added!')
  }

  const handleStatusChange = (id, status) => {
    updateLeadStatus(id, status)
    setLeads(getLeads())
    toast.success(`Status → ${status}`)
  }

  const handleConvert = (id) => {
    const p = convertLeadToPatient(id)
    if (p) { setLeads(getLeads()); toast.success(`Converted: ${p.name}`) }
  }

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lead Management</h1>
          <p className="text-sm text-slate-500">Track enquiries and convert to patients</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[['New','blue',leads.filter(l=>l.status==='new').length],['Follow-up','amber',leads.filter(l=>l.status==='follow-up').length],['Converted','emerald',leads.filter(l=>l.status==='converted').length]].map(([label,c,v])=>(
          <div key={label} className={`bg-${c}-50 dark:bg-${c}-500/10 rounded-2xl p-4 border border-${c}-200 dark:border-${c}-500/30`}>
            <p className={`text-sm text-${c}-600 dark:text-${c}-400 font-medium`}>{label}</p>
            <p className={`text-2xl font-bold text-${c}-700 dark:text-${c}-300`}>{v}</p>
          </div>
        ))}
      </div>

      {leads.length === 0 ? <EmptyState icon={UserPlus} title="No leads" description="Start tracking enquiries" /> : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-500 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-5 py-3">Name</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Enquiry</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th>
              </tr></thead>
              <tbody>{leads.map(l=>(
                <tr key={l.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20">
                  <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">{l.name}</td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{l.phone}</td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 max-w-xs truncate">{l.enquiry}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={l.status} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1">
                      {l.status==='new'&&<button onClick={()=>handleStatusChange(l.id,'follow-up')} className="px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200">Follow-up</button>}
                      {l.status!=='converted'&&<button onClick={()=>handleConvert(l.id)} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200">Convert <ArrowRight className="w-3 h-3" /></button>}
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={()=>setShowModal(false)} title="Add New Lead">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
            <input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" /></div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone *</label>
            <input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" /></div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Enquiry</label>
            <textarea value={form.enquiry} onChange={e=>setForm({...form,enquiry:e.target.value})} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm resize-none" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all">Add Lead</button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
