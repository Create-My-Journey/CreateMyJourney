import { useState } from 'react'
import Home from './pages/Home'
import Register from './pages/Register'
import Transport from './pages/Transport'
import ChooseAccommodation from './pages/ChooseAccommodation'
import Restaurants from './pages/Restaurants'
import ChooseAttractions from './pages/ChooseAttractions'
import Review from './pages/Review'

export default function App() {
  const [page, setPage] = useState('home')
  const [navigationData, setNavigationData] = useState({});

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

  const navigate = (to, data = {}) => {
    setPage(to)
    setNavigationData(data)
    window.scrollTo(0, 0)
  }

  const props = { navigate, user, login, logout, ...navigationData }

  if (page === 'register') return <Register {...props} />
  if (page === 'transport') return <Transport {...props} />
  if (page === 'accommodation') return <ChooseAccommodation {...props} />
  if (page === 'restaurants') return <Restaurants {...props} />
  if (page === 'attractions') return <ChooseAttractions {...props} />
  if (page === 'review') return <Review {...props} />
  return <Home {...props} />
}
