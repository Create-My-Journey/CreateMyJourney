/**
 * placesApi.js
 * All Google Maps Places API calls go through /api/places
 * so the key is never exposed in the frontend bundle.
 *
 * The proxy is defined in vite.config.js and forwarded to
 * the lightweight Express server in server/placesProxy.js
 */

const BASE = '/api/places'

/**
 * Search for places of a given type near a location string.
 * @param {string} location  - e.g. "Paris, France"
 * @param {'tourist_attraction'|'lodging'|'restaurant'} type
 * @param {number} limit     - max results to return (default 12)
 */
export async function searchPlaces(location, type, limit = 12) {
  const params = new URLSearchParams({ location, type, limit })
  const res = await fetch(`${BASE}/search?${params}`)
  if (!res.ok) throw new Error(`Places search failed: ${res.status}`)
  return res.json() // returns { results: Place[] }
}

/**
 * Fetch the best available photo URL for a place.
 * @param {string} photoReference - from place.photos[0].photo_reference
 * @param {number} maxWidth
 */
export function getPhotoUrl(photoReference, maxWidth = 440) {
  if (!photoReference) return null
  return `${BASE}/photo?ref=${encodeURIComponent(photoReference)}&maxWidth=${maxWidth}`
}

/**
 * Normalise a raw Google Place into the shape our cards expect.
 * Works for attractions, accommodations, and restaurants.
 */
export function normalisePlaceToCard(place, idOffset = 0) {
  const photoRef = place.photos?.[0]?.photo_reference ?? null

  return {
    // use place_id as the stable ID; numeric offset keeps legacy compat
    id: place.place_id,
    name: place.name,
    rating: place.rating ?? null,
    // address doubles as the "location" field used in AccommodationCard
    location: place.vicinity ?? place.formatted_address ?? '',
    image: photoRef ? getPhotoUrl(photoRef) : null,
    // populated differently per page — set by each normaliser below
    category: null,
    type: null,
    hours: null,
    price: null,
    pricePerNight: null,
    description: null,
    tags: [],
    amenities: [],
  }
}

/** Attraction-specific normaliser */
export function normaliseAttraction(place) {
  const base = normalisePlaceToCard(place)
  return {
    ...base,
    category: place.types?.[0]?.replace(/_/g, ' ') ?? 'Attraction',
    hours: place.opening_hours?.weekday_text?.[0] ?? 'See Google Maps for hours',
    price: place.price_level != null ? '$'.repeat(place.price_level) || 'Free' : 'See website',
    tags: (place.types ?? [])
      .slice(0, 4)
      .map(t => t.replace(/_/g, ' '))
      .map(t => t.charAt(0).toUpperCase() + t.slice(1)),
    description: `${place.name} is a popular destination in the area with a rating of ${place.rating ?? 'N/A'} / 5. Located at ${place.vicinity ?? 'the destination'}. Check Google Maps for up-to-date hours and visitor tips.`,
  }
}

/** Accommodation-specific normaliser */
export function normaliseAccommodation(place) {
  const base = normalisePlaceToCard(place)
  const priceSymbols = place.price_level != null ? '$'.repeat(place.price_level) : null
  return {
    ...base,
    type: place.types?.includes('lodging') ? 'Hotel' : 'Accommodation',
    pricePerNight: priceSymbols ? `${priceSymbols}/night` : 'See website',
    amenities: (place.types ?? [])
      .filter(t => !['lodging', 'point_of_interest', 'establishment'].includes(t))
      .slice(0, 5)
      .map(t => t.replace(/_/g, ' '))
      .map(t => t.charAt(0).toUpperCase() + t.slice(1)),
    description: `${place.name} is rated ${place.rating ?? 'N/A'} / 5 by guests. Located at ${place.vicinity ?? 'the destination'}. Visit the hotel website or Google Maps for current rates and availability.`,
  }
}

/** Restaurant-specific normaliser */
export function normaliseRestaurant(place) {
  const base = normalisePlaceToCard(place)
  const priceSymbols = place.price_level != null ? '$'.repeat(place.price_level) || 'Free' : 'See website'
  return {
    ...base,
    category: 'Restaurant',
    hours: place.opening_hours?.weekday_text?.[0] ?? 'See Google Maps for hours',
    price: priceSymbols,
    tags: (place.types ?? [])
      .filter(t => !['food', 'point_of_interest', 'establishment'].includes(t))
      .slice(0, 4)
      .map(t => t.replace(/_/g, ' '))
      .map(t => t.charAt(0).toUpperCase() + t.slice(1)),
    description: `${place.name} is a well-regarded dining spot rated ${place.rating ?? 'N/A'} / 5. Found at ${place.vicinity ?? 'the destination'}. Check Google Maps for the full menu and current hours.`,
  }
}
