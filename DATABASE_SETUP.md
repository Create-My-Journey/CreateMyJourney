# Database Setup and Usage Guide

## Quick Start

### 1. Set Up Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your Google Maps API key:

```
GOOGLE_MAPS_API_KEY=your_api_key_here
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=createMyJourney
```

### 2. Start Services

```bash
# Start Docker containers
docker compose up

# In another terminal, start frontend dev server
npm run dev
```

### 3. Access the Services

- **Frontend**: http://localhost:5173
- **PostgREST API**: http://localhost:3000
- **Express Server**: http://localhost:3001
- **PostgreSQL**: localhost:5432

## How It Works

### Architecture

```
┌─────────────────────────────────────────────┐
│           React Frontend                    │
│         (Vite Dev Server)                   │
└──────────┬──────────────────────────────────┘
           │
           ├─→ /api/places/* ──→ Express Server ──→ Google Places API
           │
           └─→ /api/db/*     ──→ PostgREST     ──→ PostgreSQL
```

### What Each Service Does

- **PostgREST**: Automatically creates REST endpoints from your PostgreSQL schema
- **Express**: Keeps your Google Maps API key secure by proxying requests
- **PostgreSQL**: Stores all journey planning data

## Database Functions

All database functions are in [src/services/databaseApi.js](./src/services/databaseApi.js)

### Journey Management

```javascript
import * as db from './src/services/databaseApi.js'

// Create a new journey
const journey = await db.createJourney({
  name: 'Tokyo Trip',
  location: 'Tokyo, Japan',
  start_date: '2024-06-01',
  end_date: '2024-06-10',
  description: 'Amazing week in Tokyo'
})
console.log(journey.id) // 1

// Get all journeys
const journeys = await db.getJourneys()

// Get a specific journey
const journey = await db.getJourney(1)

// Update a journey
await db.updateJourney(1, {
  name: 'Updated Journey Name',
  description: 'Updated description'
})

// Delete a journey (cascades to all related records)
await db.deleteJourney(1)
```

### Attractions

```javascript
// Add an attraction to a journey
const attraction = await db.addAttraction(journeyId, {
  place_id: 'google_place_id_123',
  name: 'Senso-ji Temple',
  address: '2 Chome-3-1 Asakusa, Taito Ward, Tokyo',
  rating: 4.5,
  photo_url: 'https://example.com/photo.jpg',
  notes: 'Visit in the morning'
})

// Get all attractions for a journey
const attractions = await db.getAttractions(journeyId)

// Update an attraction
await db.updateAttraction(attractionId, {
  notes: 'Updated notes'
})

// Delete an attraction
await db.deleteAttraction(attractionId)
```

### Accommodations

```javascript
// Add accommodation
const accommodation = await db.addAccommodation(journeyId, {
  place_id: 'google_place_id_456',
  name: 'Hotel Gracery Shinjuku',
  address: '1 Chome-27-2 Shinjuku, Shinjuku Ward, Tokyo',
  rating: 4.3,
  photo_url: 'https://example.com/hotel.jpg',
  check_in_date: '2024-06-01',
  check_out_date: '2024-06-10',
  notes: 'Great location'
})

// Get accommodations
const accommodations = await db.getAccommodations(journeyId)

// Update accommodation
await db.updateAccommodation(accommodationId, {
  check_in_date: '2024-06-02'
})

// Delete accommodation
await db.deleteAccommodation(accommodationId)
```

### Restaurants

```javascript
// Add restaurant reservation
const restaurant = await db.addRestaurant(journeyId, {
  place_id: 'google_place_id_789',
  name: 'Ippudo Ramen',
  address: '1-2-3 Shibuya, Tokyo',
  cuisine_type: 'Japanese',
  rating: 4.4,
  photo_url: 'https://example.com/ramen.jpg',
  reservation_date: '2024-06-05',
  reservation_time: '19:00',
  notes: 'Popular ramen chain'
})

// Get restaurants
const restaurants = await db.getRestaurants(journeyId)

// Update restaurant
await db.updateRestaurant(restaurantId, {
  reservation_time: '18:30'
})

// Delete restaurant
await db.deleteRestaurant(restaurantId)
```

### Transport

```javascript
// Add transport
const transport = await db.addTransport(journeyId, {
  type: 'flight',
  from_location: 'New York',
  to_location: 'Tokyo',
  departure_date: '2024-06-01',
  departure_time: '14:00',
  arrival_date: '2024-06-02',
  arrival_time: '16:00',
  booking_reference: 'AA123456',
  notes: 'Direct flight'
})

// Get transport
const transports = await db.getTransport(journeyId)

// Update transport
await db.updateTransport(transportId, {
  booking_reference: 'AA123457'
})

// Delete transport
await db.deleteTransport(transportId)
```

## Example: Using in a Component

```javascript
import { useState, useEffect } from 'react'
import * as db from '../services/databaseApi.js'

function MyJourneys() {
  const [journeys, setJourneys] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJourneys = async () => {
      try {
        const data = await db.getJourneys()
        setJourneys(data)
      } catch (error) {
        console.error('Failed to fetch journeys:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJourneys()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>My Journeys</h1>
      {journeys.map(journey => (
        <div key={journey.id}>
          <h2>{journey.name}</h2>
          <p>{journey.location}</p>
          <p>From {journey.start_date} to {journey.end_date}</p>
        </div>
      ))}
    </div>
  )
}

export default MyJourneys
```

## Database Schema

### journeys
```sql
id              BIGSERIAL PRIMARY KEY
name            TEXT NOT NULL
location        TEXT NOT NULL
start_date      DATE NOT NULL
end_date        DATE NOT NULL
description     TEXT
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

### attractions
```sql
id              BIGSERIAL PRIMARY KEY
journey_id      BIGINT (FK to journeys)
place_id        TEXT NOT NULL
name            TEXT NOT NULL
address         TEXT
rating          DECIMAL(3, 2)
photo_url       TEXT
notes           TEXT
created_at      TIMESTAMP DEFAULT NOW()
```

### accommodations
```sql
id              BIGSERIAL PRIMARY KEY
journey_id      BIGINT (FK to journeys)
place_id        TEXT NOT NULL
name            TEXT NOT NULL
address         TEXT
rating          DECIMAL(3, 2)
photo_url       TEXT
check_in_date   DATE
check_out_date  DATE
notes           TEXT
created_at      TIMESTAMP DEFAULT NOW()
```

### restaurants
```sql
id              BIGSERIAL PRIMARY KEY
journey_id      BIGINT (FK to journeys)
place_id        TEXT NOT NULL
name            TEXT NOT NULL
address         TEXT
cuisine_type    TEXT
rating          DECIMAL(3, 2)
photo_url       TEXT
reservation_date DATE
reservation_time TIME
notes           TEXT
created_at      TIMESTAMP DEFAULT NOW()
```

### transport
```sql
id              BIGSERIAL PRIMARY KEY
journey_id      BIGINT (FK to journeys)
type            TEXT NOT NULL (flight, train, bus, car, etc.)
from_location   TEXT
to_location     TEXT
departure_date  DATE
departure_time  TIME
arrival_date    DATE
arrival_time    TIME
booking_reference TEXT
notes           TEXT
created_at      TIMESTAMP DEFAULT NOW()
```

## PostgREST Query Syntax

PostgREST uses query parameters for filtering, sorting, and pagination:

### Filtering

```javascript
// Get journeys from a specific location
fetch('/api/db/journeys?location=eq.Tokyo,Japan')

// Get attractions with rating > 4
fetch('/api/db/attractions?rating=gt.4')
```

### Sorting

```javascript
// Sort by created_at ascending
fetch('/api/db/journeys?order=created_at.asc')

// Sort by rating descending
fetch('/api/db/attractions?order=rating.desc')
```

### Pagination

```javascript
// Get first 10 results
fetch('/api/db/journeys?limit=10&offset=0')

// Get next 10
fetch('/api/db/journeys?limit=10&offset=10')
```

### Operators

- `eq` - equals
- `neq` - not equals
- `gt` - greater than
- `gte` - greater than or equals
- `lt` - less than
- `lte` - less than or equals
- `like` - pattern match
- `in` - in array

## Troubleshooting

### Database not connecting

Check Docker is running:
```bash
docker ps
```

Check logs:
```bash
docker compose logs db
docker compose logs postgrest
```

### PostgREST returns 404

Make sure the service is running:
```bash
docker compose logs postgrest
```

### Foreign key errors

Make sure parent records exist. E.g., can't add an attraction without a journey first.

## Production Considerations

1. **Change JWT Secret**: Update `PGRST_JWT_SECRET` in docker-compose.yaml
2. **Database Password**: Use a strong password, not "postgres"
3. **Restrict PostgREST Access**: Add authentication if exposing publicly
4. **CORS**: Configure CORS headers appropriately
5. **Backup**: Set up regular database backups
