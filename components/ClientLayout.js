'use client'
import { useState } from 'react'
import { AuthProvider, useAuth } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Toaster, toast } from 'react-hot-toast'

function LoginPage() {
  const { login } = useAuth()
  const [loginType, setLoginType] = useState('employee') // employee or patient
  const [identifier, setIdentifier] = useState('admin@medcore.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)

  const handleTypeChange = (type) => {
    setLoginType(type)
    if (type === 'employee') {
      setIdentifier('admin@medcore.com')
    } else {
      setIdentifier('') // Empty phone by default
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const success = await login(identifier, password, loginType)
    setLoading(false)
    if (!success) {
      toast.error('Invalid credentials or user not found')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/25">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">MedCore</h1>
          <p className="text-cyan-400/80 text-sm">Hospital ERP System</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>
          
          <div className="flex space-x-2 mb-6 p-1 bg-slate-800/50 rounded-lg">
            <button 
              type="button"
              onClick={() => handleTypeChange('employee')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginType === 'employee' ? 'bg-cyan-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Staff / Admin
            </button>
            <button 
              type="button"
              onClick={() => handleTypeChange('patient')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginType === 'patient' ? 'bg-cyan-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Patient
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {loginType === 'employee' ? 'Email' : 'Phone Number'}
              </label>
              <input 
                type={loginType === 'employee' ? 'email' : 'text'} 
                value={identifier} 
                onChange={e => setIdentifier(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                placeholder={loginType === 'employee' ? 'admin@medcore.com' : 'Enter registered phone'} 
              />
            </div>
            
            {loginType === 'employee' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="••••••••" 
                />
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-xs text-slate-400 text-center mt-4 text-balance">
            {loginType === 'employee' ? "Real auth check against 'employees' table." : "Real auth check against 'patients' table."}
          </p>
        </div>
      </div>
    </div>
  )
}

function AppShell({ children }) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return <LoginPage />

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e293b', color: '#e2e8f0', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }
      }} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-[260px]">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-h-[calc(100vh-60px)]">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  )
}
