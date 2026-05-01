// ============================================================
// routes/projectRoutes.js
// All routes here are prefixed with /api/projects
// ============================================================

const router = require('express').Router()
const {
  createProject, getProjects, getProjectById,
  updateProject, addMember, deleteProject
} = require('../controllers/projectController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

// protect   = must be logged in
// adminOnly = must be admin (always used after protect)

router.get('/',          protect, getProjects)
router.get('/:id',       protect, getProjectById)
router.post('/',         protect, adminOnly, createProject)
router.put('/:id',       protect, adminOnly, updateProject)
router.put('/:id/members', protect, adminOnly, addMember)
router.delete('/:id',    protect, adminOnly, deleteProject)

module.exports = router
