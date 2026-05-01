// ============================================================
// server.js — Entry point of the entire backend
// Every request from React comes here first
// ============================================================

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

// Load .env file variables into process.env
dotenv.config()

const app = express()

// ─── MIDDLEWARE ───────────────────────────────────────────
// Middleware = functions that run on EVERY request before your route handler

// Parse incoming JSON bodies (so req.body works)
app.use(express.json())

// Allow React (port 5173) to call this server (port 5000)
// Without this, browser blocks cross-origin requests
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

// ─── ROUTES ───────────────────────────────────────────────
// Each route file handles a specific resource
app.use('/api/auth',     require('./src/routes/authRoutes'))
app.use('/api/projects', require('./src/routes/projectRoutes'))
app.use('/api/tasks',    require('./src/routes/taskRoutes'))

// Health check — Railway uses this to verify the app is alive
app.get('/', (req, res) => {
  res.json({ message: 'Team Task Manager API is running!' })
})

// ─── DATABASE + SERVER START ──────────────────────────────
const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1) // Kill process if DB fails — no point running without DB
  })
