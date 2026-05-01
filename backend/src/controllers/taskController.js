// ============================================================
// controllers/taskController.js
// ============================================================

const Task = require('../models/Task')
const Project = require('../models/Project')
const User = require('../models/User')

// ─── CREATE TASK ──────────────────────────────────────────
// POST /api/tasks  (admin only)
const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate } = req.body

    // Verify project exists
    const projectExists = await Project.findById(project)
    if (!projectExists) return res.status(404).json({ message: 'Project not found' })

    if (assignedTo) {
      const assignee = await User.findById(assignedTo)
      if (!assignee) {
        return res.status(404).json({ message: 'Assignee user not found' })
      }
      const isProjectMember = projectExists.members.some(
        (memberId) => memberId.toString() === assignedTo.toString()
      )
      if (!isProjectMember) {
        projectExists.members.addToSet(assignedTo)
        await projectExists.save()
      }
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      priority,
      dueDate
    })

    // Populate references so frontend gets names, not just IDs
    await task.populate('assignedTo', 'name email')
    await task.populate('createdBy', 'name email')
    await task.populate('project', 'name')

    res.status(201).json(task)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── GET TASKS ────────────────────────────────────────────
// GET /api/tasks?project=id
// Optional query param to filter by project
const getTasks = async (req, res) => {
  try {
    const filter = {}

    // Filter by project if provided: GET /api/tasks?project=abc123
    if (req.query.project) {
      filter.project = req.query.project
    }

    // Members only see their own assigned tasks
    if (req.user.role === 'member') {
      filter.assignedTo = req.user._id
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 })

    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── UPDATE TASK ──────────────────────────────────────────
// PUT /api/tasks/:id
// Admins can update anything. Members can only update status.
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) return res.status(404).json({ message: 'Task not found' })

    // Members can only change the status field
    if (req.user.role === 'member') {
      // Block if task isn't assigned to them
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to edit this task' })
      }
      // Only allow status update for members
      if (req.body.status) task.status = req.body.status
      await task.save()
      return res.json(task)
    }

    // Admin can update everything
    if (req.body.assignedTo) {
      const assignee = await User.findById(req.body.assignedTo)
      if (!assignee) {
        return res.status(404).json({ message: 'Assignee user not found' })
      }
      const taskProject = await Project.findById(task.project)
      const isProjectMember = taskProject?.members?.some(
        (memberId) => memberId.toString() === req.body.assignedTo.toString()
      )
      if (!isProjectMember && taskProject) {
        taskProject.members.addToSet(req.body.assignedTo)
        await taskProject.save()
      }
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name')

    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── DELETE TASK ──────────────────────────────────────────
// DELETE /api/tasks/:id  (admin only)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json({ message: 'Task deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── DASHBOARD STATS ──────────────────────────────────────
// GET /api/tasks/stats
const getStats = async (req, res) => {
  try {
    const filter = req.user.role === 'member' ? { assignedTo: req.user._id } : {}

    const [total, todo, inProgress, done, overdue] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: 'todo' }),
      Task.countDocuments({ ...filter, status: 'in-progress' }),
      Task.countDocuments({ ...filter, status: 'done' }),
      Task.countDocuments({ ...filter, dueDate: { $lt: new Date() }, status: { $ne: 'done' } })
    ])

    res.json({ total, todo, inProgress, done, overdue })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { createTask, getTasks, updateTask, deleteTask, getStats }
