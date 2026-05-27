import { useState, useMemo } from 'react'
import AttractionCard from '../components/AttractionCard'
import { usePlacesSearch } from '../hooks/usePlacesSearch'
import { buildDayActivityPlan } from '../services/itinerarySplit'
import './Restaurants.css'
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
  { key: '3.5', label: '3.5+' },
  { key: '4',   label: '4+' },
  { key: '4.5', label: '4.5+' },
]

export default function Restaurants() {
  const routerNavigate = useNavigate()
  const [tripDetails, setTripDetails] = useOutletContext()

  const [selected, setSelected] = useState(
    () => tripDetails.restaurants == null
      ? new Set()
      : tripDetails.restaurants.reduce((acc, el) => acc.add(el.id), new Set())
  )

  const [sortKey,       setSortKey]       = useState('rating_desc')
  const [ratingFilter,  setRatingFilter]  = useState('any')

  const { places: rawPlaces, loading, error } = usePlacesSearch(tripDetails.location, 'restaurant', 20)

  const places = useMemo(() => {
    let list = [...rawPlaces]

    if (ratingFilter !== 'any') {
      const min = parseFloat(ratingFilter)
      list = list.filter(p => p.rating != null && p.rating >= min)
    }

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

  const handleSkip = () => {
    const dayActivityPlan = buildDayActivityPlan({
      attractions: tripDetails.attractions || [],
      restaurants: [],
      nights: tripDetails.nights,
    })
    setTripDetails(prev => ({ ...prev, restaurants: [], dayActivityPlan }))
    routerNavigate('/journey/review')
  }

  const handleConfirm = () => {
    const chosenRestaurants = rawPlaces.filter(r => selected.has(r.id))
    const dayActivityPlan = buildDayActivityPlan({
      attractions: tripDetails.attractions || [],
      restaurants: chosenRestaurants,
      nights: tripDetails.nights,
    })
    setTripDetails(prev => ({ ...prev, restaurants: chosenRestaurants, dayActivityPlan }))
    routerNavigate('/journey/review')
  }

  return (
    <div className="restaurants-page">
      <div className="restaurants-header">
        <span className="restaurants-eyebrow">
          {tripDetails.location} · {tripDetails.nights} nights · {tripDetails.people}{' '}
          {tripDetails.people === 1 ? 'person' : 'people'}
        </span>
        <div className="restaurants-title-row">
          <h1 className="restaurants-title">Choose Restaurants</h1>
          <div className="restaurants-counter">
            <span className="restaurants-counter-num">{selected.size}</span>
            <span className="restaurants-counter-label">Selected</span>
          </div>
        </div>
        <p className="restaurants-subtitle">
          Pick the restaurants you'd like to dine at — we'll weave them into your itinerary.
        </p>
      </div>

      <main className="page-shell" aria-label="Restaurant planner">
        {/* ── Left: list ── */}
        <section className="page-shell-left">
          {loading && (
            <div className="places-status">
              <div className="places-spinner" />
              <p>Finding restaurants in {tripDetails.location}…</p>
            </div>
          )}
          {error && (
            <div className="places-error">
              <p>⚠️ Couldn't load restaurants: {error}</p>
              <p className="places-error-sub">Check that the proxy server is running and your API key is set.</p>
            </div>
          )}
          {!loading && !error && (
            <p className="result-count">{places.length} restaurant{places.length !== 1 ? 's' : ''} found</p>
          )}
          <div className="page-shell-list">
            {places.map(restaurant => (
              <AttractionCard
                key={restaurant.id}
                attraction={restaurant}
                selected={selected.has(restaurant.id)}
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

            {activeFilterCount > 0 && (
              <button className="filter-reset" onClick={resetFilters}>
                ✕ Reset filters
              </button>
            )}
          </div>
        </aside>
      </main>

      <div className="restaurants-footer">
        <button className="btn btn-ghost" onClick={handleSkip}>
          Skip Restaurants
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
