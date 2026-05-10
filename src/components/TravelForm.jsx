import { useState } from 'react'
import DatePicker from './DatePicker'
import LocationAutocomplete from './LocationAutocomplete'
import './TravelForm.css'

const today = new Date()

export default function TravelForm({ onComplete }) {
  // Location — we store both the display text and the placeId from Google
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

  // Called on every keystroke — user is still typing
  const handleLocationChange = (val) => {
    setLocation(val)
    setLocationErr('')
  }

  // Called when user picks a suggestion — description is the full text, placeId for future use
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

    // TODO: uncomment this to enable validation again
    // if (!location) {
    //   setLocationErr('Location is required'); valid = false
    // }

    // if (!date) { setDateErr('Start date is required'); valid = false }

    const n = validateInt(nights)
    // if (!nights) {
    //   setNightsErr('Number of nights is required'); valid = false
    // } else if (n === false) {
    //   setNightsErr('Must be an integer bigger than 0'); valid = false
    // }

    const p = validateInt(people)
    // if (!people) {
    //   setPeopleErr('Number of persons is required'); valid = false
    // } else if (p === false) {
    //   setPeopleErr('Must be an integer bigger than 0'); valid = false
    // }

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
        <div className="form-field">
          <label className="field-label">Location</label>
          <LocationAutocomplete
            value={location}
            onChange={handleLocationChange}
            onSelect={handleLocationSelect}
            error={locationErr}
            placeholder="Where to?"
          />
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
