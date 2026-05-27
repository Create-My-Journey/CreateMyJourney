import { useState } from 'react'
import DatePicker from './DatePicker'
import LocationAutocomplete from './LocationAutocomplete'
import './TravelForm.css'

const today = new Date()

export default function TravelForm({ onComplete }) {
  // Origin — where the user is travelling FROM
  const [originLocation,    setOriginLocation]    = useState('')
  const [originLocationErr, setOriginLocationErr] = useState('')

  // Destination — where the user is travelling TO
  const [location,     setLocation]     = useState('')
  const [locationErr,  setLocationErr]  = useState('')

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

  // ── Handlers ──

  const handleOriginChange = (val) => {
    setOriginLocation(val)
    setOriginLocationErr('')
  }

  const handleOriginSelect = (description, _placeId) => {
    setOriginLocation(description)
    setOriginLocationErr('')
  }

  const handleLocationChange = (val) => {
    setLocation(val)
    setLocationErr('')
  }

  const handleLocationSelect = (description, _placeId) => {
    setLocation(description)
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

    const n = validateInt(nights)
    const p = validateInt(people)

    if (valid) {
      onComplete({ originLocation, location, date, nights: n, people: p })
    }
  }

  const fmtDate = (d) => d
    ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''

  return (
    <div className="travel-form">
      {/* ── Row 1: Origin → Destination ── */}
      <div className="form-fields-row form-route-row">

        {/* ── Origin (From) ── */}
        <div className="form-field">
          <label className="field-label">From</label>
          <LocationAutocomplete
            value={originLocation}
            onChange={handleOriginChange}
            onSelect={handleOriginSelect}
            error={originLocationErr}
            placeholder="Departure city"
          />
        </div>

        {/* ── Route arrow ── */}
        <div className="form-route-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </div>

        {/* ── Destination (To) ── */}
        <div className="form-field">
          <label className="field-label">To</label>
          <LocationAutocomplete
            value={location}
            onChange={handleLocationChange}
            onSelect={handleLocationSelect}
            error={locationErr}
            placeholder="Where to?"
          />
        </div>
      </div>

      {/* ── Row 2: Date, Nights, People ── */}
      <div className="form-fields-row">

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
