import { useMemo, useState } from 'react'
import './Transport.css'

const SEGMENTS = [
	{
		id: 'bucharest-to-tokyo-hotel',
		title: 'Bucharest (OTP) -> Hotel Gracery Shinjuku, Tokyo',
		options: [
			{
				id: 'otp-hnd-frankfurt-jr',
				label: '06:10 OTP -> 06:55 HND (next day)',
				description:
					'Lufthansa + ANA, 19h 45m, 1 stop in Frankfurt, then Tokyo Monorail + JR Yamanote to Shinjuku, around $980',
			},
			{
				id: 'otp-nrt-doha-limousine',
				label: '15:40 OTP -> 17:35 NRT (next day)',
				description:
					'Qatar Airways, 20h 55m, 1 stop in Doha, then Narita Express + local line to hotel area, around $910',
			},
			{
				id: 'otp-hnd-istanbul-direct-bus',
				label: '09:30 OTP -> 08:40 HND (next day)',
				description:
					'Turkish Airlines, 17h 10m, 1 stop in Istanbul, then airport limousine bus direct to Shinjuku, around $1040',
			},
		],
	},
	{
		id: 'hotel-to-restaurant',
		title: 'Hotel Gracery Shinjuku -> Ichiran Shibuya (popular ramen)',
		options: [
			{
				id: 'jr-yamanote-direct',
				label: 'JR Yamanote Line via Shibuya Station',
				description: '26 min total, no major transfer, around ¥210, runs every 3-5 minutes',
			},
			{
				id: 'fukutoshin-line-fast-walk',
				label: 'Fukutoshin Line + short walk',
				description: '22 min total, fastest in rush hour, around ¥240, 7 minute walk at end',
			},
			{
				id: 'taxi-door-to-door',
				label: 'Taxi door-to-door',
				description: '18-30 min depending on traffic, no transfers, around ¥2200-¥3100',
			},
		],
	},
	{
		id: 'restaurant-to-hotel-return',
		title: 'Ichiran Shibuya -> Hotel Gracery Shinjuku (return)',
		options: [
			{
				id: 'jr-return-late-evening',
				label: 'JR Yamanote return route',
				description: '24 min average, stable evening schedule, around ¥210',
			},
			{
				id: 'fukutoshin-return',
				label: 'Fukutoshin + station transfer',
				description: '21 min total, 1 short underground transfer, around ¥240',
			},
			{
				id: 'night-taxi',
				label: 'Night taxi route',
				description: '20-35 min, direct to hotel entrance, around ¥2800-¥3600 after 22:00',
			},
		],
	},
]

const TRANSPORT_TYPES = ['Flight', 'Transit', 'Taxi', 'Bus']

export default function Transport({ navigate }) {
	const initialSelection = useMemo(
		() =>
			SEGMENTS.reduce((acc, segment) => {
				acc[segment.id] = segment.options[0]?.id ?? ''
				return acc
			}, {}),
		[],
	)

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

	const activeSegment = SEGMENTS[activeSegmentIndex]

	const moveSegment = (direction) => {
		setActiveSegmentIndex((prev) => {
			const next = prev + direction
			if (next < 0) return 0
			if (next > SEGMENTS.length - 1) return SEGMENTS.length - 1
			return next
		})
	}

	const handleSkip = () => {
		navigate?.('restaurants')
	}

	const handleConfirm = () => {
		const chosenTypes = TRANSPORT_TYPES.filter((type) => selectedTypes[type])
		console.log('Transport selection', {
			selectedBySegment,
			sortBy,
			budget: { min: 0, max: maxBudget },
			chosenTypes,
			minReviews,
		})
		navigate?.('restaurants')
	}

	return (
		<div className="transport-page">
			<main className="transport-shell" aria-label="Transport planner">
				<section className="transport-left">
					<h1 className="transport-title">Choose Transport</h1>
					<p className="transport-subtitle">Demo journey: Bucharest to Tokyo to dinner spot to hotel</p>

					<div className="transport-segments" role="region" aria-label="Trip segments">
						<div className="segment-slider-head">
							<button
								type="button"
								className="segment-nav"
								onClick={() => moveSegment(-1)}
								disabled={activeSegmentIndex === 0}
								aria-label="Previous segment"
							>
								‹
							</button>
							<p className="segment-counter">
								Step {activeSegmentIndex + 1}/{SEGMENTS.length}
							</p>
							<button
								type="button"
								className="segment-nav"
								onClick={() => moveSegment(1)}
								disabled={activeSegmentIndex === SEGMENTS.length - 1}
								aria-label="Next segment"
							>
								›
							</button>
						</div>

						<section className="transport-segment" key={activeSegment.id}>
							<h2 className="segment-title">{activeSegment.title}</h2>
							<div className="segment-options">
								{activeSegment.options.map((option) => {
									const inputId = `${activeSegment.id}-${option.id}`
									return (
										<label className="transport-option" htmlFor={inputId} key={inputId}>
											<input
												id={inputId}
												type="radio"
												name={activeSegment.id}
												checked={selectedBySegment[activeSegment.id] === option.id}
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
						</section>

						<div className="segment-dots" aria-label="Segment navigation">
							{SEGMENTS.map((segment, index) => (
								<button
									type="button"
									key={segment.id}
									className={`segment-dot ${index === activeSegmentIndex ? 'is-active' : ''}`}
									onClick={() => setActiveSegmentIndex(index)}
									aria-label={`Go to segment ${index + 1}`}
								/>
							))}
						</div>
					</div>
				</section>

				<aside className="transport-right" aria-label="Transport filters">
					<div className="filter-group">
						<div className="sort-row">
							<h3>Sort By</h3>
							<span className="sort-icon" aria-hidden="true">^</span>
						</div>
						<select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
							<option value="Best match">Best match</option>
							<option value="Lowest price">Lowest price</option>
							<option value="Fastest">Fastest</option>
							<option value="Fewest transfers">Fewest transfers</option>
						</select>
					</div>

					<div className="filter-group">
						<h3>Filter By</h3>

						<div className="budget-head">
							<span>Total budget cap</span>
							<span>$0-${maxBudget}</span>
						</div>
						<input
							type="range"
							min="0"
							max="2500"
							step="50"
							value={maxBudget}
							onChange={(e) => setMaxBudget(Number(e.target.value))}
						/>
						<p className="filter-description">Includes flights + local rides for this demo itinerary</p>

						<div className="type-filter">
							<p className="filter-label">Type</p>
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

						<div className="review-filter">
							<p className="filter-label">Min provider rating</p>
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
				</aside>
			</main>

			<div className="transport-actions">
				<button className="transport-btn transport-btn-ghost" onClick={handleSkip}>
					Skip Transport
				</button>
				<button className="transport-btn transport-btn-primary" onClick={handleConfirm}>
					Confirm
				</button>
			</div>
		</div>
	)
}
