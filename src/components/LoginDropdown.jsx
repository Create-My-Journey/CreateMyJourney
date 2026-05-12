import { useState } from 'react'
import { getUserByEmail } from '../services/databaseApi'
import { verifyPassword } from '../services/passwordAuth'

export default function LoginDropdown({ onLogin, onNavigateRegister }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async () => {
    setError('')
    if (!email || !password) { setError('Please fill in all fields.'); return }

    setLoading(true)
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const found = await getUserByEmail(normalizedEmail)
      const isValid = found ? await verifyPassword(password, found.password_hash) : false

      if (!isValid) {
        setError('Invalid email or password.')
        return
      }

      onLogin({
        user_id: found.user_id,
        email: found.email,
        username: found.email.split('@')[0],
      })
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
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
