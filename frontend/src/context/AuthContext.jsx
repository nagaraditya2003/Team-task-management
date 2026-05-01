// ============================================================
// context/AuthContext.jsx
//
// LESSON: React Context solves "prop drilling" — passing data
// through many layers of components just to reach a child.
// With Context, any component can read/update the auth state
// directly, no matter how deep it is in the tree.
//
// Pattern used here:
//   1. Create a Context (AuthContext)
//   2. Create a Provider component (AuthProvider) that holds state
//   3. Wrap the whole app in <AuthProvider>
//   4. Any component calls useAuth() to get user/login/logout
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

// Create the context — initially undefined
const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // true while restoring session

  // On app load, check if a token exists in localStorage
  // If yes, fetch the user data to restore their session
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const userData = await authService.getMe()
          setUser(userData)
        } catch {
          // Token expired or invalid — clear it
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
    }
    restoreSession()
  }, [])

  // Called after successful login/register
  const login = (userData) => {
    // Save token so it persists across page refreshes
    localStorage.setItem('token', userData.token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — cleaner than calling useContext(AuthContext) everywhere
export const useAuth = () => useContext(AuthContext)
