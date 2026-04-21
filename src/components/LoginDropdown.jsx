import { useState } from 'react'

// ── Mock users (replace with real API later) ──
const MOCK_USERS = [
  { email: 'user@example.com', password: 'password', username: 'user' },
  { email: 'test@test.com',    password: 'test',     username: 'test' },
]

export default function LoginDropdown({ onLogin, onNavigateRegister }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = () => {
    setError('')
    if (!email || !password) { setError('Please fill in all fields.'); return }

    setLoading(true)
    setTimeout(() => {                      // simulate async
      const found = MOCK_USERS.find(u => u.email === email && u.password === password)
      if (!found) {
        setError('Invalid email or password.')
        setLoading(false)
        return
      }
      onLogin({ email: found.email, username: found.username })
      setLoading(false)
    }, 400)
  }

  return (
    <div className="login-dropdown">
      {error && <p className="error-text" style={{ marginBottom: 0 }}>{error}</p>}

      <div className="input-wrapper">
        <input
          className="form-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          autoFocus
        />
      </div>

      <div className="input-wrapper">
        <input
          className="form-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
      </div>

      <button className="btn btn-primary btn-full" onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in…' : 'Login'}
      </button>

      <p className="register-link">
        Don't have an account?{' '}
        <span onClick={onNavigateRegister}>Register here!</span>
      </p>
    </div>
  )
}
