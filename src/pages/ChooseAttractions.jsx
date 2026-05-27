import { useState, useMemo } from 'react'
import HamburgerMenu from '../components/HamburgerMenu'
import AttractionCard from '../components/AttractionCard'
import { usePlacesSearch } from '../hooks/usePlacesSearch'
import './ChooseAttractions.css'
import { useNavigate, useOutletContext } from 'react-router-dom'

// ── Sort options ──
const SORT_OPTIONS = [
  { key: 'rating_desc',  label: '★ Rating: High to Low' },
  { key: 'rating_asc',   label: '★ Rating: Low to High' },
  { key: 'price_asc',    label: '$ Price: Low to High' },
  { key: 'price_desc',   label: '$ Price: High to Low' },
  { key: 'name_asc',     label: 'A–Z Name' },
]

// ── Min rating options ──
const RATING_OPTIONS = [
  { key: 'any', label: 'Any' },
  { key: '3',   label: '3+' },
  { key: '4',   label: '4+' },
  { key: '4.5', label: '4.5+' },
]

export default function ChooseAttractions() {
  const [menuOpen, setMenuOpen] = useState(false)
  const routerNavigate = useNavigate()
  const [tripDetails, setTripDetails] = useOutletContext()

  const [selected, setSelected] = useState(
    () => tripDetails.attractions == null
      ? new Set()
      : tripDetails.attractions.reduce((acc, el) => acc.add(el.id), new Set())
  )

  // ── Filter & sort state ──
  const [sortKey,      setSortKey]      = useState('rating_desc')
  const [ratingFilter, setRatingFilter] = useState('any')

  // ── Real data from Google Places ──
  const { places: rawPlaces, loading, error } = usePlacesSearch(tripDetails.location, 'tourist_attraction', 20)

  // ── Apply filters + sort ──
  const places = useMemo(() => {
    let list = [...rawPlaces]

    // Rating filter
    if (ratingFilter !== 'any') {
      const minRating = parseFloat(ratingFilter)
      list = list.filter(p => p.rating != null && p.rating >= minRating)
    }

    // Sort
    list.sort((a, b) => {
      switch (sortKey) {
        case 'rating_desc': return (b.rating ?? 0) - (a.rating ?? 0)
        case 'rating_asc':  return (a.rating ?? 0) - (b.rating ?? 0)
        case 'price_asc':   return (a.price?.length ?? 0) - (b.price?.length ?? 0)
        case 'price_desc':  return (b.price?.length ?? 0) - (a.price?.length ?? 0)
        case 'name_asc':    return a.name.localeCompare(b.name)
        default:            return 0
      }
    })

    return list
  }, [rawPlaces, sortKey, ratingFilter])

  const activeFilterCount = [
    ratingFilter !== 'any',
  ].filter(Boolean).length

  const resetFilters = () => {
    setSortKey('rating_desc')
    setRatingFilter('any')
  }

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
    const chosenAttractions = rawPlaces.filter(a => selected.has(a.id))
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

      <main className="page-shell">
        {/* ── Left: list ── */}
        <section className="page-shell-left">
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
          {!loading && !error && (
            <p className="result-count">{places.length} attraction{places.length !== 1 ? 's' : ''} found</p>
          )}
          <div className="page-shell-list">
            {places.map(attraction => (
              <AttractionCard
                key={attraction.id}
                attraction={attraction}
                selected={selected.has(attraction.id)}
                onToggleSelect={toggleSelect}
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

            {/* Sort */}
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

            {/* Min rating filter */}
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

            {activeFilterCount > 0 && (
              <button className="filter-reset" onClick={resetFilters}>
                ✕ Reset filters
              </button>
            )}
          </div>
        </aside>
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
