// pages/Tasks.jsx

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import TaskCard from '../components/TaskCard'
import { taskService } from '../services/taskService'
import { projectService } from '../services/projectService'
import { authService } from '../services/authService'
import { useAuth } from '../context/AuthContext'

const Tasks = () => {
  const { user } = useAuth()
  const [searchParams] = useSearchParams() // reads ?project=xxx from URL
  const projectFilter = searchParams.get('project')

  const [tasks, setTasks]       = useState([])
  const [projects, setProjects] = useState([])
  const [members, setMembers]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  const [form, setForm] = useState({
    title: '', description: '', project: projectFilter || '',
    assignedTo: '', priority: 'medium', dueDate: ''
  })

  const availableMembers = members

  useEffect(() => {
    fetchTasks()
    if (user?.role === 'admin') {
      fetchProjects()
      fetchMembers()
    }
  }, [projectFilter])

  const fetchTasks = async () => {
    try {
      const data = await taskService.getAll(projectFilter)
      setTasks(data)
    } catch {
      setError('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const data = await projectService.getAll()
      setProjects(data)
    } catch {}
  }

  const fetchMembers = async () => {
    try {
      const data = await authService.getMembers()
      setMembers(data)
    } catch {}
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        assignedTo: form.assignedTo || null
      }
      const newTask = await taskService.create(payload)
      setTasks([newTask, ...tasks])
      setForm({ title: '', description: '', project: projectFilter || '', assignedTo: '', priority: 'medium', dueDate: '' })
      setShowForm(false)
    } catch (err) {
      setError(err.message || 'Failed to create task')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await taskService.update(id, { status })
      setTasks(tasks.map(t => t._id === id ? updated : t))
    } catch {
      setError('Failed to update task')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await taskService.delete(id)
      setTasks(tasks.filter(t => t._id !== id))
    } catch {
      setError('Failed to delete task')
    }
  }

  // Filter tasks by status in the UI (no extra API call needed)
  const filteredTasks = statusFilter === 'all'
    ? tasks
    : tasks.filter(t => t.status === statusFilter)

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>
        <div style={styles.topBar}>
          <h1 style={styles.heading}>✅ Tasks</h1>
          {user?.role === 'admin' && (
            <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
              {showForm ? '✕ Cancel' : '+ New Task'}
            </button>
          )}
        </div>

        {/* Create task form */}
        {showForm && user?.role === 'admin' && (
          <div style={styles.formCard}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>Create New Task</h3>
            <form onSubmit={handleCreate}>
              <input placeholder="Task title" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                style={styles.input} required />
              <textarea placeholder="Description (optional)" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ ...styles.input, height: '70px' }} />
              <div style={styles.formRow}>
                <select value={form.project}
                  onChange={e => setForm({ ...form, project: e.target.value, assignedTo: '' })}
                  style={styles.input} required>
                  <option value="">Select project</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
                <select value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  style={styles.input}>
                  <option value="low">Low priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="high">High priority</option>
                </select>
              </div>
              <div style={styles.formRow}>
                <select
                  value={form.assignedTo}
                  onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                  style={styles.input}
                  disabled={!form.project}
                >
                  <option value="">{form.project ? 'Unassigned' : 'Select project first'}</option>
                  {availableMembers.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
                <input type="date" value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  style={styles.input} />
              </div>
              <button type="submit" style={styles.submitBtn}>Create Task</button>
            </form>
          </div>
        )}

        {/* Status filter tabs */}
        <div style={styles.filters}>
          {['all', 'todo', 'in-progress', 'done'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{ ...styles.filterBtn, ...(statusFilter === s ? styles.filterActive : {}) }}>
              {s === 'all' ? 'All' : s.replace('-', ' ')}
            </button>
          ))}
          <span style={styles.count}>{filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}</span>
        </div>

        {error   && <p style={{ color: 'red' }}>{error}</p>}
        {loading && <p>Loading tasks...</p>}

        {!loading && filteredTasks.length === 0 && (
          <div style={styles.empty}><p>No tasks found.</p></div>
        )}

        {filteredTasks.map(task => (
          <TaskCard key={task._id} task={task}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete} />
        ))}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc' },
  content: { maxWidth: '800px', margin: '0 auto', padding: '32px 24px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  heading: { margin: 0, fontSize: '24px', color: '#1e293b' },
  addBtn: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' },
  formCard: { background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: '24px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  input: { display: 'block', width: '100%', padding: '10px 12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' },
  submitBtn: { background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' },
  filters: { display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' },
  filterBtn: { padding: '6px 14px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '13px', color: '#64748b', textTransform: 'capitalize' },
  filterActive: { background: '#3b82f6', color: '#fff', borderColor: '#3b82f6' },
  count: { marginLeft: 'auto', fontSize: '13px', color: '#94a3b8' },
  empty: { textAlign: 'center', padding: '60px', color: '#94a3b8' }
}

export default Tasks
