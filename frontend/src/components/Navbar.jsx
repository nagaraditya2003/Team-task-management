// ============================================================
// components/Navbar.jsx
// ============================================================

import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <Link to="/dashboard" style={styles.brandLink}>📋 TaskManager</Link>
      </div>

      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/projects"  style={styles.link}>Projects</Link>
        <Link to="/tasks"     style={styles.link}>Tasks</Link>
      </div>

      <div style={styles.user}>
        <span style={styles.userInfo}>
          {user?.name} · <span style={styles.role}>{user?.role}</span>
        </span>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', height: '60px', background: '#1e293b', color: '#f1f5f9'
  },
  brand: { fontWeight: 700, fontSize: '18px' },
  brandLink: { color: '#f1f5f9', textDecoration: 'none' },
  links: { display: 'flex', gap: '24px' },
  link: { color: '#94a3b8', textDecoration: 'none', fontSize: '14px' },
  user: { display: 'flex', alignItems: 'center', gap: '12px' },
  userInfo: { fontSize: '13px', color: '#94a3b8' },
  role: { color: '#60a5fa', textTransform: 'capitalize' },
  logoutBtn: {
    background: '#ef4444', color: '#fff', border: 'none',
    borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px'
  }
}

export default Navbar
