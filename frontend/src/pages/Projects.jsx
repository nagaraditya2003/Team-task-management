// pages/Projects.jsx

import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import ProjectCard from '../components/ProjectCard'
import { projectService } from '../services/projectService'
import { useAuth } from '../context/AuthContext'

const Projects = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  // Create form state
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({ name: '', description: '' })
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => { fetchProjects() }, [])

  const fetchProjects = async () => {
    try {
      const data = await projectService.getAll()
      setProjects(data)
    } catch {
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      const newProject = await projectService.create(form)
      setProjects([newProject, ...projects])
      setForm({ name: '', description: '' })
      setShowForm(false)
    } catch (err) {
      setError(err.message || 'Failed to create project')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return
    try {
      await projectService.delete(id)
      setProjects(projects.filter(p => p._id !== id))
    } catch {
      setError('Failed to delete project')
    }
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>
        <div style={styles.topBar}>
          <h1 style={styles.heading}>📁 Projects</h1>
          {user?.role === 'admin' && (
            <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
              {showForm ? '✕ Cancel' : '+ New Project'}
            </button>
          )}
        </div>

        {/* Create project form — only visible for admins */}
        {showForm && (
          <div style={styles.formCard}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>Create New Project</h3>
            <form onSubmit={handleCreate}>
              <input
                placeholder="Project name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                style={styles.input} required
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ ...styles.input, height: '80px', resize: 'vertical' }}
              />
              <button type="submit" disabled={formLoading} style={styles.submitBtn}>
                {formLoading ? 'Creating...' : 'Create Project'}
              </button>
            </form>
          </div>
        )}

        {error   && <p style={{ color: 'red' }}>{error}</p>}
        {loading && <p>Loading projects...</p>}

        {!loading && projects.length === 0 && (
          <div style={styles.empty}>
            <p>No projects yet. {user?.role === 'admin' ? 'Create one above!' : 'Ask an admin to add you to a project.'}</p>
          </div>
        )}

        <div style={styles.grid}>
          {projects.map(project => (
            <ProjectCard key={project._id} project={project} onDelete={handleDelete} />
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc' },
  content: { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  heading: { margin: 0, fontSize: '24px', color: '#1e293b' },
  addBtn: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' },
  formCard: { background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: '24px' },
  input: { display: 'block', width: '100%', padding: '10px 12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' },
  submitBtn: { background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' },
  empty: { textAlign: 'center', padding: '60px', color: '#94a3b8' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }
}

export default Projects
