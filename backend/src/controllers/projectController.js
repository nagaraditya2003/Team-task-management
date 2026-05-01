// ============================================================
// controllers/projectController.js
//
// LESSON: CRUD = Create, Read, Update, Delete
// These are the 4 operations every resource needs.
// We map them to HTTP methods:
//   POST   → Create
//   GET    → Read
//   PUT    → Update
//   DELETE → Delete
// ============================================================

const Project = require('../models/Project')

// ─── CREATE PROJECT ───────────────────────────────────────
// POST /api/projects  (admin only)
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,   // the logged-in admin is the owner
      members: [req.user._id] // owner is also a member by default
    })

    res.status(201).json(project)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── GET ALL PROJECTS ─────────────────────────────────────
// GET /api/projects
// Admins see all. Members see only their projects.
const getProjects = async (req, res) => {
  try {
    let projects

    if (req.user.role === 'admin') {
      // Admin sees every project, populate owner name
      projects = await Project.find()
        .populate('owner', 'name email')
        .populate('members', 'name email')
        .sort({ createdAt: -1 }) // newest first
    } else {
      // Member sees only projects they're in
      projects = await Project.find({ members: req.user._id })
        .populate('owner', 'name email')
        .populate('members', 'name email')
        .sort({ createdAt: -1 })
    }

    res.json(projects)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── GET SINGLE PROJECT ───────────────────────────────────
// GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email')

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Only admin or project members can view it
    const isMember = project.members.some(m => m._id.toString() === req.user._id.toString())
    if (req.user.role !== 'admin' && !isMember) {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json(project)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── UPDATE PROJECT ───────────────────────────────────────
// PUT /api/projects/:id  (admin only)
const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // new:true returns updated doc
    )

    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── ADD MEMBER ───────────────────────────────────────────
// PUT /api/projects/:id/members  (admin only)
const addMember = async (req, res) => {
  try {
    const { userId } = req.body
    const project = await Project.findById(req.params.id)

    if (!project) return res.status(404).json({ message: 'Project not found' })

    // Avoid duplicates using $addToSet (only adds if not already in array)
    project.members.addToSet(userId)
    await project.save()

    res.json(project)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── DELETE PROJECT ───────────────────────────────────────
// DELETE /api/projects/:id  (admin only)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json({ message: 'Project deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { createProject, getProjects, getProjectById, updateProject, addMember, deleteProject }
