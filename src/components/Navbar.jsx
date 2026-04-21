import { useState, useRef, useEffect } from 'react'
import LoginDropdown from './LoginDropdown'
import './Navbar.css'

export default function Navbar({ user, onLogin, onLogout, onMenuClick, onNavigate }) {
  const [showLogin, setShowLogin] = useState(false)
  const loginRef   = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (loginRef.current && !loginRef.current.contains(e.target)) {
        setShowLogin(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogin = (userData) => {
    onLogin(userData)
    setShowLogin(false)
  }

  return (
    <nav className="navbar">
      {/* Hamburger */}
      <button
        className="hamburger-btn"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <span /><span /><span />
      </button>

      {/* Logo */}
      <div className="navbar-logo" onClick={() => onNavigate('home')} title="Home">
        CMJ
      </div>

      {/* Right: Login / User badge */}
      <div className="navbar-right" ref={loginRef}>
        {user ? (
          <button className="user-badge" onClick={onLogout} title="Click to logout">
            {user.email.split('@')[0]}
          </button>
        ) : (
          <>
            <button
              className={`btn btn-primary ${showLogin ? 'btn-active' : ''}`}
              onClick={() => setShowLogin(v => !v)}
            >
              Login
            </button>
            {showLogin && (
              <LoginDropdown
                onLogin={handleLogin}
                onNavigateRegister={() => { onNavigate('register'); setShowLogin(false) }}
              />
            )}
          </>
        )}
      </div>
    </nav>
  )
}
