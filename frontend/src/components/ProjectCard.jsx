// components/ProjectCard.jsx

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const STATUS_COLORS = {
  active:    { bg: '#d1fae5', color: '#065f46' },
  completed: { bg: '#dbeafe', color: '#1e40af' },
  archived:  { bg: '#f1f5f9', color: '#475569' }
}

const ProjectCard = ({ project, onDelete }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const statusStyle = STATUS_COLORS[project.status]

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.name}>{project.name}</h3>
        <span style={{ ...styles.badge, ...statusStyle }}>{project.status}</span>
      </div>

      {project.description && <p style={styles.desc}>{project.description}</p>}

      <div style={styles.meta}>
        <span>👑 {project.owner?.name}</span>
        <span>👥 {project.members?.length} member{project.members?.length !== 1 ? 's' : ''}</span>
        <span>📅 {new Date(project.createdAt).toLocaleDateString()}</span>
      </div>

      <div style={styles.actions}>
        <button onClick={() => navigate(`/tasks?project=${project._id}`)} style={styles.viewBtn}>
          View Tasks
        </button>
        {user?.role === 'admin' && (
          <button onClick={() => onDelete(project._id)} style={styles.deleteBtn}>Delete</button>
        )}
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: '#fff', borderRadius: '12px', padding: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  name: { margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' },
  badge: { fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '20px', textTransform: 'capitalize' },
  desc: { fontSize: '13px', color: '#64748b', margin: '0 0 12px' },
  meta: { display: 'flex', gap: '14px', fontSize: '12px', color: '#64748b', marginBottom: '14px', flexWrap: 'wrap' },
  actions: { display: 'flex', gap: '8px' },
  viewBtn: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px' },
  deleteBtn: { background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px' }
}

export default ProjectCard
