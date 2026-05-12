export function splitItemsEvenlyAcrossDays(items, nights) {
  const dayCount = Math.max(1, Number(nights) || 1)
  const days = Array.from({ length: dayCount }, () => [])

  items.forEach((item, index) => {
    days[index % dayCount].push(item)
  })

  return days
}

export function interleaveDayActivities(dayAttractions, dayRestaurants) {
  const interleaved = []
  const attractions = [...dayAttractions]
  const restaurants = [...dayRestaurants]
  const startWithAttraction = attractions.length >= restaurants.length

  while (attractions.length > 0 || restaurants.length > 0) {
    if (startWithAttraction) {
      if (attractions.length > 0) interleaved.push(attractions.shift())
      if (restaurants.length > 0) interleaved.push(restaurants.shift())
    } else {
      if (restaurants.length > 0) interleaved.push(restaurants.shift())
      if (attractions.length > 0) interleaved.push(attractions.shift())
    }
  }

  return interleaved
}

export function buildDayActivityPlan({ attractions = [], restaurants = [], nights }) {
  const attractionsByDay = splitItemsEvenlyAcrossDays(
    attractions.map((item) => ({ ...item, itemType: 'Attraction' })),
    nights,
  )
  const restaurantsByDay = splitItemsEvenlyAcrossDays(
    restaurants.map((item) => ({ ...item, itemType: 'Restaurant' })),
    nights,
  )

  return attractionsByDay.map((dayAttractions, dayIndex) =>
    interleaveDayActivities(dayAttractions, restaurantsByDay[dayIndex] || []),
  )
}
