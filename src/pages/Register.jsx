import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUser } from '../services/databaseApi'
import { hashPassword } from '../services/passwordAuth'
import './Register.css'

export default function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [errors,   setErrors]   = useState({})
  const [apiError, setApiError] = useState('')
  const [success,  setSuccess]  = useState('')
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

  const handleRegister = async () => {
    setApiError('')
    setSuccess('')

    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    setLoading(true)
    try {
      const createdUser = await createUser({
        email: email.trim().toLowerCase(),
        password_hash: await hashPassword(password),
      })

      if (!createdUser?.user_id) {
        throw new Error('Could not create account.')
      }

      localStorage.setItem(
        'cmj_user',
        JSON.stringify({
          user_id: createdUser.user_id,
          email: createdUser.email,
          username: username.trim(),
        }),
      )

      setSuccess('Account created successfully. Redirecting...')
      setTimeout(() => {
        navigate('/')
      }, 500)
    } catch (error) {
      if (String(error?.message ?? '').includes('409')) {
        setApiError('An account with this email already exists.')
      } else {
        setApiError('Unable to create account right now. Please try again.')
      }
    } finally {
      setLoading(false)
    }
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
        <div className="register-logo" onClick={() => navigate('/')} title="Back to home">
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

          {apiError && <p className="error-text">{apiError}</p>}
          {success && <p className="helper-text">{success}</p>}

          <p className="register-link">
            Already have an account?{' '}
            <span onClick={() => navigate('/')}>Login here</span>
          </p>
        </div>
      </div>
    </div>
  )
}
