import React, { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/config/firebase'

// context to share user auth state across the app
// learnt this from react docs

type AuthContextType = {
  user: User | null,
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // this listener runs whenever auth state changes (login/logout)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return unsubscribe // cleanup
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// custom hook so i dont have to write useContext everywhere
export function useAuth() {
  return useContext(AuthContext)
}
