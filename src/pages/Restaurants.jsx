import { useState } from 'react'
import AttractionCard from '../components/AttractionCard'
import { usePlacesSearch } from '../hooks/usePlacesSearch'
import './Restaurants.css'
import { useNavigate, useOutletContext } from 'react-router-dom'

export default function Restaurants() {
  const [sortBy, setSortBy]               = useState('Reviews')
  const [minBudget, setMinBudget]         = useState('')
  const [maxBudget, setMaxBudget]         = useState('')
  const [minReviewScore, setMinReviewScore] = useState('')

  const routerNavigate = useNavigate()
  const [tripDetails, setTripDetails] = useOutletContext()

  const [selected, setSelected] = useState(
    () => tripDetails.restaurants == null
      ? new Set()
      : tripDetails.restaurants.reduce((acc, el) => acc.add(el.id), new Set())
  )

  // ── Real data from Google Places ──
  const { places: allPlaces, loading, error } = usePlacesSearch(tripDetails.location, 'restaurant', 15)

  // ── Client-side sort & filter ──
  const places = [...allPlaces]
    .filter(r => {
      if (minReviewScore && r.rating != null && r.rating < parseFloat(minReviewScore)) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'Rating') return (b.rating ?? 0) - (a.rating ?? 0)
      // default: Reviews (by rating desc, same as above for now)
      return (b.rating ?? 0) - (a.rating ?? 0)
    })

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSkip = () => {
    routerNavigate('/journey/transport')
  }

  const handleConfirm = () => {
    const chosenRestaurants = places.filter(r => selected.has(r.id))
    setTripDetails(prev => ({ ...prev, restaurants: chosenRestaurants }))
    routerNavigate('/journey/transport')
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

      <main className="restaurants-shell" aria-label="Restaurant planner">
        <section className="restaurants-left">
          <div className="restaurants-list" aria-label="Restaurant options">

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

            {!loading && !error && places.length === 0 && (
              <div className="places-status">
                <p>No restaurants found for "{tripDetails.location}".</p>
              </div>
            )}

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

        <aside className="restaurants-right" aria-label="Restaurant filters">
          <div className="restaurants-toolbar">
            <div className="tool-col">
              <div className="tool-head">
                <h3>Sort By</h3>
                <span className="tool-icon" aria-hidden="true">↗</span>
              </div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="Reviews">Reviews</option>
                <option value="Rating">Rating</option>
              </select>
            </div>

            <div className="tool-col">
              <div className="tool-head">
                <h3>Filter By</h3>
                <span className="tool-icon" aria-hidden="true">⏃</span>
              </div>

              <div className="filter-block">
                <div className="line-row">
                  <span>Review Score</span>
                  <span>0–5</span>
                </div>
                <input
                  type="range" min="0" max="5" step="0.5"
                  value={minReviewScore || 0}
                  onChange={e => setMinReviewScore(e.target.value)}
                />
              </div>

              <div className="value-col value-col-single">
                <label htmlFor="min-review-score">Min. Review Score</label>
                <input
                  id="min-review-score"
                  type="text"
                  placeholder="e.g. 4.0"
                  value={minReviewScore}
                  onChange={(e) => setMinReviewScore(e.target.value)}
                />
              </div>
            </div>
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
