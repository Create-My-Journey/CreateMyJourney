import { createContext, useState } from 'react'
import Navbar         from '../components/Navbar'
import HamburgerMenu  from '../components/HamburgerMenu'
import TravelForm     from '../components/TravelForm'
import ModePanels     from '../components/ModePanels'
import './Home.css'
import { useNavigate } from 'react-router-dom'

// ── Mock journeys (replace with real API / localStorage later) ──
const MOCK_JOURNEYS = [
  { id: 1, location: "Tokyo, Japan",   startDate: "2026-05-15", nights: 3, people: 2},
  { id: 2, location: 'Constanța, Romania',  startDate: '2026-04-02', nights: 3, people: 2 },
  { id: 3, location: 'Sinaia, Romania',      startDate: '2026-03-15', nights: 5, people: 4 },
  { id: 4, location: 'Paris, France',        startDate: '2026-02-10', nights: 7, people: 2 },
  { id: 5, location: 'Budapest, Hungary',    startDate: '2025-12-20', nights: 4, people: 2 },
  { id: 6, location: 'Brașov, Romania',      startDate: '2025-11-05', nights: 3, people: 3 },
  { id: 7, location: 'Vienna, Austria',      startDate: '2025-09-12', nights: 6, people: 2 },
  { id: 8, location: 'Rome, Italy',          startDate: '2025-07-20', nights: 8, people: 2 },
]

export const TravelContext = createContext({location: "", date: "", night: 0, people: 0});

export default function Home({ user, login, logout }) {
  const routerNavigate = useNavigate();
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [showPanels, setShowPanels] = useState(false)
  const [formData,   setFormData]   = useState(null)

  const journeys = user ? MOCK_JOURNEYS : []

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
    console.log("change")
    // If form changes after panels appear, hide panels
    // TODO: fix this because it doesnt work
    if (showPanels) setShowPanels(false)
  }

  const handleModeSelect = (mode) => {
    if (mode === 'manual') {
      routerNavigate('journey', {state: formData})
      return
    }

    // TODO: navigate to auto page with formData
    alert(`Navigating to "${mode.toUpperCase()}" mode\n\nTrip: ${formData.location}\nDate: ${formData.date.toLocaleDateString()}\nNights: ${formData.nights}  ·  People: ${formData.people}`)
  }

  const handleJourneyClick = (journey) => {
    // TODO: navigate to review page
    routerNavigate('journey/review')
  }

  return (
    <div className="home-page">
      <Navbar
        user={user}
        onLogin={login}
        onLogout={logout}
        onMenuClick={() => setMenuOpen(true)}
      />

      <HamburgerMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        journeys={MOCK_JOURNEYS}
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
