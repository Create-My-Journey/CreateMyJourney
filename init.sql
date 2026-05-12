-- ============================================
-- Database initialization for CreateMyJourney
-- ============================================

-- Create role for PostgREST authentication
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'web_anon') THEN
    CREATE ROLE web_anon NOLOGIN;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO web_anon;

-- ============================================
-- Users
-- ============================================

CREATE TABLE users (
  user_id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed a temporary default user for the current no-auth flow.
INSERT INTO users (user_id, email, password_hash)
VALUES (1, 'demo@createmyjourney.local', 'temporary-demo-user')
ON CONFLICT (user_id) DO NOTHING;

SELECT setval('users_user_id_seq', GREATEST((SELECT MAX(user_id) FROM users), 1));

-- ============================================
-- Itineraries
-- ============================================

CREATE TABLE itineraries (
  itinerary_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  budget DECIMAL(10, 2),
  departure_date DATE NOT NULL,
  return_date DATE NOT NULL,
  group_size INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Accommodations
-- ============================================

CREATE TABLE accommodations (
  id BIGSERIAL PRIMARY KEY,
  itinerary_id BIGINT NOT NULL REFERENCES itineraries(itinerary_id) ON DELETE CASCADE,
  place_id TEXT,
  name TEXT NOT NULL,
  address TEXT,
  property_type TEXT,
  star_rating DECIMAL(3, 2),
  price_range TEXT,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Restaurants
-- ============================================

CREATE TABLE restaurants (
  id BIGSERIAL PRIMARY KEY,
  itinerary_id BIGINT NOT NULL REFERENCES itineraries(itinerary_id) ON DELETE CASCADE,
  place_id TEXT,
  name TEXT NOT NULL,
  address TEXT,
  cuisine_type TEXT,
  price_level TEXT,
  rating DECIMAL(3, 2),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Attractions
-- ============================================

CREATE TABLE attractions (
  id BIGSERIAL PRIMARY KEY,
  itinerary_id BIGINT NOT NULL REFERENCES itineraries(itinerary_id) ON DELETE CASCADE,
  place_id TEXT,
  name TEXT NOT NULL,
  address TEXT,
  category TEXT,
  suggested_duration_mins INTEGER,
  rating DECIMAL(3, 2),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Transport
-- ============================================

CREATE TABLE transport (
  id BIGSERIAL PRIMARY KEY,
  itinerary_id BIGINT NOT NULL REFERENCES itineraries(itinerary_id) ON DELETE CASCADE,
  origin_id TEXT,
  destination_id TEXT,
  vehicle_type TEXT NOT NULL,
  price DECIMAL(10, 2),
  booking_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Grant permissions to PostgREST anon role
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON users TO web_anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON itineraries TO web_anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON accommodations TO web_anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON restaurants TO web_anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON attractions TO web_anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON transport TO web_anon;

-- Grant permissions on sequences for auto-increment
GRANT USAGE, SELECT ON SEQUENCE users_user_id_seq TO web_anon;
GRANT USAGE, SELECT ON SEQUENCE itineraries_itinerary_id_seq TO web_anon;
GRANT USAGE, SELECT ON SEQUENCE accommodations_id_seq TO web_anon;
GRANT USAGE, SELECT ON SEQUENCE restaurants_id_seq TO web_anon;
GRANT USAGE, SELECT ON SEQUENCE attractions_id_seq TO web_anon;
GRANT USAGE, SELECT ON SEQUENCE transport_id_seq TO web_anon;

-- ============================================
-- Create indexes for better query performance
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX idx_accommodations_itinerary_id ON accommodations(itinerary_id);
CREATE INDEX idx_restaurants_itinerary_id ON restaurants(itinerary_id);
CREATE INDEX idx_attractions_itinerary_id ON attractions(itinerary_id);
CREATE INDEX idx_transport_itinerary_id ON transport(itinerary_id);
