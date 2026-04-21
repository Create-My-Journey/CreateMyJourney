import { useState, useEffect } from 'react'
import './HamburgerMenu.css'

const fmt = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export default function HamburgerMenu({ isOpen, onClose, journeys, onJourneyClick }) {
  const [showAll, setShowAll] = useState(false)

  // Reset showAll when menu closes
  useEffect(() => { if (!isOpen) setShowAll(false) }, [isOpen])

  const displayed = showAll ? journeys : journeys.slice(0, 6)
  const hasMore   = journeys.length > 6

  return (
    <>
      {isOpen && <div className="menu-overlay" onClick={onClose} />}

      <aside className={`hamburger-menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <span className="menu-title">My Journeys</span>
          <button className="menu-close-btn" onClick={onClose} aria-label="Close menu">✕</button>
        </div>

        <div className="journey-list">
          {journeys.length === 0 ? (
            <div className="no-journeys">
              <span className="no-journeys-icon">✈️</span>
              <p>No Journeys yet</p>
              <p className="no-journeys-sub">Start planning your first trip!</p>
            </div>
          ) : (
            <>
              {displayed.map(j => (
                <div key={j.id} className="journey-item" onClick={() => { onJourneyClick(j); onClose() }}>
                  <span className="journey-date">{fmt(j.startDate)}</span>
                  <span className="journey-location">{j.location}</span>
                </div>
              ))}

              {!showAll && hasMore && (
                <button className="list-all-btn" onClick={() => setShowAll(true)}>
                  List all →
                </button>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  )
}
