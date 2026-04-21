import { useState } from 'react'
import Home from './pages/Home'
import Register from './pages/Register'
import Transport from './pages/Transport'

export default function App() {
  const [page, setPage] = useState('home')

  // user = null | { email, username }
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cmj_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('cmj_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('cmj_user')
  }

  const navigate = (to) => {
    setPage(to)
    window.scrollTo(0, 0)
  }

  const props = { navigate, user, login, logout }

  if (page === 'register') return <Register {...props} />
  if (page === 'transport') return <Transport {...props} />
  return <Home {...props} />
}
