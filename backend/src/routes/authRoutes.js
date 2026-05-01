// ============================================================
// routes/authRoutes.js
//
// LESSON: Routes map HTTP method + URL → controller function
// POST /api/auth/register → register()
// POST /api/auth/login    → login()
// GET  /api/auth/me       → getMe()  (protected — needs token)
// ============================================================

const router = require('express').Router()
const { register, login, getMe, getMembers } = require('../controllers/authController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

router.post('/register', register)
router.post('/login',    login)
router.get('/me',        protect, getMe) // protect runs first, then getMe
router.get('/members',   protect, adminOnly, getMembers)

module.exports = router
