# PostgREST Quick Reference

## Setup Checklist

- [ ] Copy `.env.example` to `.env`
- [ ] Add `GOOGLE_MAPS_API_KEY` to `.env`
- [ ] Run `docker compose up`
- [ ] Run `npm run dev` in another terminal

## Services

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | React Vite dev server |
| PostgREST API | http://localhost:3000 | Database REST API |
| Express | http://localhost:3001 | Places API proxy |
| PostgreSQL | localhost:5432 | Database server |

## Common Operations

### Create a Journey

```javascript
import { createJourney } from './src/services/databaseApi.js'

const trip = await createJourney({
  name: 'Summer Holiday',
  location: 'Paris, France',
  start_date: '2024-07-01',
  end_date: '2024-07-14'
})
```

### Add Content to Journey

```javascript
import * as db from './src/services/databaseApi.js'

// Add attraction
await db.addAttraction(journeyId, {
  place_id: 'place_id_from_google',
  name: 'Eiffel Tower',
  address: 'Paris, France',
  rating: 4.8,
  notes: 'Book tickets online'
})

// Add accommodation
await db.addAccommodation(journeyId, {
  place_id: 'hotel_place_id',
  name: 'Hotel des Invalides',
  check_in_date: '2024-07-01',
  check_out_date: '2024-07-14'
})

// Add restaurant
await db.addRestaurant(journeyId, {
  place_id: 'restaurant_place_id',
  name: 'Le Jules Verne',
  cuisine_type: 'French',
  reservation_date: '2024-07-05',
  reservation_time: '20:00'
})

// Add transport
await db.addTransport(journeyId, {
  type: 'flight',
  from_location: 'New York',
  to_location: 'Paris',
  departure_date: '2024-07-01',
  departure_time: '14:00'
})
```

### Retrieve Data

```javascript
import * as db from './src/services/databaseApi.js'

// Get all journeys
const journeys = await db.getJourneys()

// Get specific journey
const journey = await db.getJourney(journeyId)

// Get journey items
const attractions = await db.getAttractions(journeyId)
const hotels = await db.getAccommodations(journeyId)
const restaurants = await db.getRestaurants(journeyId)
const transport = await db.getTransport(journeyId)
```

### Update Data

```javascript
import * as db from './src/services/databaseApi.js'

await db.updateJourney(journeyId, { name: 'Updated Name' })
await db.updateAttraction(attractionId, { rating: 4.9 })
await db.updateAccommodation(accommodationId, { notes: 'Booked!' })
await db.updateRestaurant(restaurantId, { reservation_time: '19:30' })
await db.updateTransport(transportId, { booking_reference: 'AA123456' })
```

### Delete Data

```javascript
import * as db from './src/services/databaseApi.js'

await db.deleteAttraction(attractionId)
await db.deleteAccommodation(accommodationId)
await db.deleteRestaurant(restaurantId)
await db.deleteTransport(transportId)
await db.deleteJourney(journeyId) // Deletes all related items
```

## Raw PostgREST Calls (if needed)

```javascript
// GET all journeys
fetch('/api/db/journeys')

// POST new journey
fetch('/api/db/journeys', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Trip', location: 'Paris', start_date: '2024-07-01', end_date: '2024-07-14' })
})

// PATCH update journey
fetch('/api/db/journeys?id=eq.1', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Updated Trip' })
})

// DELETE journey
fetch('/api/db/journeys?id=eq.1', { method: 'DELETE' })

// Filter results
fetch('/api/db/journeys?location=eq.Paris,France')

// Sort results
fetch('/api/db/attractions?journey_id=eq.1&order=rating.desc')

// Pagination
fetch('/api/db/journeys?limit=10&offset=0')
```

## Database Tables

| Table | Columns | Relations |
|-------|---------|-----------|
| journeys | id, name, location, start_date, end_date, description, created_at, updated_at | Parent for all other tables |
| attractions | id, journey_id, place_id, name, address, rating, photo_url, notes | FK: journey_id |
| accommodations | id, journey_id, place_id, name, address, rating, photo_url, check_in_date, check_out_date, notes | FK: journey_id |
| restaurants | id, journey_id, place_id, name, address, cuisine_type, rating, photo_url, reservation_date, reservation_time, notes | FK: journey_id |
| transport | id, journey_id, type, from_location, to_location, departure_date, departure_time, arrival_date, arrival_time, booking_reference, notes | FK: journey_id |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 errors on /api/db | Make sure PostgREST is running: `docker ps \| grep postgrest` |
| Database errors | Check Docker logs: `docker compose logs db` |
| Can't create child records | Parent record (journey) must exist first |
| Data looks wrong | Make sure you're using the right journey_id for related items |
| Port conflicts | Check what's using ports 3000, 3001, 5173, 5432 |

## Real-World Example Component

```javascript
import { useState, useEffect } from 'react'
import * as db from '../services/databaseApi.js'

function TripPlan() {
  const [journey, setJourney] = useState(null)
  const [attractions, setAttractions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTrip = async () => {
      try {
        const j = await db.getJourney(1) // Get trip with ID 1
        setJourney(j)
        const a = await db.getAttractions(1)
        setAttractions(a)
      } catch (err) {
        console.error('Failed to load trip:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTrip()
  }, [])

  const handleAddAttraction = async (attractionData) => {
    const newAttraction = await db.addAttraction(journey.id, attractionData)
    setAttractions([...attractions, newAttraction])
  }

  if (loading) return <div>Loading...</div>
  if (!journey) return <div>No trip found</div>

  return (
    <div>
      <h1>{journey.name}</h1>
      <p>{journey.location}</p>
      <div>
        <h2>Attractions</h2>
        <ul>
          {attractions.map(a => (
            <li key={a.id}>{a.name} (⭐ {a.rating})</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default TripPlan
```

## Links

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Full setup guide
- [README.md](./README.md) - Project overview
- [PostgREST Docs](https://postgrest.org) - Official documentation
- [PostgreSQL Docs](https://www.postgresql.org/docs/) - Database documentation
