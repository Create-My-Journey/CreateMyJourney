import { useState } from 'react'
import Home from './pages/Home'

export default function App() {
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

  const props = { user, login, logout}
  return <Home {...props} />
}
