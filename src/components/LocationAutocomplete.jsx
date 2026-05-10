import { useState, useRef, useEffect, useId } from 'react'
import { useLocationAutocomplete } from '../hooks/useLocationAutocomplete'
import './LocationAutocomplete.css'

/**
 * Location input with Google Places autocomplete dropdown.
 *
 * Props:
 *   value        {string}            - controlled input value
 *   onChange     {(text) => void}    - called on every keystroke
 *   onSelect     {(description, placeId) => void} - called when user picks a suggestion
 *   error        {string}            - external validation error to show
 *   placeholder  {string}
 */
export default function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  error: externalError,
  placeholder = 'Where to?',
}) {
  const { suggestions, loading, clearSuggestions } = useLocationAutocomplete(value)

  // Index of keyboard-highlighted suggestion (-1 = none)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [open, setOpen]               = useState(false)

  const inputRef     = useRef(null)
  const listRef      = useRef(null)
  const containerRef = useRef(null)
  const listId       = useId()

  // Open dropdown whenever we have suggestions
  useEffect(() => {
    if (suggestions.length > 0) {
      setOpen(true)
      setActiveIndex(-1)
    } else {
      setOpen(false)
    }
  }, [suggestions])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        clearSuggestions()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [clearSuggestions])

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return
    const item = listRef.current.children[activeIndex]
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const handleSelect = (suggestion) => {
    onSelect(suggestion.description, suggestion.placeId)
    clearSuggestions()
    setOpen(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(i => Math.min(i + 1, suggestions.length - 1))
        break

      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(i => Math.max(i - 1, 0))
        break

      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          handleSelect(suggestions[activeIndex])
        }
        break

      case 'Escape':
        setOpen(false)
        clearSuggestions()
        setActiveIndex(-1)
        inputRef.current?.blur()
        break

      default:
        break
    }
  }

  const hasError = Boolean(externalError)

  return (
    <div className="loc-autocomplete" ref={containerRef}>
      <div className={`input-wrapper ${hasError ? 'has-error' : ''}`}>
        <span className="input-icon">📍</span>
        <input
          ref={inputRef}
          className="form-input"
          placeholder={placeholder}
          value={value}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={open ? listId : undefined}
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-item-${activeIndex}` : undefined
          }
          onChange={e => {
            onChange(e.target.value)
          }}
          onKeyDown={handleKeyDown}
        />
        {loading && <span className="loc-spinner" aria-hidden="true" />}
      </div>

      {hasError && <p className="error-text">{externalError}</p>}

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          ref={listRef}
          className="loc-dropdown"
          role="listbox"
          aria-label="Location suggestions"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.placeId}
              id={`${listId}-item-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              className={`loc-item ${i === activeIndex ? 'active' : ''}`}
              onMouseDown={(e) => {
                // prevent input blur before click registers
                e.preventDefault()
                handleSelect(s)
              }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <span className="loc-item-pin" aria-hidden="true">📍</span>
              <span className="loc-item-text">{s.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}