// ============================================================
// controllers/authController.js
//
// LESSON: Controllers contain the actual logic for each route.
// Keeping logic here (instead of in routes) keeps code clean.
// Routes just say WHAT endpoint exists.
// Controllers say WHAT HAPPENS when that endpoint is hit.
// ============================================================

const jwt = require('jsonwebtoken')
const User = require('../models/User')

// ─── Helper: generate JWT token ──────────────────────────
// We store the user's _id inside the token payload.
// Later, authMiddleware decodes this to know who's making the request.
const generateToken = (id) => {
  return jwt.sign(
    { id },                        // payload — what we store in the token
    process.env.JWT_SECRET,        // secret key — used to sign + verify
    { expiresIn: '7d' }            // token expires in 7 days
  )
}

// ─── REGISTER ─────────────────────────────────────────────
// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    console.log('Registering user:', { name, email, role }) // Debug log
    // Check if email already taken
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Create user — password gets hashed automatically via pre-save hook
    const user = await User.create({ name, email, password, role })

    // Send back user info + token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── LOGIN ────────────────────────────────────────────────
// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Compare plain password with hashed one using our custom method
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Login success — send user data + token to frontend
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── GET CURRENT USER ────────────────────────────────────
// GET /api/auth/me  (protected)
// Frontend uses this on app load to restore the logged-in user
const getMe = async (req, res) => {
  // req.user is set by authMiddleware — no DB call needed
  res.json(req.user)
}

// ─── GET MEMBERS (ADMIN) ──────────────────────────────────
// GET /api/auth/members
const getMembers = async (req, res) => {
  try {
    const members = await User.find({ role: 'member' })
      .select('_id name email role')
      .sort({ name: 1 })
    res.json(members)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { register, login, getMe, getMembers }
