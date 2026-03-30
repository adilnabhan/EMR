'use client'
import { createContext, useContext, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)

  const login = async (identifier, password, type = 'employee') => {
    try {
      if (type === 'employee') {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('email', identifier)
          .single()
        
        if (error || !data) return false
        
        setUser(data)
        setRole(data.role)
        return true
      } else if (type === 'patient') {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('phone', identifier)
          .single()
        
        if (error || !data) return false
        
        setUser(data)
        setRole('patient')
        return true
      }
    } catch (err) {
      console.error(err)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, role, login, logout, isAdmin: role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
