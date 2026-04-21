import { useState } from 'react'
import './AttractionCard.css'

export default function AttractionCard({ attraction, selected, onToggleSelect }) {
  const [open, setOpen] = useState(false)

  const handleHeaderClick = (e) => {
    // If click is on the checkbox zone (left 48px), toggle selection
    const rect = e.currentTarget.getBoundingClientRect()
    if (e.clientX - rect.left < 48) {
      onToggleSelect(attraction.id)
    } else {
      setOpen(v => !v)
    }
  }

  return (
    <div className={`attraction-card ${selected ? 'selected' : ''} ${open ? 'open' : ''}`}>
      <div className="ac-header" onClick={handleHeaderClick}>
        <div className="ac-checkbox" aria-label={selected ? 'Deselect' : 'Select'}>
          {selected && (
            <svg viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1,5 4.5,8.5 11,1" />
            </svg>
          )}
        </div>

        <div className="ac-info">
          <span className="ac-name">{attraction.name}</span>
          <div className="ac-meta">
            <span className="ac-meta-item">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="11" height="11">
                <polygon points="8,1 10,6 15,6 11,9.5 12.5,15 8,12 3.5,15 5,9.5 1,6 6,6" />
              </svg>
              {attraction.rating}
            </span>
            <span className="ac-meta-item">{attraction.category}</span>
            <span className="ac-meta-item">{attraction.price}</span>
          </div>
        </div>

        <div className="ac-chevron">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </div>
      </div>

      <div className="ac-body">
        <div className="ac-body-inner">
          <div className="ac-image">
            {attraction.image
              ? <img src={attraction.image} alt={attraction.name} loading="lazy" />
              : (
                <div className="ac-image-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="36" height="36">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21,15 16,10 5,21" />
                  </svg>
                </div>
              )
            }
          </div>

          <div className="ac-details">
            <p className="ac-description">{attraction.description}</p>
            <div className="ac-tags">
              {attraction.tags.map(tag => (
                <span className="ac-tag" key={tag}>{tag}</span>
              ))}
            </div>
            <div className="ac-hours">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
                <circle cx="8" cy="8" r="6.5" />
                <polyline points="8,4.5 8,8 10.5,10" />
              </svg>
              {attraction.hours}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
