/**
 * databaseApi.js
 * PostgREST access for users, itineraries, and itinerary child entities.
 */

const BASE = '/api/db'
const JSON_HEADERS = {
  'Content-Type': 'application/json',
}
const JSON_RETURN_HEADERS = {
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

async function requestJson(url, options = {}, errorPrefix = 'Request failed') {
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`${errorPrefix}: ${res.status}`)

  const text = await res.text()
  return text ? JSON.parse(text) : []
}

function toIsoDate(value) {
  if (!value) return null
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
  }
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
}

function normalizePriceText(value) {
  if (value == null) return null
  const str = String(value).trim()
  return str.length ? str : null
}

function extractNumberFromPrice(value) {
  if (value == null) return null
  const match = String(value).replace(',', '.').match(/\d+(?:\.\d+)?/)
  return match ? Number.parseFloat(match[0]) : null
}

function pickAddress(item) {
  return item.address ?? item.location ?? item.hours ?? null
}

function inferVehicleType(item) {
  const tags = Array.isArray(item.tags) ? item.tags.map((t) => String(t).toLowerCase()) : []
  if (tags.includes('flight')) return 'flight'
  if (tags.includes('train') || tags.includes('transit')) return 'transit'
  if (tags.includes('taxi')) return 'taxi'
  if (tags.includes('bus')) return 'bus'
  if (String(item.name ?? '').toLowerCase().includes('taxi')) return 'taxi'
  return 'transport'
}

function splitRoute(routeText) {
  if (!routeText) return { origin: null, destination: null }
  const parts = String(routeText).split('->').map((p) => p.trim()).filter(Boolean)
  if (parts.length >= 2) {
    return { origin: parts[0], destination: parts.slice(1).join(' -> ') }
  }
  return { origin: null, destination: String(routeText) }
}

function dayOrderNote(dayIndex, orderIndex, originalNote) {
  const prefix = `[day:${dayIndex + 1},order:${orderIndex + 1}]`
  const suffix = originalNote ? ` ${originalNote}` : ''
  return `${prefix}${suffix}`
}

function toAccommodationRow(itineraryId, item, dayIndex, orderIndex) {
  return {
    itinerary_id: itineraryId,
    place_id: item.id ?? null,
    name: item.name ?? 'Unnamed accommodation',
    address: pickAddress(item),
    property_type: item.type ?? item.category ?? null,
    star_rating: item.rating ?? null,
    price_range: normalizePriceText(item.pricePerNight ?? item.price),
    photo_url: item.image ?? null,
    notes: dayOrderNote(dayIndex, orderIndex, item.description ?? null),
  }
}

function toRestaurantRow(itineraryId, item, dayIndex, orderIndex) {
  return {
    itinerary_id: itineraryId,
    place_id: item.id ?? null,
    name: item.name ?? 'Unnamed restaurant',
    address: pickAddress(item),
    cuisine_type: item.type ?? item.category ?? null,
    price_level: normalizePriceText(item.price),
    rating: item.rating ?? null,
    photo_url: item.image ?? null,
    notes: dayOrderNote(dayIndex, orderIndex, item.description ?? null),
  }
}

function toAttractionRow(itineraryId, item, dayIndex, orderIndex) {
  return {
    itinerary_id: itineraryId,
    place_id: item.id ?? null,
    name: item.name ?? 'Unnamed attraction',
    address: pickAddress(item),
    category: item.category ?? item.type ?? null,
    suggested_duration_mins: item.suggested_duration_mins ?? null,
    rating: item.rating ?? null,
    photo_url: item.image ?? null,
    notes: dayOrderNote(dayIndex, orderIndex, item.description ?? null),
  }
}

function toTransportRow(itineraryId, item, dayIndex, orderIndex) {
  const route = splitRoute(item.hours)
  return {
    itinerary_id: itineraryId,
    origin_id: route.origin,
    destination_id: route.destination,
    vehicle_type: inferVehicleType(item),
    price: extractNumberFromPrice(item.price),
    booking_reference: item.option_id ?? item.id ?? null,
    notes: dayOrderNote(dayIndex, orderIndex, item.description ?? item.name ?? null),
  }
}

// -- Users --

export async function getUsers() {
  return requestJson(`${BASE}/users?order=user_id.asc`, {}, 'Failed to fetch users')
}

export async function createUser(user) {
  const data = await requestJson(
    `${BASE}/users`,
    {
      method: 'POST',
      headers: JSON_RETURN_HEADERS,
      body: JSON.stringify(user),
    },
    'Failed to create user',
  )
  return data[0] ?? null
}

// -- Itineraries --

export async function getItineraries() {
  return requestJson(`${BASE}/itineraries?order=created_at.desc`, {}, 'Failed to fetch itineraries')
}

export async function getItinerariesByUser(userId) {
  return requestJson(
    `${BASE}/itineraries?user_id=eq.${userId}&order=created_at.desc`,
    {},
    'Failed to fetch user itineraries',
  )
}

export async function getItinerary(itineraryId) {
  const data = await requestJson(
    `${BASE}/itineraries?itinerary_id=eq.${itineraryId}`,
    {},
    'Failed to fetch itinerary',
  )
  return data[0] ?? null
}

export async function createItinerary(itinerary) {
  const data = await requestJson(
    `${BASE}/itineraries`,
    {
      method: 'POST',
      headers: JSON_RETURN_HEADERS,
      body: JSON.stringify(itinerary),
    },
    'Failed to create itinerary',
  )
  return data[0] ?? null
}

export async function updateItinerary(itineraryId, updates) {
  const data = await requestJson(
    `${BASE}/itineraries?itinerary_id=eq.${itineraryId}`,
    {
      method: 'PATCH',
      headers: JSON_RETURN_HEADERS,
      body: JSON.stringify(updates),
    },
    'Failed to update itinerary',
  )
  return data[0] ?? null
}

export async function deleteItinerary(itineraryId) {
  return requestJson(
    `${BASE}/itineraries?itinerary_id=eq.${itineraryId}`,
    {
      method: 'DELETE',
      headers: JSON_HEADERS,
    },
    'Failed to delete itinerary',
  )
}

/**
 * Delete all child records (accommodations, restaurants, attractions, transport) for an itinerary.
 * Used before updating an itinerary to clear old selections.
 */
export async function deleteItineraryContent(itineraryId) {
  await Promise.all([
    requestJson(
      `${BASE}/accommodations?itinerary_id=eq.${itineraryId}`,
      { method: 'DELETE', headers: JSON_HEADERS },
      'Failed to delete accommodations',
    ),
    requestJson(
      `${BASE}/restaurants?itinerary_id=eq.${itineraryId}`,
      { method: 'DELETE', headers: JSON_HEADERS },
      'Failed to delete restaurants',
    ),
    requestJson(
      `${BASE}/attractions?itinerary_id=eq.${itineraryId}`,
      { method: 'DELETE', headers: JSON_HEADERS },
      'Failed to delete attractions',
    ),
    requestJson(
      `${BASE}/transport?itinerary_id=eq.${itineraryId}`,
      { method: 'DELETE', headers: JSON_HEADERS },
      'Failed to delete transport',
    ),
  ])
}

// -- Accommodations --

export async function getAccommodations(itineraryId) {
  return requestJson(
    `${BASE}/accommodations?itinerary_id=eq.${itineraryId}&order=created_at.asc`,
    {},
    'Failed to fetch accommodations',
  )
}

export async function addAccommodation(itineraryId, accommodation) {
  const data = await requestJson(
    `${BASE}/accommodations`,
    {
      method: 'POST',
      headers: JSON_RETURN_HEADERS,
      body: JSON.stringify({ itinerary_id: itineraryId, ...accommodation }),
    },
    'Failed to add accommodation',
  )
  return data[0] ?? null
}

// -- Restaurants --

export async function getRestaurants(itineraryId) {
  return requestJson(
    `${BASE}/restaurants?itinerary_id=eq.${itineraryId}&order=created_at.asc`,
    {},
    'Failed to fetch restaurants',
  )
}

export async function addRestaurant(itineraryId, restaurant) {
  const data = await requestJson(
    `${BASE}/restaurants`,
    {
      method: 'POST',
      headers: JSON_RETURN_HEADERS,
      body: JSON.stringify({ itinerary_id: itineraryId, ...restaurant }),
    },
    'Failed to add restaurant',
  )
  return data[0] ?? null
}

// -- Attractions --

export async function getAttractions(itineraryId) {
  return requestJson(
    `${BASE}/attractions?itinerary_id=eq.${itineraryId}&order=created_at.asc`,
    {},
    'Failed to fetch attractions',
  )
}

export async function addAttraction(itineraryId, attraction) {
  const data = await requestJson(
    `${BASE}/attractions`,
    {
      method: 'POST',
      headers: JSON_RETURN_HEADERS,
      body: JSON.stringify({ itinerary_id: itineraryId, ...attraction }),
    },
    'Failed to add attraction',
  )
  return data[0] ?? null
}

// -- Transport --

export async function getTransport(itineraryId) {
  return requestJson(
    `${BASE}/transport?itinerary_id=eq.${itineraryId}&order=created_at.asc`,
    {},
    'Failed to fetch transport',
  )
}

export async function addTransport(itineraryId, transportItem) {
  const data = await requestJson(
    `${BASE}/transport`,
    {
      method: 'POST',
      headers: JSON_RETURN_HEADERS,
      body: JSON.stringify({ itinerary_id: itineraryId, ...transportItem }),
    },
    'Failed to add transport',
  )
  return data[0] ?? null
}

// -- Review final save orchestration --

export async function saveReviewSelections(itineraryId, days) {
  const summary = {
    accommodation: 0,
    restaurants: 0,
    attractions: 0,
    transport: 0,
  }

  for (let dayIndex = 0; dayIndex < days.length; dayIndex += 1) {
    const dayItems = days[dayIndex] ?? []

    for (let orderIndex = 0; orderIndex < dayItems.length; orderIndex += 1) {
      const item = dayItems[orderIndex]
      const type = String(item.itemType ?? '').toLowerCase()

      if (type === 'accommodation') {
        await addAccommodation(itineraryId, toAccommodationRow(itineraryId, item, dayIndex, orderIndex))
        summary.accommodation += 1
      } else if (type === 'restaurant') {
        await addRestaurant(itineraryId, toRestaurantRow(itineraryId, item, dayIndex, orderIndex))
        summary.restaurants += 1
      } else if (type === 'attraction') {
        await addAttraction(itineraryId, toAttractionRow(itineraryId, item, dayIndex, orderIndex))
        summary.attractions += 1
      } else if (type === 'transport') {
        await addTransport(itineraryId, toTransportRow(itineraryId, item, dayIndex, orderIndex))
        summary.transport += 1
      }
    }
  }

  return summary
}

// Backward-compat aliases for older page code.
export const getJourneys = getItineraries
export const getJourney = getItinerary
export const createJourney = createItinerary
export const updateJourney = updateItinerary
export const deleteJourney = deleteItinerary

export { toIsoDate }
