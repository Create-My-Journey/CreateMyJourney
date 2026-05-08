import { useState } from 'react'
import Navbar from '../components/Navbar'
import HamburgerMenu from '../components/HamburgerMenu'
import AccommodationCard from '../components/AccommodationCard'
import './ChooseAccommodation.css'
import { useNavigate } from 'react-router-dom'

// ── Placeholder accommodations for Tokyo ──
const TOKYO_ACCOMMODATIONS = [
  {
    id: 1,
    name: 'Park Hyatt Tokyo',
    type: 'Luxury Hotel',
    pricePerNight: '$420',
    rating: 4.9,
    amenities: ['Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Room Service'],
    location: 'Shinjuku, Tokyo',
    description:
      'Occupying the top floors of the Shinjuku Park Tower, the Park Hyatt offers sweeping views of Mount Fuji and the Tokyo skyline. Made famous by Lost in Translation, this iconic hotel blends understated luxury with exceptional Japanese service. The New York Bar on the 52nd floor is a must-visit.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=440&q=80',
  },
  {
    id: 2,
    name: 'Trunk Hotel',
    type: 'Boutique Hotel',
    pricePerNight: '$280',
    rating: 4.7,
    amenities: ['Rooftop Bar', 'Restaurant', 'Gym', 'Bicycle Rental'],
    location: 'Shibuya, Tokyo',
    description:
      'A stylish boutique hotel in the heart of Shibuya, Trunk blends local culture with contemporary design. Each room features curated art pieces and handcrafted furniture by Japanese artisans. The rooftop terrace and socially conscious ethos make it a favourite among design-minded travellers.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=440&q=80',
  },
  {
    id: 3,
    name: 'Asakusa Ryokan Yagenbori',
    type: 'Traditional Ryokan',
    pricePerNight: '$185',
    rating: 4.8,
    amenities: ['Onsen', 'Kaiseki Dinner', 'Yukata', 'Tea Ceremony', 'Garden'],
    location: 'Asakusa, Tokyo',
    description:
      'Experience authentic Japanese hospitality at this intimate ryokan steps from Senso-ji Temple. Sleep on futons in tatami-floored rooms, soak in a private cypress-wood onsen bath, and wake to a traditional multi-course breakfast. An unmissable cultural experience in the heart of old Tokyo.',
    image: 'https://images.unsplash.com/photo-1578469645742-46cae010e5d4?w=440&q=80',
  },
  {
    id: 4,
    name: 'Citadines Shinjuku Tokyo',
    type: 'Serviced Apartment',
    pricePerNight: '$130',
    rating: 4.5,
    amenities: ['Kitchenette', 'Laundry', 'Gym', 'Lounge', 'Workspace'],
    location: 'Shinjuku, Tokyo',
    description:
      'Ideal for longer stays, these spacious serviced apartments in Shinjuku come with fully equipped kitchenettes and separate living areas. Located a short walk from Shinjuku Station, you\'re well connected to every corner of the city. Modern, practical, and great value for groups or families.',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=440&q=80',
  },
  {
    id: 5,
    name: 'Khaosan Tokyo Origami',
    type: 'Hostel',
    pricePerNight: '$38',
    rating: 4.4,
    amenities: ['Shared Kitchen', 'Lounge', 'Luggage Storage', 'Free WiFi', 'Tours Desk'],
    location: 'Asakusa, Tokyo',
    description:
      'A social and well-located hostel in Asakusa offering both dorm beds and private rooms. Clean, well-designed spaces with a lively common area where travellers swap tips over breakfast. Perfect for solo travellers or budget-conscious visitors who still want style and character.',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=440&q=80',
  },
  {
    id: 6,
    name: 'The Tokyo EDITION Toranomon',
    type: 'Design Hotel',
    pricePerNight: '$350',
    rating: 4.8,
    amenities: ['Rooftop Pool', 'Spa', 'Michelin Bar', 'Gym', 'Concierge'],
    location: 'Toranomon, Tokyo',
    description:
      'Designed by Ian Schrager in collaboration with Kengo Kuma, the EDITION Toranomon is a masterpiece of understated luxury. Floor-to-ceiling windows frame panoramic city views, while the rooftop pool and Michelin-recognised bar set the scene for unforgettable evenings. Modern Tokyo at its finest.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=440&q=80',
  },
]

export default function ChooseAccommodation({ navigate, user, login, logout, tripData, transportList = [] }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const routerNavigate = useNavigate()

  const trip = tripData || { location: 'Tokyo, Japan', nights: 7, people: 2 }

  const handleSelect = (id) => {
    setSelected(prev => prev === id ? null : id)
  }

  const handleConfirm = () => {
    if (!selected) {
      alert('Please select an accommodation, or use "Skip".')
      return
    }
    const chosenAccommodation = TOKYO_ACCOMMODATIONS.find(a => a.id === selected)
    const accommodationCardItem = {
      id: `accommodation-${chosenAccommodation.id}`,
      name: chosenAccommodation.name,
      category: chosenAccommodation.type,
      hours: chosenAccommodation.location,
      price: chosenAccommodation.pricePerNight,
      rating: chosenAccommodation.rating,
      tags: chosenAccommodation.amenities,
      description: chosenAccommodation.description,
      image: chosenAccommodation.image,
    }

    // navigate('restaurants', { accommodationList: [accommodationCardItem], transportList, trip })
    routerNavigate('/journey/attractions')
  }

  const handleSkip = () => {
    // navigate('restaurants', { accommodationList: [], transportList, trip })
    routerNavigate('/journey/attractions')
  }

  return (
    <div className="ch-page">
      <Navbar
        user={user}
        onLogin={login}
        onLogout={logout}
        onMenuClick={() => setMenuOpen(true)}
        onNavigate={navigate}
      />

      <HamburgerMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        journeys={[]}
        onJourneyClick={() => {}}
      />

      {/* Page header */}
      <div className="ch-header">
        <span className="ch-eyebrow">
          {trip.location} · {trip.nights} nights · {trip.people} {trip.people === 1 ? 'person' : 'people'}
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

      {/* Accommodation list */}
      <main className="ch-main">
        {TOKYO_ACCOMMODATIONS.map(accommodation => (
          <AccommodationCard
            key={accommodation.id}
            accommodation={{ ...accommodation, nights: trip.nights }}
            selected={selected === accommodation.id}
            onSelect={handleSelect}
          />
        ))}
      </main>

      {/* Sticky footer actions */}
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
