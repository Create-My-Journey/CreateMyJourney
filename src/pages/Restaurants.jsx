import { useState } from 'react'
import AttractionCard from '../components/AttractionCard'
import './Restaurants.css'

// IDs start at 101 to avoid collision with attraction IDs (1–8)
const TOKYO_RESTAURANTS = [
  {
    id: 101,
    name: 'Sukiyabashi Jiro',
    category: 'Sushi',
    hours: 'Lunch 11:30–14:00 · Dinner 17:30–20:30 (closed Sun)',
    price: '¥40,000+ (~$270)',
    rating: 4.9,
    tags: ['Omakase', 'Michelin', 'Ginza'],
    description:
      'The most celebrated sushi counter on earth, helmed by master Jiro Ono in a basement beneath Ginza. Every piece of nigiri is a study in precision — served at the exact temperature and seasoned so perfectly it needs no soy sauce. Reservations are notoriously difficult; book through your hotel concierge months in advance.',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=440&q=80',
  },
  {
    id: 102,
    name: 'Sushi Saito',
    category: 'Sushi',
    hours: 'Lunch & Dinner (hours vary by reservation)',
    price: '¥30,000+ (~$200)',
    rating: 4.9,
    tags: ['Edomae', 'Counter', 'Akasaka'],
    description:
      'Widely regarded as one of the finest sushi counters in Japan, Saito-san focuses on seasonal Edomae-style nigiri using only the best fish from Toyosu market. The counter seats just a handful of guests; each visit feels like a private performance. Nearly impossible to book without a Japanese introduction.',
    image: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=440&q=80',
  },
  {
    id: 103,
    name: 'Narisawa',
    category: 'Fine Dining',
    hours: 'Lunch Fri–Sun 12:00 · Dinner Tue–Sun 18:00',
    price: '¥35,000+ (~$235)',
    rating: 4.8,
    tags: ['Innovative', 'Michelin', 'Minami-Aoyama'],
    description:
      "Chef Yoshihiro Narisawa blends French technique with a deep reverence for Japanese nature, resulting in dishes that feel like edible landscapes. Ingredients are foraged, fermented, or grown at the restaurant's own farm. One of the few Tokyo restaurants consistently ranked in the World's 50 Best.",
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=440&q=80',
  },
  {
    id: 104,
    name: 'Den',
    category: 'Kaiseki',
    hours: 'Lunch Sat–Sun 12:00 · Dinner Tue–Sun 18:00',
    price: '¥25,000 (~$165)',
    rating: 4.8,
    tags: ['Playful', 'Michelin', 'Jingumae'],
    description:
      "Chef Zaiyu Hasegawa's playful take on kaiseki has earned Den a devoted global following. The menu changes with the seasons and is peppered with surprises — a DEN-TAKU calculator made of food, or a Tokyo salad hidden inside a head of lettuce. Joyful, inventive, and utterly Japanese.",
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=440&q=80',
  },
  {
    id: 105,
    name: "L'Effervescence",
    category: 'French',
    hours: 'Lunch Fri–Sun · Dinner Tue–Sun 18:30',
    price: '¥28,000 (~$188)',
    rating: 4.7,
    tags: ['French-Japanese', 'Michelin', 'Nishiazabu'],
    description:
      "Chef Shinobu Namae trained under Michel Bras before bringing his philosophy of sustainable gastronomy to this elegant Nishiazabu townhouse. Each dish navigates the dialogue between French tradition and Japanese seasonality, with an extraordinary natural wine list to match.",
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=440&q=80',
  },
  {
    id: 106,
    name: 'Florilège',
    category: 'French',
    hours: 'Lunch Sat–Sun · Dinner Mon–Sat 18:00',
    price: '¥22,000 (~$148)',
    rating: 4.7,
    tags: ['Sustainability', 'Michelin', 'Azabudai'],
    description:
      "A forward-thinking contemporary French restaurant with an open kitchen at its centre and sustainability at its heart. Chef Hiroyasu Kawate sources directly from small farms and fishers, letting impeccable ingredients drive intensely seasonal menus. The counter seating makes every meal feel like a chef's table experience.",
    image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=440&q=80',
  },
  {
    id: 107,
    name: 'Tempura Kondo',
    category: 'Tempura',
    hours: 'Lunch & Dinner (closed Sun)',
    price: '¥20,000 (~$135)',
    rating: 4.8,
    tags: ['Tempura', 'Michelin', 'Ginza'],
    description:
      "Fumio Kondo elevates tempura to high art in his serene Ginza dining room. Famous for his towering sweet-potato fukinuke that requires 20 minutes of careful frying, and for the perfect crunch of his prawn. A masterclass in the deceptive simplicity of great Japanese frying.",
    image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=440&q=80',
  },
  {
    id: 108,
    name: 'Tonkatsu Narikura',
    category: 'Tonkatsu',
    hours: '11:30–14:00 · 17:30–20:00 (closed Mon & Tue)',
    price: '¥3,500 (~$23)',
    rating: 4.7,
    tags: ['Casual', 'Queue', 'Takadanobaba'],
    description:
      "Widely considered the finest tonkatsu in Tokyo, Narikura uses premium Kagoshima pork and a house-blend breadcrumb that fries to an impossibly light, shattering crust. The loin set comes with unlimited cabbage, rice, and miso soup. Expect a queue — it's worth every minute.",
    image: 'https://images.unsplash.com/photo-1630167338350-f5cf9a6c0d28?w=440&q=80',
  },
  {
    id: 109,
    name: 'Ichiran Shibuya',
    category: 'Ramen',
    hours: 'Open 24h',
    price: '¥1,200 (~$8)',
    rating: 4.5,
    tags: ['Solo', 'Tonkotsu', 'Shibuya'],
    description:
      "The solo dining experience that made Ichiran famous: each guest sits in an individual booth, orders via a customisation form, and receives their bowl through a bamboo blind. A uniquely Japanese ritual and an excellent bowl of rich tonkotsu ramen.",
    image: 'https://images.unsplash.com/photo-1614563637806-1d0e645e0940?w=440&q=80',
  },
  {
    id: 110,
    name: 'Afuri Harajuku',
    category: 'Ramen',
    hours: '11:00–23:00',
    price: '¥1,400 (~$9)',
    rating: 4.6,
    tags: ['Yuzu', 'Modern', 'Harajuku'],
    description:
      "Afuri's signature yuzu shio ramen — a pale, elegantly clear broth brightened with citrus and finished with delicate chashu — is the antithesis of heavy tonkotsu. The Harajuku location has a striking industrial-chic interior and a concise menu of refined sides.",
    image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=440&q=80',
  },
  {
    id: 111,
    name: 'Udon Shin',
    category: 'Udon',
    hours: '11:30–15:00 · 17:30–21:00 (closed Tue)',
    price: '¥1,100 (~$7)',
    rating: 4.7,
    tags: ['Hand-made', 'Queue', 'Shinjuku'],
    description:
      "A tiny counter-only spot near Shinjuku that handmakes its udon fresh every morning. The noodles have a supple chewiness impossible to find in chain udon shops. The cold zaru udon in summer and warm kamaage in winter are both exceptional. Arrive early — it sells out.",
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=440&q=80',
  },
  {
    id: 112,
    name: 'Kikanbo Kanda',
    category: 'Ramen',
    hours: '11:00–22:00 (closed Sun)',
    price: '¥1,100 (~$7)',
    rating: 4.6,
    tags: ['Spicy', 'Miso', 'Kanda'],
    description:
      "Famous for its devilishly spicy kaara miso ramen, where diners choose both spice and numbing pepper levels from 0 to 5. At level 3 and above, the deep-red broth hits with a slow, building heat that is as addictive as it is punishing. A cult destination for spice enthusiasts.",
    image: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=440&q=80',
  },
]

function Restaurants({ navigate, tripData, transportList = [], accommodationList = [] }) {
  const [selected, setSelected] = useState(new Set())
  const [sortBy, setSortBy] = useState('Reviews')
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')
  const [minReviewScore, setMinReviewScore] = useState('')

  const trip = tripData || { location: 'Tokyo, Japan', nights: 2, people: 2 }

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSkip = () => {
    navigate?.('attractions', { restaurantList: [], accommodationList, transportList, trip })
  }

  const handleConfirm = () => {
    const chosenRestaurants = TOKYO_RESTAURANTS.filter(r => selected.has(r.id))
    navigate?.('attractions', { restaurantList: chosenRestaurants, accommodationList, transportList, trip })
  }

  return (
    <div className="restaurants-page">

      {/* ── Page header ── */}
      <div className="restaurants-header">
        <span className="restaurants-eyebrow">
          {trip.location} · {trip.nights} nights · {trip.people}{' '}
          {trip.people === 1 ? 'person' : 'people'}
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

      {/* ── Two-column shell ── */}
      <main className="restaurants-shell" aria-label="Restaurant planner">

        {/* Left: AttractionCard list */}
        <section className="restaurants-left">
          <div className="restaurants-list" aria-label="Restaurant options">
            {TOKYO_RESTAURANTS.map(restaurant => (
              <AttractionCard
                key={restaurant.id}
                attraction={restaurant}
                selected={selected.has(restaurant.id)}
                onToggleSelect={toggleSelect}
              />
            ))}
          </div>
        </section>

        {/* Right: filters */}
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
                <option value="Price">Price</option>
              </select>
            </div>

            <div className="tool-col">
              <div className="tool-head">
                <h3>Filter By</h3>
                <span className="tool-icon" aria-hidden="true">⏃</span>
              </div>

              <div className="filter-block">
                <div className="line-row">
                  <span>Budget</span>
                  <span>$0–100</span>
                </div>
                <input type="range" min="0" max="100" defaultValue="100" />
              </div>

              <div className="value-row">
                <div className="value-col">
                  <label htmlFor="min-budget">Min. Budget</label>
                  <input
                    id="min-budget"
                    type="text"
                    placeholder="Value"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                  />
                </div>
                <div className="value-col">
                  <label htmlFor="max-budget">Max. Budget</label>
                  <input
                    id="max-budget"
                    type="text"
                    placeholder="Value"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-block">
                <div className="line-row">
                  <span>Review Score</span>
                  <span>0–5</span>
                </div>
                <input type="range" min="0" max="5" defaultValue="5" />
              </div>

              <div className="value-col value-col-single">
                <label htmlFor="min-review-score">Min. Review Score</label>
                <input
                  id="min-review-score"
                  type="text"
                  placeholder="Value"
                  value={minReviewScore}
                  onChange={(e) => setMinReviewScore(e.target.value)}
                />
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* ── Sticky footer ── */}
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

export default Restaurants
