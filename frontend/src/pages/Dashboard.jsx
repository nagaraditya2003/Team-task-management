// ============================================================
// pages/Dashboard.jsx
//
// LESSON: useEffect fetches data when the component mounts.
// The empty [] dependency array means "run once on mount".
// This is the standard pattern for loading data from an API.
// ============================================================

import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { taskService } from '../services/taskService'
import { useAuth } from '../context/AuthContext'

const StatCard = ({ label, value, color }) => (
  <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
    <div style={{ ...styles.statNum, color }}>{value}</div>
    <div style={styles.statLabel}>{label}</div>
  </div>
)

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await taskService.getStats()
        setStats(data)
      } catch (err) {
        setError('Failed to load stats')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, []) // [] = run once when component mounts

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>
        <div style={styles.welcome}>
          <h1 style={styles.heading}>👋 Welcome, {user?.name}!</h1>
          <p style={styles.sub}>Here's your task overview</p>
        </div>

        {loading && <p>Loading stats...</p>}
        {error   && <p style={{ color: 'red' }}>{error}</p>}

        {stats && (
          <div style={styles.grid}>
            <StatCard label="Total Tasks"  value={stats.total}      color="#3b82f6" />
            <StatCard label="To Do"        value={stats.todo}       color="#f59e0b" />
            <StatCard label="In Progress"  value={stats.inProgress} color="#8b5cf6" />
            <StatCard label="Completed"    value={stats.done}       color="#22c55e" />
            <StatCard label="Overdue"      value={stats.overdue}    color="#ef4444" />
          </div>
        )}

        <div style={styles.quickLinks}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.linkGrid}>
            <a href="/projects" style={styles.linkCard}>
              <span style={styles.linkIcon}>📁</span>
              <span>View Projects</span>
            </a>
            <a href="/tasks" style={styles.linkCard}>
              <span style={styles.linkIcon}>✅</span>
              <span>View Tasks</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc' },
  content: { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' },
  welcome: { marginBottom: '32px' },
  heading: { margin: '0 0 6px', fontSize: '26px', color: '#1e293b' },
  sub: { margin: 0, color: '#64748b' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' },
  statNum: { fontSize: '36px', fontWeight: 700, marginBottom: '4px' },
  statLabel: { fontSize: '13px', color: '#64748b', fontWeight: 500 },
  quickLinks: {},
  sectionTitle: { fontSize: '18px', color: '#1e293b', marginBottom: '16px' },
  linkGrid: { display: 'flex', gap: '16px' },
  linkCard: { display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '16px 24px', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textDecoration: 'none', color: '#1e293b', fontWeight: 600, fontSize: '14px' },
  linkIcon: { fontSize: '20px' }
}

export default Dashboard
