import { useState, useRef, useEffect } from 'react'
import DatePicker from './DatePicker'
import './TravelForm.css'

// ── Location autocomplete data ──
const CITIES = [
  'Bucharest, Romania', 'Cluj-Napoca, Romania', 'Constanța, Romania',
  'Timișoara, Romania', 'Iași, Romania', 'Brașov, Romania', 'Sinaia, Romania',
  'Sibiu, Romania', 'Oradea, Romania', 'Arad, Romania', 'Craiova, Romania',
  'Galați, Romania', 'Mamaia, Romania', 'Predeal, Romania', 'Poiana Brasov, Romania',
  'Paris, France', 'Lyon, France', 'Nice, France', 'Marseille, France',
  'Rome, Italy', 'Milan, Italy', 'Florence, Italy', 'Venice, Italy', 'Naples, Italy',
  'Barcelona, Spain', 'Madrid, Spain', 'Seville, Spain', 'Valencia, Spain',
  'Amsterdam, Netherlands', 'Rotterdam, Netherlands', 'The Hague, Netherlands',
  'Vienna, Austria', 'Salzburg, Austria', 'Innsbruck, Austria',
  'Prague, Czech Republic', 'Budapest, Hungary',
  'Berlin, Germany', 'Munich, Germany', 'Hamburg, Germany', 'Cologne, Germany',
  'London, UK', 'Edinburgh, UK', 'Manchester, UK',
  'Lisbon, Portugal', 'Porto, Portugal',
  'Athens, Greece', 'Santorini, Greece', 'Mykonos, Greece', 'Thessaloniki, Greece',
  'Istanbul, Turkey', 'Antalya, Turkey', 'Cappadocia, Turkey',
  'Dubrovnik, Croatia', 'Split, Croatia', 'Zagreb, Croatia',
  'Warsaw, Poland', 'Krakow, Poland', 'Gdansk, Poland',
  'Sofia, Bulgaria', 'Varna, Bulgaria', 'Plovdiv, Bulgaria',
  'Brussels, Belgium', 'Ghent, Belgium', 'Bruges, Belgium',
  'Zurich, Switzerland', 'Geneva, Switzerland', 'Bern, Switzerland',
  'Stockholm, Sweden', 'Gothenburg, Sweden', 'Malmo, Sweden',
  'Copenhagen, Denmark', 'Oslo, Norway', 'Helsinki, Finland',
  'Reykjavik, Iceland', 'Dublin, Ireland', 'Tokyo, Japan',
]

const today = new Date()

export default function TravelForm({ onComplete }) {
  // Location
  const [location,     setLocation]     = useState('')
  const [suggestions,  setSuggestions]  = useState([])
  const [locationValid, setLocationValid] = useState(false)
  const [locationErr,  setLocationErr]  = useState('')
  const locRef = useRef(null)

  // Date
  const [date,        setDate]        = useState(null)
  const [showPicker,  setShowPicker]  = useState(false)
  const [pickerMonth, setPickerMonth] = useState(today.getMonth())
  const [pickerYear,  setPickerYear]  = useState(today.getFullYear())
  const [dateErr,     setDateErr]     = useState('')

  // Nights
  const [nights,    setNights]    = useState('')
  const [nightsErr, setNightsErr] = useState('')

  // People
  const [people,    setPeople]    = useState('')
  const [peopleErr, setPeopleErr] = useState('')

  // Close location suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (locRef.current && !locRef.current.contains(e.target)) {
        setSuggestions([])
        if (!locationValid && location) setLocationErr('We cannot find this location')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [location, locationValid])

  // ── Handlers ──
  const handleLocationChange = (val) => {
    setLocation(val)
    setLocationValid(false)
    setLocationErr('')
    if (val.trim().length > 0) {
      const matches = CITIES.filter(c => c.toLowerCase().includes(val.toLowerCase()))
      setSuggestions(matches.slice(0, 6))
      if (matches.length === 0) setLocationErr('We cannot find this location')
    } else {
      setSuggestions([])
    }
  }

  const handleLocationSelect = (city) => {
    setLocation(city)
    setLocationValid(true)
    setSuggestions([])
    setLocationErr('')
  }

  const validateInt = (val) => {
    if (!val) return null
    if (/[^0-9]/.test(val)) return false
    const n = parseInt(val, 10)
    return n >= 1 ? n : false
  }

  const handleNightsChange = (val) => {
    const clean = val.replace(/[^0-9]/g, '')
    setNights(clean)
    setNightsErr('')
  }

  const handlePeopleChange = (val) => {
    const clean = val.replace(/[^0-9]/g, '')
    setPeople(clean)
    setPeopleErr('')
  }

  const handleDateSelect = (d) => {
    setDate(d)
    setPickerMonth(d.getMonth())
    setPickerYear(d.getFullYear())
    setShowPicker(false)
    setDateErr('')
  }

  const handleSubmit = () => {
    let valid = true

    if (!location) {
      setLocationErr('Location is required'); valid = false
    } else if (!locationValid) {
      setLocationErr('We cannot find this location'); valid = false
    }

    if (!date) { setDateErr('Start date is required'); valid = false }

    const n = validateInt(nights)
    if (!nights) {
      setNightsErr('Number of nights is required'); valid = false
    } else if (n === false) {
      setNightsErr('Must be an integer bigger than 0'); valid = false
    }

    const p = validateInt(people)
    if (!people) {
      setPeopleErr('Number of persons is required'); valid = false
    } else if (p === false) {
      setPeopleErr('Must be an integer bigger than 0'); valid = false
    }

    if (valid) {
      onComplete({ location, date, nights: n, people: p })
    }
  }

  const fmtDate = (d) => d
    ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''

  return (
    <div className="travel-form">
      <div className="form-fields-row">

        {/* ── Location ── */}
        <div className="form-field" ref={locRef}>
          <label className="field-label">Location</label>
          {locationErr && <p className="error-text">{locationErr}</p>}
          <div className={`input-wrapper ${locationErr ? 'has-error' : ''}`}>
            <span className="input-icon">📍</span>
            <input
              className="form-input"
              placeholder="Where to?"
              value={location}
              onChange={e => handleLocationChange(e.target.value)}
              autoComplete="off"
            />
            <span className="input-icon" style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>⌕</span>
          </div>
          {suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map(city => (
                <div key={city} className="suggestion-item" onMouseDown={() => handleLocationSelect(city)}>
                  <span className="suggestion-pin">📍</span> {city}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Date ── */}
        <div className="form-field" style={{ position: 'relative' }}>
          <label className="field-label">Departure Date</label>
          {dateErr && <p className="error-text">{dateErr}</p>}
          <div
            className={`input-wrapper ${dateErr ? 'has-error' : ''}`}
            onClick={() => setShowPicker(v => !v)}
            style={{ cursor: 'pointer' }}
          >
            <span className="input-icon">🗓️</span>
            <input
              className="form-input"
              placeholder="Pick a date"
              value={fmtDate(date)}
              readOnly
              style={{ cursor: 'pointer' }}
            />
          </div>
          {showPicker && (
            <DatePicker
              value={date}
              viewMonth={pickerMonth}
              viewYear={pickerYear}
              onMonthChange={setPickerMonth}
              onYearChange={setPickerYear}
              onChange={handleDateSelect}
              onClose={() => setShowPicker(false)}
            />
          )}
        </div>

        {/* ── Nights ── */}
        <div className="form-field">
          <label className="field-label">Number of Nights</label>
          {nightsErr && <p className="error-text">{nightsErr}</p>}
          <div className={`input-wrapper ${nightsErr ? 'has-error' : ''}`}>
            <span className="input-icon">🌙</span>
            <input
              className="form-input"
              placeholder="e.g. 5"
              value={nights}
              inputMode="numeric"
              onChange={e => handleNightsChange(e.target.value)}
            />
          </div>
        </div>

        {/* ── People ── */}
        <div className="form-field">
          <label className="field-label">Number of People</label>
          {peopleErr && <p className="error-text">{peopleErr}</p>}
          <div className={`input-wrapper ${peopleErr ? 'has-error' : ''}`}>
            <span className="input-icon">🙂</span>
            <input
              className="form-input"
              placeholder="e.g. 2"
              value={people}
              inputMode="numeric"
              onChange={e => handlePeopleChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary form-submit-btn" onClick={handleSubmit}>
          Create My Journey ↗
        </button>
      </div>
    </div>
  )
}
