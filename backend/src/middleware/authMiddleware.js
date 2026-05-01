// ============================================================
// middleware/authMiddleware.js
//
// LESSON: Middleware sits between the request and the route handler.
// This middleware:
//   1. Reads the JWT token from the request header
//   2. Verifies it's valid and not expired
//   3. Attaches the user's info to req.user
//   4. Calls next() to continue, or sends 401 if invalid
//
// Usage: Add "protect" to any route that needs login.
// Add "adminOnly" to routes only admins can access.
// ============================================================

const jwt = require('jsonwebtoken')
const User = require('../models/User')

// ─── protect ─────────────────────────────────────────────
// Verifies the user is logged in
const protect = async (req, res, next) => {
  try {
    // Token comes in the header like: Authorization: Bearer eyJhbGci...
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' })
    }

    // Extract just the token part (remove "Bearer ")
    const token = authHeader.split(' ')[1]

    // Verify the token using the same secret we signed it with
    // If expired or tampered, jwt.verify() throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach user data to req so route handlers can use it
    // .select('-password') means: fetch user but exclude password field
    req.user = await User.findById(decoded.id).select('-password')

    if (!req.user) {
      return res.status(401).json({ message: 'User no longer exists' })
    }

    next() // user is valid — continue to the route handler
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' })
  }
}

// ─── adminOnly ────────────────────────────────────────────
// Must be used AFTER protect (needs req.user to exist)
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({ message: 'Access denied: Admins only' })
  }
}

module.exports = { protect, adminOnly }
