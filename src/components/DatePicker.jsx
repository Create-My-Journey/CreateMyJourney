import { useRef, useEffect } from 'react'
import './DatePicker.css'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa']

export default function DatePicker({ value, viewMonth, viewYear, onMonthChange, onYearChange, onChange, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const prevMonth = () => {
    if (viewMonth === 0) { onMonthChange(11); onYearChange(viewYear - 1) }
    else onMonthChange(viewMonth - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { onMonthChange(0); onYearChange(viewYear + 1) }
    else onMonthChange(viewMonth + 1)
  }

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const today       = new Date()

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const isSelected = (d) =>
    d && value &&
    value.getDate() === d &&
    value.getMonth() === viewMonth &&
    value.getFullYear() === viewYear

  const isToday = (d) =>
    d &&
    today.getDate() === d &&
    today.getMonth() === viewMonth &&
    today.getFullYear() === viewYear

  const isPast = (d) =>
    d && new Date(viewYear, viewMonth, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate())

  return (
    <div className="date-picker" ref={ref}>
      <div className="dp-header">
        <button className="dp-nav" onClick={prevMonth} aria-label="Previous month">‹</button>
        <div className="dp-header-center">
          <select
            className="dp-select"
            value={viewMonth}
            onChange={e => onMonthChange(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select
            className="dp-select"
            value={viewYear}
            onChange={e => onYearChange(Number(e.target.value))}
          >
            {Array.from({ length: 10 }, (_, i) => today.getFullYear() + i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button className="dp-nav" onClick={nextMonth} aria-label="Next month">›</button>
      </div>

      <div className="dp-day-names">
        {DAY_NAMES.map(d => <span key={d} className="dp-day-name">{d}</span>)}
      </div>

      <div className="dp-grid">
        {cells.map((d, i) => (
          <button
            key={i}
            disabled={!d || isPast(d)}
            onClick={() => d && !isPast(d) && onChange(new Date(viewYear, viewMonth, d))}
            className={[
              'dp-cell',
              !d          ? 'dp-empty'    : '',
              isSelected(d) ? 'dp-selected' : '',
              isToday(d)    ? 'dp-today'    : '',
              isPast(d)     ? 'dp-past'     : '',
            ].join(' ')}
          >
            {d || ''}
          </button>
        ))}
      </div>
    </div>
  )
}
