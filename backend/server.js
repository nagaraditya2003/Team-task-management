// ============================================================
// server.js — Entry point of the entire backend
// ============================================================

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')
const helmet = require('helmet')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const frontendPath = path.join(__dirname, '../frontend/dist')

// ─── MIDDLEWARE ORDER (REQUIRED) ──────────────────────────
app.use(helmet())

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

app.get('/healthz', (req, res) => res.status(200).json({ status: 'ok' }))

// ─── API ROUTES ───────────────────────────────────────────
app.use('/api/auth', require('./src/routes/authRoutes'))
app.use('/api/projects', require('./src/routes/projectRoutes'))
app.use('/api/tasks', require('./src/routes/taskRoutes'))

// API 404 guard (must be before static serving)
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` })
})

// ─── FRONTEND STATIC + SPA FALLBACK ───────────────────────
app.use(express.static(frontendPath))
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'))
})

mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime error:', err)
})

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
}).then(() => {
  console.log('MongoDB connected')
  const server = app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
  )

  process.on('SIGTERM', () => {
    console.log('SIGTERM received — shutting down gracefully')
    server.close(() => {
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed')
        process.exit(0)
      })
    })
  })
}).catch((err) => {
  console.error('MongoDB connection error:', err)
  process.exit(1)
})