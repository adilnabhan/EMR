'use client'
import { useState, useEffect } from 'react'
import { getEmployees, addEmployee, deleteEmployee } from '@/lib/store'
import { Modal, StatusBadge, EmptyState, PageWrapper } from '@/components/ui'
import { Building2, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'staff', phone: '' })

  useEffect(() => { setEmployees(getEmployees()) }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email) return toast.error('Name and email required')
    addEmployee(form)
    setEmployees(getEmployees())
    setForm({ name: '', email: '', role: 'staff', phone: '' })
    setShowModal(false)
    toast.success('Employee added!')
  }

  const handleDelete = (id) => {
    if (confirm('Remove this employee?')) {
      deleteEmployee(id)
      setEmployees(getEmployees())
      toast.success('Employee removed')
    }
  }

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Employees</h1>
          <p className="text-sm text-slate-500">Manage staff and admin accounts</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      {employees.length === 0 ? <EmptyState icon={Building2} title="No employees" description="Add your first team member" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map(e => (
            <div key={e.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {e.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{e.name}</h3>
                    <p className="text-xs text-slate-500">{e.email}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(e.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{e.phone}</span>
                <StatusBadge status={e.role} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Employee">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" /></div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm">
                <option value="staff">Staff</option><option value="admin">Admin</option>
              </select></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all">Add Employee</button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
