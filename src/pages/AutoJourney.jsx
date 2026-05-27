import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { usePlacesSearch } from '../hooks/usePlacesSearch'
import { buildDayActivityPlan } from '../services/itinerarySplit'
import './AutoJourney.css'

const pickTopRated = (items, count) => {
  if (!Number.isFinite(count) || count <= 0) return []
  const sorted = [...items].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
  return sorted.slice(0, count)
}

const toAccommodationCardItem = (place, nights) => ({
  id: place.id,
  name: place.name,
  category: place.type ?? 'Hotel',
  hours: place.location,
  price: place.pricePerNight ?? 'See website',
  rating: place.rating,
  tags: place.amenities ?? [],
  description: place.description,
  image: place.image,
  nights,
})

function StatusRow({ label, loading, error, count }) {
  let detail = 'Ready'
  if (loading) detail = 'Searching...'
  if (error) detail = 'Failed to load'
  if (!loading && !error) detail = `${count} found`

  return (
    <div className="auto-status-row">
      <span className="auto-status-label">{label}</span>
      <span className="auto-status-detail">{detail}</span>
    </div>
  )
}

export default function AutoJourney() {
  const routerNavigate = useNavigate()
  const [tripDetails, setTripDetails] = useOutletContext()
  const [hasBuilt, setHasBuilt] = useState(false)
  const [hasRequested, setHasRequested] = useState(false)

  const nights = Math.max(1, Number(tripDetails.nights) || 1)
  const attractionLimit = Math.max(2 * nights, 12)
  const restaurantLimit = Math.max(2 * nights, 12)

  const {
    places: accommodationPlaces,
    loading: loadingAccommodation,
    error: accommodationError,
  } = usePlacesSearch(tripDetails.location, 'lodging', 10)

  const {
    places: attractionPlaces,
    loading: loadingAttractions,
    error: attractionsError,
  } = usePlacesSearch(tripDetails.location, 'tourist_attraction', attractionLimit)

  const {
    places: restaurantPlaces,
    loading: loadingRestaurants,
    error: restaurantError,
  } = usePlacesSearch(tripDetails.location, 'restaurant', restaurantLimit)

  const hasError = Boolean(accommodationError || attractionsError || restaurantError)
  const isLoading = loadingAccommodation || loadingAttractions || loadingRestaurants

  useEffect(() => {
    if (!tripDetails.location) return
    setHasRequested(true)
  }, [tripDetails.location])

  useEffect(() => {
    if (hasBuilt) return
    if (!tripDetails.location) return
    if (!hasRequested) return
    if (hasError || isLoading) return

    const accommodationPick = pickTopRated(accommodationPlaces, 1).map((place) =>
      toAccommodationCardItem(place, nights),
    )
    const selectedAttractions = pickTopRated(attractionPlaces, 2 * nights)
    const selectedRestaurants = pickTopRated(restaurantPlaces, 2 * nights)

    const dayActivityPlan = buildDayActivityPlan({
      attractions: selectedAttractions,
      restaurants: selectedRestaurants,
      nights,
    })

    setTripDetails((prev) => ({
      ...prev,
      accommodation: accommodationPick,
      attractions: selectedAttractions,
      restaurants: selectedRestaurants,
      dayActivityPlan,
    }))

    setHasBuilt(true)
    routerNavigate('/journey/review')
  }, [
    hasBuilt,
    tripDetails.location,
    hasError,
    isLoading,
    accommodationPlaces,
    attractionPlaces,
    restaurantPlaces,
    nights,
    routerNavigate,
    setTripDetails,
  ])

  if (!tripDetails.location) {
    return (
      <main className="auto-journey">
        <h1>Auto Planner</h1>
        <p className="auto-journey-sub">We need a destination to build your trip.</p>
        <button className="btn btn-primary" onClick={() => routerNavigate('/')}>Return Home</button>
      </main>
    )
  }

  return (
    <main className="auto-journey">
      <h1>Building your itinerary</h1>
      <p className="auto-journey-sub">
        Picking the top-rated places and splitting them across {nights} night{nights === 1 ? '' : 's'}.
      </p>

      <div className="auto-status-grid" role="status" aria-live="polite">
        <StatusRow
          label="Accommodation"
          loading={loadingAccommodation}
          error={accommodationError}
          count={accommodationPlaces.length}
        />
        <StatusRow
          label="Attractions"
          loading={loadingAttractions}
          error={attractionsError}
          count={attractionPlaces.length}
        />
        <StatusRow
          label="Restaurants"
          loading={loadingRestaurants}
          error={restaurantError}
          count={restaurantPlaces.length}
        />
      </div>

      {hasError && (
        <div className="auto-error">
          <p>We could not fetch some places for this destination.</p>
          <button
            className="btn btn-primary"
            onClick={() => routerNavigate('/journey/accommodation')}
          >
            Switch to Manual
          </button>
        </div>
      )}

      {isLoading && (
        <div className="auto-loading">
          <div className="places-spinner" aria-hidden="true" />
          <span>Finding the best options...</span>
        </div>
      )}
    </main>
  )
}
