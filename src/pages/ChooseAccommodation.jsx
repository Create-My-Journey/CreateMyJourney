import { useState } from 'react'
import HamburgerMenu from '../components/HamburgerMenu'
import AccommodationCard from '../components/AccommodationCard'
import { usePlacesSearch } from '../hooks/usePlacesSearch'
import './ChooseAccommodation.css'
import { useNavigate, useOutletContext } from 'react-router-dom'

export default function ChooseAccommodation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const routerNavigate = useNavigate()
  const [tripDetails, setTripDetails] = useOutletContext()

  const [selected, setSelected] = useState(
    () => tripDetails.accommodation == null ? null : tripDetails.accommodation[0]?.id ?? null
  )

  // ── Real data from Google Places ──
  const { places, loading, error } = usePlacesSearch(tripDetails.location, 'lodging', 10)

  const handleSelect = (id) => {
    setSelected(prev => prev === id ? null : id)
  }

  const handleConfirm = () => {
    if (!selected) {
      alert('Please select an accommodation, or use "Skip".')
      return
    }
    const chosenAccommodation = places.find(a => a.id === selected)

    // Normalise into the shape the rest of the app (Review page) expects
    const accommodationCardItem = {
      id: chosenAccommodation.id,
      name: chosenAccommodation.name,
      category: chosenAccommodation.type ?? 'Hotel',
      hours: chosenAccommodation.location,
      price: chosenAccommodation.pricePerNight ?? 'See website',
      rating: chosenAccommodation.rating,
      tags: chosenAccommodation.amenities ?? [],
      description: chosenAccommodation.description,
      image: chosenAccommodation.image,
    }

    setTripDetails(prev => ({ ...prev, accommodation: [accommodationCardItem] }))
    routerNavigate('/journey/attractions')
  }

  const handleSkip = () => {
    routerNavigate('/journey/attractions')
  }

  return (
    <div className="ch-page">
      <HamburgerMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        journeys={[]}
        onJourneyClick={() => {}}
      />

      <div className="ch-header">
        <span className="ch-eyebrow">
          {tripDetails.location} · {tripDetails.nights} nights · {tripDetails.people}{' '}
          {tripDetails.people === 1 ? 'person' : 'people'}
        </span>
        <div className="ch-title-row">
          <h1 className="ch-title">Choose Accommodation</h1>
          <div className="ch-indicator">
            <span className="ch-indicator-icon">{selected ? '✓' : '—'}</span>
            <span className="ch-indicator-label">{selected ? 'Selected' : 'None'}</span>
          </div>
        </div>
        <p className="ch-subtitle">
          Pick where you'll be staying — only one can be chosen.
        </p>
      </div>

      <main className="ch-main">
        {loading && (
          <div className="places-status">
            <div className="places-spinner" />
            <p>Finding accommodation in {tripDetails.location}…</p>
          </div>
        )}

        {error && (
          <div className="places-error">
            <p>⚠️ Couldn't load accommodation: {error}</p>
            <p className="places-error-sub">Check that the proxy server is running and your API key is set.</p>
          </div>
        )}

        {!loading && !error && places.length === 0 && (
          <div className="places-status">
            <p>No accommodation found for "{tripDetails.location}".</p>
          </div>
        )}

        {places.map(accommodation => (
          <AccommodationCard
            key={accommodation.id}
            accommodation={{ ...accommodation, nights: tripDetails.nights }}
            selected={selected === accommodation.id}
            onSelect={handleSelect}
          />
        ))}
      </main>

      <div className="ch-footer">
        <button className="btn btn-ghost" onClick={handleSkip}>
          Skip
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
