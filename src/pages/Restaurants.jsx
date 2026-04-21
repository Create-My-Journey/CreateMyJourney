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
        title: 'L\'Effervescence',
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

function Restaurants({ navigate }) {
    const [items, setItems] = useState(initialItems)
    const [sortBy, setSortBy] = useState('Reviews')
    const [minBudget, setMinBudget] = useState('')
    const [maxBudget, setMaxBudget] = useState('')
    const [minReviewScore, setMinReviewScore] = useState('')

    const toggleItem = (id) => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)))
    }

    const handleSkip = () => {
        navigate?.('home')
    }

    const handleConfirm = () => {
        console.log('Restaurant selection', {
            selectedRestaurants: items.filter((item) => item.checked).map((item) => item.id),
            sortBy,
            minBudget,
            maxBudget,
            minReviewScore,
        })
        navigate?.('home')
    }

    return (
        <div className="restaurants-page">
            <main className="restaurants-shell" aria-label="Restaurant planner">
                <section className="restaurants-left">
                    <h1 className="restaurants-title">Choose Restaurants</h1>

                    <ul className="restaurants-list" aria-label="Restaurant options">
                        {items.map((item) => (
                            <li className="restaurant-item" key={item.id}>
                                <label className="restaurant-row">
                                    <input type="checkbox" checked={item.checked} onChange={() => toggleItem(item.id)} />
                                    <span className="restaurant-copy">
                                        <span className="restaurant-name">{item.title}</span>
                                        <span className="restaurant-description">{item.description}</span>
                                    </span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </section>

                <aside className="restaurants-right" aria-label="Restaurant filters">
                    <div className="restaurants-toolbar">
                        <div className="tool-col">
                            <div className="tool-head">
                                <h3>Sort By</h3>
                                <span className="tool-icon" aria-hidden="true">
                                    ↗
                                </span>
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
                                <span className="tool-icon" aria-hidden="true">
                                    ⏃
                                </span>
                            </div>

                            <div className="filter-block">
                                <div className="line-row">
                                    <span>Budget</span>
                                    <span>$0-100</span>
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
                                    <span>0-5</span>
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

            <div className="restaurants-actions">
                <button className="restaurants-btn" onClick={handleSkip}>
                    Skip Restaurants
                </button>
                <button className="restaurants-btn" onClick={handleConfirm}>
                    Confirm
                </button>
            </div>
        </div>
    )
}

export default Restaurants