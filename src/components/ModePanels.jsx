import './ModePanels.css'

const AUTO_FEATURES  = ['Quickly input your budget', 'Get AI ideas for your journey', 'Automatic itinerary generation']
const MANUAL_FEATURES = ['Customize your own trip', 'Pick your budget', 'Choose your transport', 'List your attraction preferences']

export default function ModePanels({ onSelect }) {
  return (
    <div className="mode-panels">
      <p className="mode-hint">How would you like to plan your trip?</p>
      <div className="mode-panels-grid">

        <div className="mode-panel" onClick={() => onSelect('auto')}>
          <div className="mode-panel-icon">⚡</div>
          <h3 className="mode-panel-title">Auto</h3>
          <p className="mode-panel-sub">Let us do the heavy lifting</p>
          <ul className="mode-features">
            {AUTO_FEATURES.map(f => (
              <li key={f}><span className="feature-dot">•</span>{f}</li>
            ))}
          </ul>
          <div className="mode-panel-cta">Get Started →</div>
        </div>

        <div className="mode-panel" onClick={() => onSelect('manual')}>
          <div className="mode-panel-icon">🗺️</div>
          <h3 className="mode-panel-title">Manual</h3>
          <p className="mode-panel-sub">Build every detail yourself</p>
          <ul className="mode-features">
            {MANUAL_FEATURES.map(f => (
              <li key={f}><span className="feature-dot">•</span>{f}</li>
            ))}
          </ul>
          <div className="mode-panel-cta">Start Planning →</div>
        </div>

      </div>
    </div>
  )
}
