import { createContext, useEffect, useState } from 'react'
import Navbar         from '../components/Navbar'
import HamburgerMenu  from '../components/HamburgerMenu'
import TravelForm     from '../components/TravelForm'
import ModePanels     from '../components/ModePanels'
import './Home.css'
import { useNavigate } from 'react-router-dom'
import { getItinerariesByUser } from '../services/databaseApi'

export const TravelContext = createContext({location: "", date: "", night: 0, people: 0});

export default function Home({ user, login, logout }) {
  const routerNavigate = useNavigate();
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [showPanels, setShowPanels] = useState(false)
  const [formData,   setFormData]   = useState(null)
  const [journeys, setJourneys] = useState([])

  useEffect(() => {
    if (!user?.user_id) {
      setJourneys([])
      return
    }

    let isActive = true

    const loadJourneys = async () => {
      try {
        const itineraries = await getItinerariesByUser(user.user_id)
        if (!isActive) return

        const mapped = itineraries.map((itinerary) => {
          const start = itinerary.departure_date
          const end = itinerary.return_date
          const startDate = start ?? new Date().toISOString().slice(0, 10)

          let nights = 1
          if (start && end) {
            const startMs = new Date(`${start}T00:00:00`).getTime()
            const endMs = new Date(`${end}T00:00:00`).getTime()
            const diffDays = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24))
            nights = Math.max(1, diffDays)
          }

          return {
            id: itinerary.itinerary_id,
            location: itinerary.destination,
            startDate,
            nights,
            people: itinerary.group_size ?? 1,
          }
        })

        setJourneys(mapped)
      } catch (error) {
        console.error('Failed to load journeys from database:', error)
        if (isActive) setJourneys([])
      }
    }

    loadJourneys()

    return () => {
      isActive = false
    }
  }, [user])

  const handleFormComplete = (data) => {
    // log the data
    setFormData(data)
    setShowPanels(true)
    // Scroll to panels
    setTimeout(() => {
      document.getElementById('mode-panels-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 100)
  }

  const handleFormChange = () => {
    // If form changes after panels appear, hide panels
    // TODO: fix this because it doesnt work
    if (showPanels) setShowPanels(false)
  }

  const handleModeSelect = (mode) => {
    if (mode === 'manual') {
      routerNavigate('journey/accommodation', {state: {...formData, tripId: Date.now()}})
      return
    }

    routerNavigate('journey/auto', { state: { ...formData, tripId: Date.now() } })
  }

  const handleJourneyClick = (journey) => {
    // Open the final review state so saved transport selections are shown immediately.
    routerNavigate('journey/review', {
      state: {
        itinerary_id: journey.id,
        location: journey.location,
        date: new Date(journey.startDate),
        nights: journey.nights,
        people: journey.people,
        reviewMode: 'final',
      },
    })
  }

  const handleNavigate = (target) => {
    if (target === 'register') {
      routerNavigate('/register')
      return
    }
    routerNavigate('/')
  }

  return (
    <div className="home-page">
      <Navbar
        user={user}
        onLogin={login}
        onLogout={logout}
        onMenuClick={() => setMenuOpen(true)}
        onNavigate={handleNavigate}
      />

      <HamburgerMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        journeys={journeys}
        onJourneyClick={handleJourneyClick}
      />

      <main className="home-main">
        {/* Hero title */}
        <div className="home-hero">
          <h1 className="hero-logo">CMJ</h1>
          <p className="hero-tagline">Create My Journey</p>
        </div>

        {/* Travel planning form */}
        <section className="form-section">
          <TravelForm
            onComplete={handleFormComplete}
            onChange={handleFormChange}
          />
        </section>

        {/* Mode panels – slide up after form filled */}
        {showPanels && (
          <section className="panels-section" id="mode-panels-anchor">
            <ModePanels onSelect={handleModeSelect} />
          </section>
        )}
      </main>

      <footer className="home-footer">
        <span>© 2026 Create My Journey</span>
      </footer>
    </div>
  )
}
