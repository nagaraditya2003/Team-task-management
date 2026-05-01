// ============================================================
// components/TaskCard.jsx
//
// LESSON: Props make components reusable.
// This card renders differently based on what you pass in.
// It also calls onStatusChange/onDelete passed from the parent —
// this is the "lifting state up" pattern.
// ============================================================

import { useAuth } from '../context/AuthContext'

const STATUS_COLORS = {
  'todo':        { bg: '#fef3c7', color: '#92400e' },
  'in-progress': { bg: '#dbeafe', color: '#1e40af' },
  'done':        { bg: '#d1fae5', color: '#065f46' }
}

const PRIORITY_COLORS = {
  low:    '#22c55e',
  medium: '#f59e0b',
  high:   '#ef4444'
}

const TaskCard = ({ task, onStatusChange, onDelete }) => {
  const { user } = useAuth()
  const statusStyle = STATUS_COLORS[task.status]
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'

  return (
    <div style={{ ...styles.card, borderLeft: `4px solid ${PRIORITY_COLORS[task.priority]}` }}>
      {/* Header */}
      <div style={styles.header}>
        <h4 style={styles.title}>{task.title}</h4>
        <span style={{ ...styles.badge, ...statusStyle }}>{task.status}</span>
      </div>

      {/* Description */}
      {task.description && <p style={styles.desc}>{task.description}</p>}

      {/* Meta info */}
      <div style={styles.meta}>
        <span>👤 {task.assignedTo?.name || 'Unassigned'}</span>
        <span>📁 {task.project?.name}</span>
        {task.dueDate && (
          <span style={isOverdue ? { color: '#ef4444', fontWeight: 600 } : {}}>
            📅 {new Date(task.dueDate).toLocaleDateString()}
            {isOverdue && ' ⚠️ Overdue'}
          </span>
        )}
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        {/* Status selector — members can change their own task status */}
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          style={styles.select}
        >
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        {/* Only admins can delete */}
        {user?.role === 'admin' && (
          <button onClick={() => onDelete(task._id)} style={styles.deleteBtn}>Delete</button>
        )}
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: '#fff', borderRadius: '10px', padding: '16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '12px'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  title: { margin: 0, fontSize: '15px', fontWeight: 600, color: '#1e293b' },
  badge: { fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase' },
  desc: { fontSize: '13px', color: '#64748b', margin: '6px 0 10px' },
  meta: { display: 'flex', gap: '14px', fontSize: '12px', color: '#64748b', flexWrap: 'wrap', marginBottom: '12px' },
  actions: { display: 'flex', gap: '8px', alignItems: 'center' },
  select: { fontSize: '13px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer' },
  deleteBtn: { background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '13px' }
}

export default TaskCard
