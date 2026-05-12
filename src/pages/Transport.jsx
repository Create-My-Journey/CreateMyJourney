import { useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from "react-router-dom";
import { buildDayActivityPlan } from '../services/itinerarySplit'
import './Transport.css'

const buildSegmentOptions = (segmentId, fromName, toName) => ([
	{
		id: `${segmentId}-transit`,
		label: `Transit: ${fromName} -> ${toName}`,
		description: 'Public transport route with transfers if needed. Usually budget-friendly.',
	},
	{
		id: `${segmentId}-taxi`,
		label: `Taxi: ${fromName} -> ${toName}`,
		description: 'Door-to-door ride, typically faster and more convenient for short hops.',
	},
	{
		id: `${segmentId}-bus`,
		label: `Bus: ${fromName} -> ${toName}`,
		description: 'Direct or semi-direct bus option where available.',
	},
])

function buildSegmentsFromDays(days) {
	const segments = []

	days.forEach((dayItems, dayIndex) => {
		for (let i = 0; i < dayItems.length - 1; i += 1) {
			const fromItem = dayItems[i]
			const toItem = dayItems[i + 1]
			const fromName = fromItem?.name || `${fromItem?.itemType || 'Activity'} ${i + 1}`
			const toName = toItem?.name || `${toItem?.itemType || 'Activity'} ${i + 2}`
			const segmentId = `day-${dayIndex + 1}-${i + 1}`

			segments.push({
				id: segmentId,
				dayIndex,
				title: `Day ${dayIndex + 1}: ${fromName} -> ${toName}`,
				fromName,
				toName,
				options: buildSegmentOptions(segmentId, fromName, toName),
			})
		}
	})

	return segments
}

const TRANSPORT_TYPES = ['Flight', 'Transit', 'Taxi', 'Bus']

export default function Transport() {

	const routerNavigate = useNavigate()
	const [tripDetails, setTripDetails] = useOutletContext();
	const dayActivityPlan = useMemo(
		() => tripDetails.dayActivityPlan || buildDayActivityPlan({
			attractions: tripDetails.attractions || [],
			restaurants: tripDetails.restaurants || [],
			nights: tripDetails.nights,
		}),
		[tripDetails.dayActivityPlan, tripDetails.attractions, tripDetails.restaurants, tripDetails.nights],
	)
	const segments = useMemo(() => buildSegmentsFromDays(dayActivityPlan), [dayActivityPlan])

	const initialSelection = segments.reduce((acc, segment, index) => {
		const restored = tripDetails.transport?.[index]?.option_id ?? tripDetails.transport?.[index]?.id
		const existsInSegment = segment.options.some((option) => option.id === restored)
		acc[segment.id] = existsInSegment ? restored : segment.options[0]?.id
		return acc
	}, {});

	console.log(initialSelection)


	const [selectedBySegment, setSelectedBySegment] = useState(initialSelection)
	const [activeSegmentIndex, setActiveSegmentIndex] = useState(0)
	const [sortBy, setSortBy] = useState('Best match')
	const [maxBudget, setMaxBudget] = useState(1800)
	const [selectedTypes, setSelectedTypes] = useState({
		Flight: true,
		Transit: true,
		Taxi: true,
		Bus: false,
	})
	const [minReviews, setMinReviews] = useState(3)

	const updateSegmentSelection = (segmentId, optionId) => {
		setSelectedBySegment((prev) => ({ ...prev, [segmentId]: optionId }))
	}

	const toggleType = (type) => {
		setSelectedTypes((prev) => ({ ...prev, [type]: !prev[type] }))
	}

	const activeSegment = segments[activeSegmentIndex]

	const moveSegment = (direction) => {
		setActiveSegmentIndex((prev) => {
			const next = prev + direction
			if (next < 0) return 0
			if (next > segments.length - 1) return segments.length - 1
			return next
		})
	}

	const handleSkip = () => {
		setTripDetails((prev) => {
			// remove transport in case we dont want it
			const { transport, ...rest } = prev;
			return rest;
		});
		routerNavigate('/journey/review')
	}

	const handleConfirm = () => {
		const chosenTypes = TRANSPORT_TYPES.filter((type) => selectedTypes[type])
		const selectedTransport = segments.map((segment) => {
			const chosenOption = segment.options.find((option) => option.id === selectedBySegment[segment.id])
			if (!chosenOption) return null

			// also store the option id
			return {
				id: `${segment.id}`,
				option_id: chosenOption.id,
				name: chosenOption.label,
				category: 'Transport',
				hours: segment.title,
				price: 'Varies',
				rating: 4.6,
				tags: ['Transport', ...chosenTypes],
				description: chosenOption.description,
				image: null,
				dayIndex: segment.dayIndex,
			}
		}).filter(Boolean)

		console.log('Transport selection', {
			selectedBySegment,
			sortBy,
			budget: { min: 0, max: maxBudget },
			chosenTypes,
			minReviews,
		})

		// add the new information to the trip details
		setTripDetails((prev) => ({
		...prev,
		transport: selectedTransport
		}));
		routerNavigate('/journey/review', { state: { fromTransport: true } })
	}

	return (
		<div className="tr-page">
			{segments.length === 0 ? (
				<div className="places-status" style={{ margin: '2rem auto', maxWidth: '720px' }}>
					<p>Add at least two activities in a day to generate transport segments.</p>
				</div>
			) : null}

			{/* Page Header matching Choose Attractions */}
			<div className="tr-header">
				<span className="tr-eyebrow">Routes are generated from your per-day split activities</span>
				<div className="tr-title-row">
					<h1 className="tr-title">Choose Transport</h1>
				</div>
				<p className="tr-subtitle">
					Select your preferred routes and modes of transport for each leg of the journey.
				</p>
			</div>

			<main className="tr-main" aria-label="Transport planner">
				<section className="tr-content" role="region" aria-label="Trip segments">
					<div className="segment-slider-head">
						<h2 className="segment-title">{activeSegment?.title || 'No segments yet'}</h2>
						<div className="segment-nav-group">
							<button
								type="button"
								className="segment-nav"
								onClick={() => moveSegment(-1)}
								disabled={activeSegmentIndex === 0 || segments.length === 0}
								aria-label="Previous segment"
							>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
							</button>
							<p className="segment-counter">
								{segments.length === 0 ? '0 / 0' : `${activeSegmentIndex + 1} / ${segments.length}`}
							</p>
							<button
								type="button"
								className="segment-nav"
								onClick={() => moveSegment(1)}
								disabled={segments.length === 0 || activeSegmentIndex === segments.length - 1}
								aria-label="Next segment"
							>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
							</button>
						</div>
					</div>

					<div className="segment-options">
						{(activeSegment?.options || []).map((option) => {
							const inputId = `${activeSegment.id}-${option.id}`
							const isSelected = selectedBySegment[activeSegment.id] === option.id;
							
							return (
								<label 
									className={`tr-option-card ${isSelected ? 'is-selected' : ''}`} 
									htmlFor={inputId} 
									key={inputId}
								>
									<input
										id={inputId}
										type="radio"
										name={activeSegment.id}
										checked={isSelected}
										onChange={() => updateSegmentSelection(activeSegment.id, option.id)}
									/>
									<span className="option-copy">
										<span className="option-label">{option.label}</span>
										<span className="option-description">{option.description}</span>
									</span>
								</label>
							)
						})}
					</div>

					<div className="segment-dots" aria-label="Segment navigation">
						{segments.map((segment, index) => (
							<button
								type="button"
								key={segment.id}
								className={`segment-dot ${index === activeSegmentIndex ? 'is-active' : ''}`}
								onClick={() => setActiveSegmentIndex(index)}
								aria-label={`Go to segment ${index + 1}`}
							/>
						))}
					</div>
				</section>

				<aside className="tr-sidebar" aria-label="Transport filters">
					<div className="filter-group">
						<h3>Sort By</h3>
						<div className="select-wrapper">
							<select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
								<option value="Best match">Best match</option>
								<option value="Lowest price">Lowest price</option>
								<option value="Fastest">Fastest</option>
								<option value="Fewest transfers">Fewest transfers</option>
							</select>
							<svg className="select-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
						</div>
					</div>

					<div className="filter-group">
						<h3>Filter By</h3>

						<div className="filter-subgroup">
							<div className="budget-head">
								<span>Total budget cap</span>
								<span>$0 - ${maxBudget}</span>
							</div>
							<input
								type="range"
								min="0"
								max="2500"
								step="50"
								value={maxBudget}
								onChange={(e) => setMaxBudget(Number(e.target.value))}
							/>
								<p className="filter-description">Includes local rides between your selected activities.</p>
						</div>

						<div className="filter-subgroup">
							<p className="filter-label">Type</p>
							<div className="check-group">
								{TRANSPORT_TYPES.map((type) => (
									<label className="check-row" key={type}>
										<input
											type="checkbox"
											checked={selectedTypes[type]}
											onChange={() => toggleType(type)}
										/>
										<span>{type}</span>
									</label>
								))}
							</div>
						</div>

						<div className="filter-subgroup">
							<p className="filter-label">Min provider rating</p>
							<div className="check-group">
								{[3, 4, 5].map((stars) => (
									<label className="check-row" key={stars}>
										<input
											type="radio"
											name="min-reviews"
											checked={minReviews === stars}
											onChange={() => setMinReviews(stars)}
										/>
										<span>{stars}+ stars</span>
									</label>
								))}
							</div>
						</div>
					</div>
				</aside>
			</main>

			{/* Sticky footer actions matching Choose Attractions */}
			<div className="tr-footer">
				<button className="btn btn-ghost" onClick={handleSkip}>
					Skip Transport
				</button>
				<button className="btn btn-primary" onClick={handleConfirm} disabled={segments.length === 0}>
					Confirm
					<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
						<path d="M3 8h10M9 4l4 4-4 4" />
					</svg>
				</button>
			</div>
		</div>
	)
}
