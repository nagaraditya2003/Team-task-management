// ============================================================
// routes/AppRouter.jsx
//
// LESSON: React Router renders different components based on URL.
// <BrowserRouter> enables URL-based routing.
// <Routes> holds all route definitions.
// <Route path="/" element={<Component/>}> maps URL → component.
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import Projects from '../pages/Projects'
import Tasks from '../pages/Tasks'
import ProtectedRoute from '../components/ProtectedRoute'

const AppRouter = () => {
  const { loading } = useAuth()

  // While restoring session, show nothing (avoid flash of wrong page)
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — anyone can visit */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes — must be logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects"  element={<Projects />} />
          <Route path="/tasks"     element={<Tasks />} />
        </Route>

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
