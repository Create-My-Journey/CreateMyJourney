import { useState } from 'react'
import './Restaurants.css'

const initialItems = [
    {
        id: 1,
        title: 'Sukiyabashi Jiro',
        description: 'World-famous sushi restaurant in Ginza, reservation-only omakase',
        checked: true,
    },
    {
        id: 2,
        title: 'Sushi Saito',
        description: 'Highly acclaimed sushi counter in Akasaka with seasonal Edomae style',
        checked: true,
    },
    {
        id: 3,
        title: 'Narisawa',
        description: 'Innovative Japanese fine dining in Minami-Aoyama',
        checked: true,
    },
    {
        id: 4,
        title: 'Den',
        description: 'Creative kaiseki-inspired tasting menu in Jingumae',
        checked: true,
    },
    {
        id: 5,
        title: "L'Effervescence",
        description: 'Modern French-Japanese cuisine in Nishiazabu',
        checked: true,
    },
    {
        id: 6,
        title: 'Florilege',
        description: 'Contemporary French restaurant focused on sustainability in Azabudai',
        checked: true,
    },
    {
        id: 7,
        title: 'Tempura Kondo',
        description: 'Legendary tempura specialist in Ginza',
        checked: true,
    },
    {
        id: 8,
        title: 'Tonkatsu Narikura',
        description: 'Top-rated tonkatsu spot in Takadanobaba',
        checked: true,
    },
    {
        id: 9,
        title: 'Ichiran Shibuya',
        description: 'Popular ramen chain known for customizable tonkotsu bowls',
        checked: true,
    },
    {
        id: 10,
        title: 'Afuri Harajuku',
        description: 'Yuzu-forward ramen and modern casual vibe in Harajuku',
        checked: true,
    },
    {
        id: 11,
        title: 'Udon Shin',
        description: 'Fresh hand-made udon near Shinjuku with long queues',
        checked: true,
    },
    {
        id: 12,
        title: 'Kikanbo Kanda',
        description: 'Famous spicy miso ramen shop in Kanda',
        checked: true,
    },
]

function Restaurants({ navigate, tripData }) {
    const [items, setItems] = useState(initialItems)
    const [sortBy, setSortBy] = useState('Reviews')
    const [minBudget, setMinBudget] = useState('')
    const [maxBudget, setMaxBudget] = useState('')
    const [minReviewScore, setMinReviewScore] = useState('')

    // tripData from previous step; fallback to Tokyo placeholder
    const trip = tripData || { location: 'Tokyo, Japan', nights: 2, people: 2 }

    const selectedCount = items.filter((item) => item.checked).length

    const toggleItem = (id) => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)))
    }

    const handleSkip = () => {
        navigate?.('attractions')
    }

    const handleConfirm = () => {
        console.log('Restaurant selection', {
            selectedRestaurants: items.filter((item) => item.checked).map((item) => item.id),
            sortBy,
            minBudget,
            maxBudget,
            minReviewScore,
        })
        navigate?.('attractions')
    }

    return (
        <div className="restaurants-page">

            {/* ── Page header ── */}
            <div className="restaurants-header">
                <span className="restaurants-eyebrow">
                    {trip.location} · {trip.nights} nights · {trip.people} {trip.people === 1 ? 'person' : 'people'}
                </span>
                <div className="restaurants-title-row">
                    <h1 className="restaurants-title">Choose Restaurants</h1>
                    <div className="restaurants-counter">
                        <span className="restaurants-counter-num">{selectedCount}</span>
                        <span className="restaurants-counter-label">Selected</span>
                    </div>
                </div>
                <p className="restaurants-subtitle">
                    Pick the restaurants you'd like to dine at — we'll weave them into your itinerary.
                </p>
            </div>

            {/* ── Two-column shell ── */}
            <main className="restaurants-shell" aria-label="Restaurant planner">

                {/* Left: list */}
                <section className="restaurants-left">
                    <ul className="restaurants-list" aria-label="Restaurant options">
                        {items.map((item) => (
                            <li className="restaurant-item" key={item.id}>
                                <label className="restaurant-row">
                                    <input
                                        type="checkbox"
                                        checked={item.checked}
                                        onChange={() => toggleItem(item.id)}
                                    />
                                    <span className="restaurant-copy">
                                        <span className="restaurant-name">{item.title}</span>
                                        <span className="restaurant-description">{item.description}</span>
                                    </span>
                                </label>
                            </li>
                        ))}
                    </ul>
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
