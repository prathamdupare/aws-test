import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function App() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setMode('login')
      return
    }
    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('unauthorized')
        return r.json()
      })
      .then((data) => {
        setEmail(data.user.email)
        setMode('home')
      })
      .catch(() => {
        localStorage.removeItem('token')
        setMode('login')
      })
  }, [])

  const submit = async (path) => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      localStorage.setItem('token', data.token)
      setEmail(data.user.email)
      setPassword('')
      setMode('home')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleRegister = (e) => {
    e.preventDefault()
    submit('/api/auth/register')
  }

  const handleLogin = (e) => {
    e.preventDefault()
    submit('/api/auth/login')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setEmail('')
    setPassword('')
    setError('')
    setMode('login')
  }

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <p>MongoDB auth demo</p>
          <p>API: <code>{API_URL}</code></p>
        </div>

        <div className="auth">
          {mode === 'home' ? (
            <div>
              <p>Signed in as <strong>{email}</strong></p>
              <div className="buttons">
                <button type="button" className="counter" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <form className="auth-form" onSubmit={mode === 'register' ? handleRegister : handleLogin}>
              <p className="auth-title">
                {mode === 'register' ? 'Create account' : 'Sign in'}
              </p>
              <input
                type="email"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <input
                type="password"
                placeholder="password (min 6)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
              <div className="buttons">
                <button type="submit" className="counter" disabled={busy}>
                  {busy ? '...' : (mode === 'register' ? 'Register' : 'Sign in')}
                </button>
                <button
                  type="button"
                  className="ping"
                  onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError('') }}
                >
                  {mode === 'register' ? 'Have an account? Sign in' : 'New here? Create account'}
                </button>
              </div>
              {error && <p className="error">{error}</p>}
            </form>
          )}
        </div>
      </section>
    </>
  )
}

export default App
