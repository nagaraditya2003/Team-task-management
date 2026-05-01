// ============================================================
// server.js — Entry point of the entire backend
// ============================================================

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')

// Load .env variables
dotenv.config()

const app = express()

// ─── MIDDLEWARE ───────────────────────────────────────────
app.use(express.json())

// Since frontend will be served from SAME domain, CORS can be simple
app.use(cors())

// ─── API ROUTES ───────────────────────────────────────────
app.use('/api/auth',     require('./src/routes/authRoutes'))
app.use('/api/projects', require('./src/routes/projectRoutes'))
app.use('/api/tasks',    require('./src/routes/taskRoutes'))

// ─── SERVE FRONTEND ───────────────────────────────────────
// This serves your React build (Vite → dist folder)

const frontendPath = path.join(__dirname, '../frontend/dist')

// Serve static files
app.use(express.static(frontendPath))

// Catch-all route → sends React app
// Express 5 no longer accepts '*' path syntax here.
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'))
})

// ─── DATABASE + SERVER START ──────────────────────────────
const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  })