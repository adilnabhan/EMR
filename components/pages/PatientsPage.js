'use client'
import { useState, useEffect } from 'react'
import { getPatients, addPatient, deletePatient } from '@/lib/store'
import { Modal, EmptyState, PageWrapper } from '@/components/ui'
import { Users, Plus, Search, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PatientsPage() {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [form, setForm] = useState({ name: '', age: '', aadhaar: '', blood_group: '', phone: '' })
  const [loading, setLoading] = useState(true)

  const load = async () => { setLoading(true); setPatients(await getPatients()); setLoading(false) }
  useEffect(() => { load() }, [])

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search) || (p.aadhaar || '').includes(search)
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) return toast.error('Name and phone are required')
    await addPatient({ ...form, age: parseInt(form.age) || 0 })
    await load()
    setForm({ name: '', age: '', aadhaar: '', blood_group: '', phone: '' })
    setShowModal(false)
    toast.success('Patient added successfully!')
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this patient?')) {
      await deletePatient(id)
      await load()
      toast.success('Patient removed')
    }
  }

  if (loading) return <PageWrapper><div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin" /></div></PageWrapper>

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Patients</h1>
          <p className="text-sm text-slate-500">Manage patient records</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
          <Plus className="w-4 h-4" /> Add Patient
        </button>
      </div>
      <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/50 px-4 py-2.5 gap-3 max-w-md">
        <Search className="w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search by name, phone, or aadhaar..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none w-full" />
      </div>
      {filtered.length === 0 ? <EmptyState icon={Users} title="No patients found" description="Add your first patient to get started" /> : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-500 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-5 py-3">Name</th><th className="px-5 py-3">Age</th><th className="px-5 py-3">Blood Group</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Aadhaar</th><th className="px-5 py-3">Actions</th>
              </tr></thead>
              <tbody>{filtered.map(p => (
                <tr key={p.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="px-5 py-3.5"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">{p.name[0]}</div><span className="font-medium text-slate-900 dark:text-white">{p.name}</span></div></td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{p.age}</td>
                  <td className="px-5 py-3.5"><span className="px-2 py-0.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-md text-xs font-semibold">{p.blood_group || '—'}</span></td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{p.phone}</td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 font-mono text-xs">{p.aadhaar || '—'}</td>
                  <td className="px-5 py-3.5"><div className="flex items-center gap-1">
                    <button onClick={() => setSelectedPatient(p)} className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Patient">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" placeholder="Enter patient name" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age</label><input type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Blood Group</label><select value={form.blood_group} onChange={e => setForm({...form, blood_group: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"><option value="">Select</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}</select></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone *</label><input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" /></div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Aadhaar</label><input type="text" value={form.aadhaar} onChange={e => setForm({...form, aadhaar: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" placeholder="XXXX-XXXX-XXXX" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all">Save Patient</button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={!!selectedPatient} onClose={() => setSelectedPatient(null)} title="Patient Details">
        {selectedPatient && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6"><div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold">{selectedPatient.name[0]}</div><div><h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedPatient.name}</h3><p className="text-sm text-slate-500">ID: #{selectedPatient.id}</p></div></div>
            <div className="grid grid-cols-2 gap-4">
              {[['Age', selectedPatient.age],['Blood Group', selectedPatient.blood_group || '—'],['Phone', selectedPatient.phone],['Aadhaar', selectedPatient.aadhaar || '—']].map(([label, value]) => (
                <div key={label} className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-3"><p className="text-xs text-slate-500 mb-1">{label}</p><p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p></div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  )
}
