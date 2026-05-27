import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { buildDayActivityPlan } from '../services/itinerarySplit'
import { searchFlights, searchGroundTransport, getDirectionsBetweenPlaces } from '../services/amadeusApi'
import './Transport.css'

// 
// Local-segment helpers (between attractions inside the journey)
// 

function buildLocalSegmentOptions(segmentId, fromName, toName) {
  return [
    {
      id: `${segmentId}-taxi`,
      mode: 'taxi',
      label: `Taxi`,
      route: `${fromName} → ${toName}`,
      description: 'Door-to-door comfort. Best for luggage or late arrivals.',
      icon: '🚖',
      estimatedTime: '5–20 min',
      estimatedPrice: '€5–€18',
    },
    {
      id: `${segmentId}-bus`,
      mode: 'bus',
      label: `Bus / Metro`,
      route: `${fromName} → ${toName}`,
      description: 'Budget-friendly local transit. Multiple routes may apply.',
      icon: '🚌',
      estimatedTime: '10–35 min',
      estimatedPrice: '€1–€4',
    },
    {
      id: `${segmentId}-walk`,
      mode: 'walk',
      label: `Walk`,
      route: `${fromName} → ${toName}`,
      description: 'Explore the city on foot — great for short distances.',
      icon: '🚶',
      estimatedTime: '10–30 min',
      estimatedPrice: 'Free',
    },
  ]
}

function buildSegmentsFromDays(days) {
  const segments = []
  days.forEach((dayItems, dayIndex) => {
    for (let i = 0; i < dayItems.length - 1; i += 1) {
      const fromItem = dayItems[i]
      const toItem   = dayItems[i + 1]
      const fromName = fromItem?.name || `Activity ${i + 1}`
      const toName   = toItem?.name   || `Activity ${i + 2}`
      const segmentId = `day-${dayIndex + 1}-${i + 1}`
      segments.push({
        id: segmentId,
        dayIndex,
        title: `Day ${dayIndex + 1} · ${fromName} → ${toName}`,
        fromName,
        toName,
        options: null, // Will be populated by Google Maps
        loading: true,
      })
    }
  })
  return segments
}

async function fetchLocalSegmentOptions(fromName, toName, cityContext) {
  const searchFrom = cityContext ? `${fromName}, ${cityContext}` : fromName
  const searchTo = cityContext ? `${toName}, ${cityContext}` : toName

  // Fetch transit directions
  const data = await getDirectionsBetweenPlaces(searchFrom, searchTo, 'transit')
  const options = []
  
  if (data && data.status === 'OK' && data.routes.length > 0) {
    const route = data.routes[0]
    const leg = route.legs[0]
    options.push({
      id: 'transit',
      mode: 'bus', // map to our css class
      label: 'Public Transit',
      route: `${fromName} → ${toName}`,
      description: leg.steps.map(s => s.html_instructions.replace(/<[^>]+>/g, '')).join(' · '),
      icon: '🚇',
      estimatedTime: leg.duration.text,
      estimatedPrice: 'Varies',
    })
  }

  // Also fetch walking
  const walkData = await getDirectionsBetweenPlaces(searchFrom, searchTo, 'walking')
  if (walkData && walkData.status === 'OK' && walkData.routes.length > 0) {
    const leg = walkData.routes[0].legs[0]
    options.push({
      id: 'walk',
      mode: 'walk',
      label: 'Walk',
      route: `${fromName} → ${toName}`,
      description: 'Explore the city on foot.',
      icon: '🚶',
      estimatedTime: leg.duration.text,
      estimatedPrice: 'Free',
    })
  }

  // Fallback if no routes found
  if (options.length === 0) {
    options.push({
      id: 'taxi',
      mode: 'taxi',
      label: 'Taxi / Ride-hail',
      route: `${fromName} → ${toName}`,
      description: 'Estimated quick ride.',
      icon: '🚕',
      estimatedTime: '15 min',
      estimatedPrice: '€10',
    })
  }

  return options
}

// 
// Helpers
// 

const MODE_ICONS = { flight: '✈️', train: '🚂', bus: '🚌' }
const MODE_LABELS = { flight: 'Flight', train: 'Train', bus: 'Bus' }

function formatPrice(price, currency = 'EUR') {
  if (price === null || price === undefined) return 'Unknown'
  return new Intl.NumberFormat('en-EU', {
    style: 'currency', currency, maximumFractionDigits: 0
  }).format(price)
}

// 
// Sub-components
// 

function MockBadge() {
  return (
    <span className="tr-mock-badge" title="Prices are illustrative estimates">
      Demo data
    </span>
  )
}

function EstimateBadge() {
  return (
    <span className="tr-estimate-badge" title="Real-time prices require booking sites">
      Estimated
    </span>
  )
}

function LoadingCards() {
  return (
    <div className="tr-loading-cards">
      {[1, 2, 3].map(i => (
        <div key={i} className="tr-skeleton-card">
          <div className="sk-line sk-wide" />
          <div className="sk-line sk-medium" />
          <div className="sk-line sk-narrow" />
        </div>
      ))}
    </div>
  )
}

function FlightCard({ flight, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`tr-transport-card tr-flight-card ${selected ? 'is-selected' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <div className="trc-left">
        <span className="trc-airline-logo">{flight.airlineLogo}</span>
        <div className="trc-airline-info">
          <span className="trc-airline-name">{flight.airline}</span>
          <span className="trc-cabin">{flight.cabin}</span>
        </div>
      </div>

      <div className="trc-times">
        <span className="trc-time">{flight.departure}</span>
        <div className="trc-route-line">
          <span className="trc-stops-dot" />
          <span className="trc-stops-label">{flight.stopsLabel}</span>
          <span className="trc-stops-dot" />
        </div>
        <span className="trc-time">{flight.arrival}</span>
      </div>

      <div className="trc-duration">
        <span className="trc-dur-time">{flight.duration}</span>
        <span className="trc-dur-label">duration</span>
      </div>

      <div className="trc-price">
        <span className="trc-price-amount">{formatPrice(flight.price, flight.currency)}</span>
        {flight.isMock && <MockBadge />}
      </div>

      {selected && (
        <span className="trc-check" aria-hidden="true">✓</span>
      )}
    </button>
  )
}

function GroundCard({ option, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`tr-transport-card tr-ground-card ${selected ? 'is-selected' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <div className="trc-left">
        <span className="trc-mode-icon">{option.mode === 'train' ? '🚂' : '🚌'}</span>
        <div className="trc-airline-info">
          <span className="trc-airline-name">{option.provider}</span>
          <span className="trc-cabin">{option.class}</span>
        </div>
      </div>

      <div className="trc-times">
        <span className="trc-time">{option.departure}</span>
        <div className="trc-route-line">
          <span className="trc-stops-dot" />
          <span className="trc-stops-label">{option.stops === 0 ? 'Direct' : `${option.stops} stop${option.stops > 1 ? 's' : ''}`}</span>
          <span className="trc-stops-dot" />
        </div>
        <span className="trc-time">{option.arrival}</span>
      </div>

      <div className="trc-duration">
        <span className="trc-dur-time">{option.duration}</span>
        <span className="trc-dur-label">duration</span>
      </div>

      <div className="trc-price">
        <span className="trc-price-amount">{formatPrice(option.price, option.currency)}</span>
        <EstimateBadge />
      </div>

      {selected && (
        <span className="trc-check" aria-hidden="true">✓</span>
      )}
    </button>
  )
}

function LocalSegmentCard({ option, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`tr-local-card ${selected ? 'is-selected' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <div className="tlc-icon">{option.icon}</div>
      <div className="tlc-body">
        <div className="tlc-header">
          <span className="tlc-label">{option.label}</span>
          <span className="tlc-time">{option.estimatedTime}</span>
        </div>
        <p className="tlc-desc">{option.description}</p>
      </div>
      <div className="tlc-price">{option.estimatedPrice}</div>
      {selected && <span className="tlc-check" aria-hidden="true">✓</span>}
    </button>
  )
}

// 
// Main component
// 

export default function Transport() {
  const routerNavigate = useNavigate()
  const [tripDetails, setTripDetails] = useOutletContext()

  //  Derived data 
  const dayActivityPlan = useMemo(
    () => tripDetails.dayActivityPlan || buildDayActivityPlan({
      attractions: tripDetails.attractions || [],
      restaurants: tripDetails.restaurants || [],
      nights: tripDetails.nights,
    }),
    [tripDetails.dayActivityPlan, tripDetails.attractions, tripDetails.restaurants, tripDetails.nights],
  )
  const baseSegments = useMemo(() => buildSegmentsFromDays(dayActivityPlan), [dayActivityPlan])

  //  Origin / Destination info 
  const originCity = tripDetails.originLocation || ''
  const destCity   = tripDetails.location       || ''
  const hasRoute   = Boolean(originCity && destCity)
  const travelDate = tripDetails.date
    ? (typeof tripDetails.date === 'string' ? tripDetails.date : new Date(tripDetails.date).toISOString().slice(0, 10))
    : null
  const adults     = Math.max(1, Number(tripDetails.people) || 1)

  //  Long-haul transport state 
  const [activeMode, setActiveMode] = useState('flight') // 'flight' | 'train' | 'bus'
  const [flightData, setFlightData] = useState({ flights: [], source: null, loading: true, error: null })
  const [trainData, setTrainData] = useState({ options: [], source: null, loading: false, fetched: false })
  const [busData, setBusData] = useState({ options: [], source: null, loading: false, fetched: false })

  // Selected long-haul option (one per mode — user can compare)
  const [selectedFlight, setSelectedFlight] = useState(null)
  const [selectedTrain,  setSelectedTrain]  = useState(null)
  const [selectedBus,    setSelectedBus]    = useState(null)

  // Which long-haul mode is "confirmed" for the trip
  const [confirmedLongHaul, setConfirmedLongHaul] = useState(null) // { mode, data }

  //  Local segment state 
  const initialLocalSelection = useMemo(() => {
    const saved = tripDetails.transport || []
    return baseSegments.reduce((acc, seg, idx) => {
      const savedOption = saved.find(t => t.id === seg.id)
      const savedId = savedOption?.option_id || savedOption?.id
      const valid = seg.options?.some(o => o.id === savedId)
      acc[seg.id] = valid ? savedId : seg.options?.[0]?.id
      return acc
    }, {})
  }, [baseSegments, tripDetails.transport])

  const [localSelection, setLocalSelection] = useState(initialLocalSelection)
  const [activeLocalIdx, setActiveLocalIdx] = useState(0)

  //  Fetch local segments options 
  const [localSegments, setLocalSegments] = useState(baseSegments)
  
  useEffect(() => {
    let active = true
    async function loadAllSegments() {
      const updatedSegments = [...baseSegments]
      for (let i = 0; i < updatedSegments.length; i++) {
        const seg = updatedSegments[i]
        const options = await fetchLocalSegmentOptions(seg.fromName, seg.toName, destCity)
        if (!active) return
        updatedSegments[i] = { ...seg, options, loading: false }
        setLocalSegments([...updatedSegments]) // update progressively
        
        // Auto-select first option if none selected
        setLocalSelection(prev => {
          if (!prev[seg.id] && options.length > 0) {
            return { ...prev, [seg.id]: options[0].id }
          }
          return prev
        })
      }
    }
    loadAllSegments()
    return () => { active = false }
  }, [baseSegments, destCity])

  //  Fetch flights on mount 
  const fetchedRef = useRef(false)

  const loadFlights = useCallback(async () => {
    if (!hasRoute) {
      setFlightData({ flights: [], source: null, loading: false, error: null })
      return
    }
    setFlightData(prev => ({ ...prev, loading: true, error: null }))
    try {
      const result = await searchFlights({ from: originCity, to: destCity, date: travelDate, adults })
      setFlightData({ flights: result.flights || [], source: result.source, loading: false, error: null })
      if (result.flights?.length > 0) setSelectedFlight(result.flights[0].id)
    } catch (err) {
      setFlightData({ flights: [], source: 'error', loading: false, error: err.message })
    }
  }, [hasRoute, originCity, destCity, travelDate, adults])

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    loadFlights()
  }, [loadFlights])

  // Fetch train / bus lazily when tab is clicked 
  const loadTrains = useCallback(async () => {
    if (trainData.fetched || trainData.loading) return
    setTrainData(prev => ({ ...prev, loading: true }))
    try {
      const result = await searchGroundTransport({ from: originCity, to: destCity, mode: 'train' })
      setTrainData({ options: result.options || [], source: result.source, loading: false, fetched: true })
      if (result.options?.length > 0) setSelectedTrain(result.options[0].id)
    } catch (err) {
      setTrainData({ options: [], source: 'error', loading: false, fetched: true })
    }
  }, [originCity, destCity, trainData.fetched, trainData.loading])

  const loadBuses = useCallback(async () => {
    if (busData.fetched || busData.loading) return
    setBusData(prev => ({ ...prev, loading: true }))
    try {
      const result = await searchGroundTransport({ from: originCity, to: destCity, mode: 'bus' })
      setBusData({ options: result.options || [], source: result.source, loading: false, fetched: true })
      if (result.options?.length > 0) setSelectedBus(result.options[0].id)
    } catch (err) {
      setBusData({ options: [], source: 'error', loading: false, fetched: true })
    }
  }, [originCity, destCity, busData.fetched, busData.loading])

  const handleModeTab = (mode) => {
    setActiveMode(mode)
    if (mode === 'train') loadTrains()
    if (mode === 'bus')   loadBuses()
  }

  // Confirm handler
  const handleConfirm = () => {
    // Build long-haul transport entry
    const longHaulItems = []

    if (hasRoute) {
      // Collect selected option from each mode
      const flightItem = flightData.flights.find(f => f.id === selectedFlight)
      const trainItem  = trainData.options.find(t => t.id === selectedTrain)
      const busItem    = busData.options.find(b => b.id === selectedBus)

      ;[
        flightItem && { mode: 'flight', item: flightItem },
        trainItem  && { mode: 'train',  item: trainItem  },
        busItem    && { mode: 'bus',     item: busItem    },
      ].filter(Boolean).forEach(({ mode, item }) => {
        longHaulItems.push({
          id: `longhaul-${mode}`,
          option_id: item.id,
          itemType: 'Transport',
          category: mode,
          name: mode === 'flight'
            ? `${item.airline} · ${item.departure}–${item.arrival}`
            : `${item.provider} · ${item.departure}–${item.arrival}`,
          hours: `${originCity} → ${destCity}`,
          price: String(item.price ?? 'Varies'),
          rating: 4.5,
          tags: [mode],
          description: `${item.stopsLabel ?? (item.stops === 0 ? 'Direct' : `${item.stops} stop(s)`)} · ${item.duration}`,
          image: null,
          dayIndex: 0,
          orderIndex: 0,
          isLongHaul: true,
        })
      })
    }

    // Build local segment items
    const firstDayAccommodationOffset = tripDetails.accommodation?.length || 0
    const localItems = localSegments.map((seg) => {
      const chosenOption = seg.options.find(o => o.id === localSelection[seg.id])
      if (!chosenOption) return null
      const segOrderIdx = Number.parseInt(seg.id.split('-').pop(), 10)
      return {
        id: seg.id,
        option_id: chosenOption.id,
        itemType: 'Transport',
        category: chosenOption.mode,
        name: `${chosenOption.label}: ${seg.fromName} → ${seg.toName}`,
        hours: `${seg.fromName} → ${seg.toName}`,
        price: chosenOption.estimatedPrice,
        rating: 4.6,
        tags: [chosenOption.mode],
        description: chosenOption.description,
        image: null,
        dayIndex: seg.dayIndex,
        orderIndex: seg.dayIndex === 0 ? segOrderIdx + firstDayAccommodationOffset : segOrderIdx,
      }
    }).filter(Boolean)

    setTripDetails(prev => ({ ...prev, transport: [...longHaulItems, ...localItems] }))
    routerNavigate('/journey/review', { state: { fromTransport: true } })
  }

  const handleSkip = () => {
    setTripDetails(prev => { const { transport, ...rest } = prev; return rest })
    routerNavigate('/journey/review')
  }

  const moveLocal = (dir) => {
    setActiveLocalIdx(prev => Math.max(0, Math.min(localSegments.length - 1, prev + dir)))
  }

  const activeLocalSeg = localSegments[activeLocalIdx]


  // render
  return (
    <div className="tr-page">
      {/*  Header  */}
      <div className="tr-header">
        <span className="tr-eyebrow">Plan your journey</span>
        <div className="tr-title-row">
          <h1 className="tr-title">Choose Transport</h1>
        </div>
        {hasRoute ? (
          <p className="tr-subtitle">
            Finding the best options from <strong>{originCity}</strong> to <strong>{destCity}</strong>
            {travelDate && ` on ${new Date(travelDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
          </p>
        ) : (
          <p className="tr-subtitle tr-no-route">
            No origin city set — add a "From" location on the Home page for flight and train options.
          </p>
        )}
      </div>

      <main className="tr-main" aria-label="Transport planner">
        <div className="tr-panels">

          {/* 
              SECTION 1 — Long-haul: Flight / Train / Bus
           */}
          {hasRoute && (
            <section className="tr-section" aria-labelledby="longhaul-heading">
              <h2 id="longhaul-heading" className="tr-section-title">
                <span className="tr-section-icon">🗺️</span>
                Route to Destination
                <span className="tr-section-route">{originCity} → {destCity}</span>
              </h2>

              {/* Mode tabs */}
              <div className="tr-mode-tabs" role="tablist" aria-label="Transport modes">
                {(['flight', 'train', 'bus']).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    role="tab"
                    className={`tr-mode-tab ${activeMode === mode ? 'is-active' : ''}`}
                    aria-selected={activeMode === mode}
                    onClick={() => handleModeTab(mode)}
                    id={`tab-${mode}`}
                  >
                    <span className="tr-tab-icon">{MODE_ICONS[mode]}</span>
                    <span className="tr-tab-label">{MODE_LABELS[mode]}</span>
                  </button>
                ))}
              </div>

              {/* Flight panel */}
              {activeMode === 'flight' && (
                <div className="tr-mode-panel" role="tabpanel" aria-labelledby="tab-flight">
                  {flightData.loading && <LoadingCards />}
                  {!flightData.loading && flightData.error && (
                    <div className="tr-error-state">
                      <p> Could not load flights. Showing estimates instead.</p>
                    </div>
                  )}
                  {!flightData.loading && flightData.flights.length === 0 && !flightData.error && (
                    <div className="tr-empty-state">
                      <p>No flights found for this route. Try adjusting the dates.</p>
                    </div>
                  )}
                  {!flightData.loading && flightData.flights.map(flight => (
                    <FlightCard
                      key={flight.id}
                      flight={flight}
                      selected={selectedFlight === flight.id}
                      onSelect={() => setSelectedFlight(flight.id)}
                    />
                  ))}
                  {flightData.source === 'mock' && !flightData.loading && flightData.flights.length > 0 && (
                    <div className="tr-source-note">
                      Demo data shown. Add Duffel API credentials for live prices.
                    </div>
                  )}
                </div>
              )}

              {/* Train panel */}
              {activeMode === 'train' && (
                <div className="tr-mode-panel" role="tabpanel" aria-labelledby="tab-train">
                  {trainData.loading && <LoadingCards />}
                  {!trainData.loading && !trainData.fetched && (
                    <div className="tr-empty-state"><p>Loading train options…</p></div>
                  )}
                  {!trainData.loading && trainData.fetched && trainData.options.length === 0 && (
                    <div className="tr-empty-state"><p>No train options found for this route.</p></div>
                  )}
                  {!trainData.loading && trainData.options.map(opt => (
                    <GroundCard
                      key={opt.id}
                      option={opt}
                      selected={selectedTrain === opt.id}
                      onSelect={() => setSelectedTrain(opt.id)}
                    />
                  ))}
                  {!trainData.loading && trainData.options.length > 0 && (
                    <p className="tr-source-note">
                      Train prices are estimates. Book via national rail operators.
                    </p>
                  )}
                </div>
              )}

              {/* Bus panel */}
              {activeMode === 'bus' && (
                <div className="tr-mode-panel" role="tabpanel" aria-labelledby="tab-bus">
                  {busData.loading && <LoadingCards />}
                  {!busData.loading && !busData.fetched && (
                    <div className="tr-empty-state"><p>Loading bus options…</p></div>
                  )}
                  {!busData.loading && busData.fetched && busData.options.length === 0 && (
                    <div className="tr-empty-state"><p>No bus options found for this route.</p></div>
                  )}
                  {!busData.loading && busData.options.map(opt => (
                    <GroundCard
                      key={opt.id}
                      option={opt}
                      selected={selectedBus === opt.id}
                      onSelect={() => setSelectedBus(opt.id)}
                    />
                  ))}
                  {!busData.loading && busData.options.length > 0 && (
                    <p className="tr-source-note">
                      Bus prices are estimates. Book via FlixBus, BlaBlaBus etc.
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          {/* 
              SECTION 2 — Local: between attractions
           */}
          <section className="tr-section tr-section-local" aria-labelledby="local-heading">
            <h2 id="local-heading" className="tr-section-title">
              <span className="tr-section-icon">🏙️</span>
              Between Attractions
            </h2>

            {localSegments.length === 0 ? (
              <div className="tr-empty-state">
                <p>Add at least two activities in a day to generate local transport segments.</p>
              </div>
            ) : (
              <>
                {/* Segment slider header */}
                <div className="segment-slider-head">
                  <div className="seg-route">
                    <span className="seg-from">{activeLocalSeg?.fromName}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                    <span className="seg-to">{activeLocalSeg?.toName}</span>
                  </div>
                  <div className="segment-nav-group">
                    <button
                      type="button"
                      className="segment-nav"
                      onClick={() => moveLocal(-1)}
                      disabled={activeLocalIdx === 0}
                      aria-label="Previous segment"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <p className="segment-counter">
                      {localSegments.length === 0 ? '0 / 0' : `${activeLocalIdx + 1} / ${localSegments.length}`}
                    </p>
                    <button
                      type="button"
                      className="segment-nav"
                      onClick={() => moveLocal(1)}
                      disabled={activeLocalIdx === localSegments.length - 1}
                      aria-label="Next segment"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  </div>
                </div>

                {/* Day label */}
                <p className="seg-day-label">Day {(activeLocalSeg?.dayIndex ?? 0) + 1}</p>

                {/* Options */}
                <div className="tr-local-options">
                    {activeLocalSeg.loading ? (
                      <LoadingCards />
                    ) : (
                      activeLocalSeg.options.map((opt) => (
                        <LocalSegmentCard
                          key={opt.id}
                          option={opt}
                          selected={localSelection[activeLocalSeg.id] === opt.id}
                          onSelect={() => setLocalSelection(prev => ({ ...prev, [activeLocalSeg.id]: opt.id }))}
                        />
                      ))
                    )}
                </div>

                {/* Dots */}
                <div className="segment-dots" aria-label="Segment navigation">
                  {localSegments.map((seg, idx) => (
                    <button
                      key={seg.id}
                      type="button"
                      className={`segment-dot ${idx === activeLocalIdx ? 'is-active' : ''}`}
                      onClick={() => setActiveLocalIdx(idx)}
                      aria-label={`Segment ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/*  Sticky footer  */}
      <div className="tr-footer">
        <button className="btn btn-ghost" onClick={handleSkip}>
          Skip Transport
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
