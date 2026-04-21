import { useState } from 'react'
import './Register.css'

export default function Register({ navigate, login }) {
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)

  const validate = () => {
    const e = {}
    if (!username.trim())               e.username = 'Username is required'
    else if (username.length < 3)       e.username = 'Username must be at least 3 characters'
    if (!email.trim())                  e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email  = 'Please enter a valid email'
    if (!password)                      e.password = 'Password is required'
    else if (password.length < 6)       e.password = 'Password must be at least 6 characters'
    return e
  }

  const handleRegister = () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    setLoading(true)
    setTimeout(() => {
      login({ email, username })
      navigate('home')
    }, 500)
  }

  const setField = (field, val) => {
    if (field === 'username') setUsername(val)
    if (field === 'email')    setEmail(val)
    if (field === 'password') setPassword(val)
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  return (
    <div className="register-page">
      <div className="register-card">
        {/* Logo */}
        <div className="register-logo" onClick={() => navigate('home')} title="Back to home">
          CMJ
        </div>

        <h2 className="register-title">Create Account</h2>
        <p className="register-subtitle">Start planning your perfect journey</p>

        <div className="register-form">
          {/* Username */}
          <div className="reg-field">
            <div className={`input-wrapper ${errors.username ? 'has-error' : ''}`}>
              <input
                className="form-input"
                placeholder="Username"
                value={username}
                onChange={e => setField('username', e.target.value)}
                autoFocus
              />
            </div>
            {errors.username && <p className="error-text">{errors.username}</p>}
          </div>

          {/* Email */}
          <div className="reg-field">
            <div className={`input-wrapper ${errors.email ? 'has-error' : ''}`}>
              <input
                className="form-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setField('email', e.target.value)}
              />
            </div>
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="reg-field">
            <div className={`input-wrapper ${errors.password ? 'has-error' : ''}`}>
              <input
                className="form-input"
                type="password"
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={e => setField('password', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
              />
            </div>
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Register'}
          </button>

          <p className="register-link">
            Already have an account?{' '}
            <span onClick={() => navigate('home')}>Login here</span>
          </p>
        </div>
      </div>
    </div>
  )
}
