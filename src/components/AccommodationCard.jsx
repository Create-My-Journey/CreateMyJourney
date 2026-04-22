import { useState } from 'react'
import './AccommodationCard.css'

export default function AccommodationCard({ accommodation, selected, onSelect }) {
  const [open, setOpen] = useState(false)

  const handleHeaderClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (e.clientX - rect.left < 48) {
      onSelect(accommodation.id)
    } else {
      setOpen(v => !v)
    }
  }

  return (
    <div className={`accom-card ${selected ? 'selected' : ''} ${open ? 'open' : ''}`}>
      <div className="accom-header" onClick={handleHeaderClick}>
        {/* Radio button style indicator */}
        <div className="accom-radio" aria-label={selected ? 'Selected' : 'Select'}>
          {selected && <div className="accom-radio-dot" />}
        </div>

        <div className="accom-info">
          <span className="accom-name">{accommodation.name}</span>
          <div className="accom-meta">
            <span className="accom-meta-item">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="11" height="11">
                <polygon points="8,1 10,6 15,6 11,9.5 12.5,15 8,12 3.5,15 5,9.5 1,6 6,6" />
              </svg>
              {accommodation.rating}
            </span>
            <span className="accom-meta-item">{accommodation.type}</span>
            <span className="accom-meta-item">{accommodation.pricePerNight}/night</span>
          </div>
        </div>

        <div className="accom-chevron">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </div>
      </div>

      <div className="accom-body">
        <div className="accom-body-inner">
          <div className="accom-image">
            {accommodation.image
              ? <img src={accommodation.image} alt={accommodation.name} loading="lazy" />
              : (
                <div className="accom-image-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="36" height="36">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21,15 16,10 5,21" />
                  </svg>
                </div>
              )
            }
          </div>

          <div className="accom-details">
            <p className="accom-description">{accommodation.description}</p>
            <div className="accom-tags">
              {accommodation.amenities.map(a => (
                <span className="accom-tag" key={a}>{a}</span>
              ))}
            </div>
            <div className="accom-footer-row">
              <div className="accom-location">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
                  <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6c0-2.5-2-4.5-4.5-4.5z" />
                  <circle cx="8" cy="6" r="1.5" />
                </svg>
                {accommodation.location}
              </div>
              <div className="accom-price-total">
                {accommodation.pricePerNight} × {accommodation.nights} nights
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
