require('dotenv').config()

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const PORT = process.env.PORT || 3000
const MONGODB_URI = process.env.MONGODB_URI
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

const app = express()
app.use(cors())
app.use(express.json())

let dbReady = false
let authReady = false

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
)

const User = mongoose.model('User', userSchema)

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

const requireAuth = (req, res, next) => {
  if (!authReady) return res.status(503).json({ error: 'auth not configured' })
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'missing token' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = { id: payload.sub, email: payload.email }
    next()
  } catch (err) {
    res.status(401).json({ error: 'invalid token' })
  }
}

const signToken = (user) =>
  jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })

app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Hello from AWS EC2 + PM2',
    db: dbReady ? 'connected' : 'disconnected',
    auth: authReady,
  })
})

app.post(
  '/api/auth/register',
  asyncHandler(async (req, res) => {
    if (!authReady) return res.status(503).json({ error: 'auth not configured' })
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })
    if (password.length < 6) return res.status(400).json({ error: 'password must be at least 6 characters' })
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) return res.status(409).json({ error: 'email already registered' })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ email, passwordHash })
    const token = signToken(user)
    res.status(201).json({ token, user: { email: user.email } })
  })
)

app.post(
  '/api/auth/login',
  asyncHandler(async (req, res) => {
    if (!authReady) return res.status(503).json({ error: 'auth not configured' })
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.status(401).json({ error: 'invalid credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'invalid credentials' })
    const token = signToken(user)
    res.json({ token, user: { email: user.email } })
  })
)

app.get('/api/auth/me', requireAuth, asyncHandler(async (req, res) => {
  res.json({ user: { email: req.user.email } })
}))

app.use((err, req, res, next) => {
  console.error('[error]', err.message)
  res.status(500).json({ error: 'internal server error' })
})

async function start() {
  authReady = Boolean(JWT_SECRET)
  if (!authReady) {
    console.warn('[start] JWT_SECRET not set — auth endpoints will return 503')
  }
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI)
      dbReady = true
      console.log('[db] connected')
    } catch (err) {
      dbReady = false
      console.error('[db] connection failed:', err.message)
    }
  } else {
    console.warn('[start] MONGODB_URI not set — auth endpoints will return 503')
  }
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()
