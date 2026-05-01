// ============================================================
// routes/taskRoutes.js
// All routes here are prefixed with /api/tasks
// ============================================================

const router = require('express').Router()
const { createTask, getTasks, updateTask, deleteTask, getStats } = require('../controllers/taskController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

// Stats must be defined BEFORE /:id or Express will treat "stats" as an id param
router.get('/stats',  protect, getStats)

router.get('/',       protect, getTasks)
router.post('/',      protect, adminOnly, createTask)
router.put('/:id',    protect, updateTask)   // both roles can update (controller enforces limits)
router.delete('/:id', protect, adminOnly, deleteTask)

module.exports = router
