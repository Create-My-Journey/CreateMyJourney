import { useState, useMemo } from 'react'
import HamburgerMenu from '../components/HamburgerMenu'
import AccommodationCard from '../components/AccommodationCard'
import { usePlacesSearch } from '../hooks/usePlacesSearch'
import './ChooseAccommodation.css'
import { useNavigate, useOutletContext } from 'react-router-dom'

const SORT_OPTIONS = [
  { key: 'rating_desc', label: '★ Rating: High to Low' },
  { key: 'rating_asc',  label: '★ Rating: Low to High' },
  { key: 'price_asc',   label: '$ Price: Low to High' },
  { key: 'price_desc',  label: '$ Price: High to Low' },
  { key: 'name_asc',    label: 'A–Z Name' },
]

const RATING_OPTIONS = [
  { key: 'any', label: 'Any' },
  { key: '3',   label: '3+' },
  { key: '4',   label: '4+' },
  { key: '4.5', label: '4.5+' },
]

const TYPE_OPTIONS = [
  { key: 'any',    label: 'Any' },
  { key: 'Hotel',  label: 'Hotel' },
  { key: 'Hostel', label: 'Hostel' },
  { key: 'Resort', label: 'Resort' },
]

export default function ChooseAccommodation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const routerNavigate = useNavigate()
  const [tripDetails, setTripDetails] = useOutletContext()

  const [selected, setSelected] = useState(
    () => tripDetails.accommodation == null ? null : tripDetails.accommodation[0]?.id ?? null
  )

  const [sortKey,      setSortKey]      = useState('rating_desc')
  const [ratingFilter, setRatingFilter] = useState('any')
  const [typeFilter,   setTypeFilter]   = useState('any')

  const { places: rawPlaces, loading, error } = usePlacesSearch(tripDetails.location, 'lodging', 15)

  const places = useMemo(() => {
    let list = [...rawPlaces]

    if (ratingFilter !== 'any') {
      const min = parseFloat(ratingFilter)
      list = list.filter(p => p.rating != null && p.rating >= min)
    }

    if (typeFilter !== 'any') {
      list = list.filter(p =>
        p.name.toLowerCase().includes(typeFilter.toLowerCase()) ||
        p.type?.toLowerCase().includes(typeFilter.toLowerCase())
      )
    }

    list.sort((a, b) => {
      switch (sortKey) {
        case 'rating_desc': return (b.rating ?? 0) - (a.rating ?? 0)
        case 'rating_asc':  return (a.rating ?? 0) - (b.rating ?? 0)
        case 'price_asc':   return (a.pricePerNight?.length ?? 0) - (b.pricePerNight?.length ?? 0)
        case 'price_desc':  return (b.pricePerNight?.length ?? 0) - (a.pricePerNight?.length ?? 0)
        case 'name_asc':    return a.name.localeCompare(b.name)
        default:            return 0
      }
    })

    return list
  }, [rawPlaces, sortKey, ratingFilter, typeFilter])

  const activeFilterCount = [
    ratingFilter !== 'any',
    typeFilter !== 'any',
  ].filter(Boolean).length

  const resetFilters = () => {
    setSortKey('rating_desc')
    setRatingFilter('any')
    setTypeFilter('any')
  }

  const handleSelect = (id) => {
    setSelected(prev => prev === id ? null : id)
  }

  const handleConfirm = () => {
    if (!selected) {
      alert('Please select an accommodation, or use "Skip".')
      return
    }
    const chosenAccommodation = rawPlaces.find(a => a.id === selected)
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

      <main className="page-shell">
        {/* ── Left: list ── */}
        <section className="page-shell-left">
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
          {!loading && !error && (
            <p className="result-count">{places.length} option{places.length !== 1 ? 's' : ''} found</p>
          )}
          <div className="page-shell-list">
            {places.map(accommodation => (
              <AccommodationCard
                key={accommodation.id}
                accommodation={{ ...accommodation, nights: tripDetails.nights }}
                selected={selected === accommodation.id}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </section>

        {/* ── Right: filters ── */}
        <aside className="page-shell-right">
          <div className="filter-sidebar">
            <p className="filter-sidebar-title">
              Sort & Filter
              {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
            </p>

            <div className="filter-group">
              <p className="filter-group-label">Sort By</p>
              <div className="pill-group">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    className={`pill-btn ${sortKey === opt.key ? 'active' : ''}`}
                    onClick={() => setSortKey(opt.key)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <p className="filter-group-label">Min. Rating</p>
              <div className="pill-group">
                {RATING_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    className={`pill-btn ${ratingFilter === opt.key ? 'active' : ''}`}
                    onClick={() => setRatingFilter(opt.key)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <p className="filter-group-label">Type</p>
              <div className="pill-group">
                {TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    className={`pill-btn ${typeFilter === opt.key ? 'active' : ''}`}
                    onClick={() => setTypeFilter(opt.key)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button className="filter-reset" onClick={resetFilters}>
                ✕ Reset filters
              </button>
            )}
          </div>
        </aside>
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