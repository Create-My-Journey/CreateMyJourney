import { useState } from 'react'
import HamburgerMenu from '../components/HamburgerMenu'
import AttractionCard from '../components/AttractionCard'
import { usePlacesSearch } from '../hooks/usePlacesSearch'
import './ChooseAttractions.css'
import { useNavigate, useOutletContext } from 'react-router-dom'

export default function ChooseAttractions() {
  const [menuOpen, setMenuOpen] = useState(false)
  const routerNavigate = useNavigate()
  const [tripDetails, setTripDetails] = useOutletContext()

  const [selected, setSelected] = useState(
    () => tripDetails.attractions == null
      ? new Set()
      : tripDetails.attractions.reduce((acc, el) => acc.add(el.id), new Set())
  )

  // ── Real data from Google Places ──
  const { places, loading, error } = usePlacesSearch(tripDetails.location, 'tourist_attraction', 12)

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleConfirm = () => {
    if (selected.size === 0) {
      alert('Please select at least one attraction, or use "Skip Attractions".')
      return
    }
    const chosenAttractions = places.filter(a => selected.has(a.id))
    setTripDetails(prev => ({ ...prev, attractions: chosenAttractions }))
    routerNavigate('/journey/restaurants')
  }

  const handleSkip = () => {
    routerNavigate('/journey/restaurants')
  }

  return (
    <div className="ca-page">
      <HamburgerMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        journeys={[]}
        onJourneyClick={() => {}}
      />

      <div className="ca-header">
        <span className="ca-eyebrow">
          {tripDetails.location} · {tripDetails.nights} nights · {tripDetails.people}{' '}
          {tripDetails.people === 1 ? 'person' : 'people'}
        </span>
        <div className="ca-title-row">
          <h1 className="ca-title">Choose Attractions</h1>
          <div className="ca-counter">
            <span className="ca-counter-num">{selected.size}</span>
            <span className="ca-counter-label">Selected</span>
          </div>
        </div>
        <p className="ca-subtitle">
          Select the places you'd like to visit — we'll build your itinerary around them.
        </p>
      </div>

      <main className="ca-main">
        {loading && (
          <div className="places-status">
            <div className="places-spinner" />
            <p>Finding attractions in {tripDetails.location}…</p>
          </div>
        )}

        {error && (
          <div className="places-error">
            <p>⚠️ Couldn't load attractions: {error}</p>
            <p className="places-error-sub">Check that the proxy server is running and your API key is set.</p>
          </div>
        )}

        {!loading && !error && places.length === 0 && (
          <div className="places-status">
            <p>No attractions found for "{tripDetails.location}".</p>
          </div>
        )}

        {places.map(attraction => (
          <AttractionCard
            key={attraction.id}
            attraction={attraction}
            selected={selected.has(attraction.id)}
            onToggleSelect={toggleSelect}
          />
        ))}
      </main>

      <div className="ca-footer">
        <button className="btn btn-ghost" onClick={handleSkip}>
          Skip Attractions
        </button>
        <button className="btn btn-primary" onClick={handleConfirm}>
          Confirm
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </button>
      </div>
    </div>
  )
}
