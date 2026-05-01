// ============================================================
// components/ProtectedRoute.jsx
//
// LESSON: This is a "guard" component.
// <Outlet> renders the child route if user is logged in.
// If not logged in, redirects to /login.
// It wraps all protected routes in AppRouter.
// ============================================================

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = () => {
  const { user } = useAuth()

  // If no user in context → not logged in → go to login page
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute
