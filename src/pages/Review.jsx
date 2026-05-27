import { useState, useEffect } from 'react'
import AttractionCard from '../components/AttractionCard'
import './Review.css'
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom'
import { createItinerary, updateItinerary, deleteItinerary, saveReviewSelections, toIsoDate, getAccommodations, getRestaurants, getAttractions, getTransport, getItinerary, deleteItineraryContent } from '../services/databaseApi'
import { buildDayActivityPlan, splitItemsEvenlyAcrossDays } from '../services/itinerarySplit'
 
function nightsFromDateRange(departureDate, returnDate) {
    if (!departureDate || !returnDate) return null;
    const startMs = new Date(`${departureDate}T00:00:00`).getTime();
    const endMs = new Date(`${returnDate}T00:00:00`).getTime();
    if (Number.isNaN(startMs) || Number.isNaN(endMs)) return null;
    const diffDays = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
}
 
function toLocalIsoDate(value) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
 
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
 
function parseSavedOrderMetadata(notes) {
    const match = String(notes ?? '').match(/^\[day:(\d+),order:(\d+)\]\s*(.*)$/)
 
    if (!match) {
        return {
            dayIndex: null,
            orderIndex: null,
            noteText: String(notes ?? ''),
        }
    }
 
    return {
        dayIndex: Number.parseInt(match[1], 10) - 1,
        orderIndex: Number.parseInt(match[2], 10) - 1,
        noteText: match[3] ?? '',
    }
}
function buildSavedDayActivityPlan({ attractions = [], restaurants = [], transport = [] }) {
    const dayMap = new Map()
 
    const pushItem = (item) => {
        const dayIndex = Number.isInteger(item.dayIndex) ? item.dayIndex : 0
        const orderIndex = Number.isInteger(item.orderIndex) ? item.orderIndex : Number.MAX_SAFE_INTEGER
        if (!dayMap.has(dayIndex)) {
            dayMap.set(dayIndex, [])
        }
        dayMap.get(dayIndex).push({ ...item, orderIndex })
    }
 
    attractions.forEach(pushItem)
    restaurants.forEach(pushItem)
    transport.forEach(pushItem)
 
    const maxDayIndex = Math.max(-1, ...Array.from(dayMap.keys()))
    return Array.from({ length: Math.max(1, maxDayIndex + 1) }, (_, dayIndex) =>
        (dayMap.get(dayIndex) || []).sort((left, right) => left.orderIndex - right.orderIndex),
    )
}
 
function formatTransportLabel(vehicleType, origin, destination) {
    const type = String(vehicleType ?? 'Transport').trim()
    const readableType = type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Transport'
    return `${readableType}: ${origin} -> ${destination}`
}
 
function DayMap({ attractions, cityContext }) {
    const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    if (!MAPS_KEY) return null;
 
    // Filter out transport to just pin real places
    const places = attractions.filter(a => a.itemType !== 'Transport');
    if (places.length === 0) return null;
 
    // Google Maps Embed URL for a single place
    if (places.length === 1) {
        const query = encodeURIComponent(`${places[0].name}, ${cityContext}`);
        const url = `https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${query}`;
        return (
            <div className="day-map-container">
                <iframe className="day-map-iframe" src={url} allowFullScreen loading="lazy"></iframe>
            </div>
        );
    }
 
    // Google Maps Embed URL for directions (multiple places)
    const origin = encodeURIComponent(`${places[0].name}, ${cityContext}`);
    const destination = encodeURIComponent(`${places[places.length - 1].name}, ${cityContext}`);
 
    let url = `https://www.google.com/maps/embed/v1/directions?key=${MAPS_KEY}&origin=${origin}&destination=${destination}`;
 
    if (places.length > 2) {
        const waypoints = places.slice(1, -1)
            .map(p => encodeURIComponent(`${p.name}, ${cityContext}`))
            .join('|');
        url += `&waypoints=${waypoints}`;
    }
 
    return (
        <div className="day-map-container">
            <iframe className="day-map-iframe" src={url} allowFullScreen loading="lazy"></iframe>
        </div>
    );
}
 
function Day({dayIndex, attractions, onDragStart, onDragOver, onDrop, cityContext}) {
    return (
        <section className="day-card">
            <h2> 🛈 Day {dayIndex + 1}</h2>
            <div className="day-card-content">
                <ol className="attractions-container">
                    { attractions.map((attraction, index) => {
                        return <Attraction 
                            key={attraction.id || index}
                            index={index}
                            dayIndex={dayIndex}
                            onDragStart={onDragStart}
                            onDragOver={onDragOver}
                            onDrop={onDrop}
                            attraction={attraction}
                        />
                    })}
                </ol>
                <DayMap attractions={attractions} cityContext={cityContext} />
            </div>
        </section>
    )
}
 
function Attraction({attraction, index, dayIndex, onDragStart, onDragOver, onDrop}) {
    return (
        <li
            draggable="true"
            onDragStart={(e) => onDragStart(e, index, dayIndex)}
            onDragOver={(e) => onDragOver(e)}
            onDrop={(e) => onDrop(e, index, dayIndex)}
        >
                    <span className={`item-type-label item-type-${(attraction.itemType || '').toLowerCase()}`}>
                        {attraction.itemType || 'Item'}
                    </span>
          <AttractionCard
            attraction={attraction}
            selected={true}
            onToggleSelect={() => {}}
          />
        </li>
    )
}
 
function Review() {
    // this receives selected items from all previous planner pages
    // and it has to split it between multiple days
    const routerNavigate = useNavigate();
    const location = useLocation();
    const [tripDetails, setTripDetails] = useOutletContext();
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const isFinalReview = location.state?.reviewMode === 'final' || location.state?.fromTransport;
    const showTransportButton = !isFinalReview;
 
    const getCurrentUserId = () => {
        try {
            const rawUser = localStorage.getItem('cmj_user');
            if (!rawUser) return null;
            const parsed = JSON.parse(rawUser);
            const id = Number(parsed?.user_id);
            return Number.isInteger(id) && id > 0 ? id : null;
        } catch {
            return null;
        }
    };
 
    // When opening review directly from Home, hydrate context with the route state.
    useEffect(() => {
        if (!location.state?.itinerary_id) return;
        if (tripDetails?.itinerary_id === location.state.itinerary_id) return;
        setTripDetails((prev) => ({ ...prev, ...location.state }));
    }, [location.state, setTripDetails, tripDetails?.itinerary_id]);
 
    // Load existing selections when editing a saved itinerary.
    useEffect(() => {
        const routeItineraryId = location.state?.itinerary_id ?? null
        if (!routeItineraryId) {
            setIsLoading(false);
            return;
        }
 
        setIsLoading(true);
 
        const loadExistingSelections = async () => {
            try {
                const [accommodations, restaurants, attractions, transport] = await Promise.all([
                    getAccommodations(routeItineraryId),
                    getRestaurants(routeItineraryId),
                    getAttractions(routeItineraryId),
                    getTransport(routeItineraryId),
                ]);
 
                const stripDayPrefix = (s) => String(s ?? '').replace(/^\s*Day\s*\d+:\s*/i, '').trim()
 
                const mappedAccommodations = accommodations.map(a => ({
                    id: a.place_id,
                    name: stripDayPrefix(a.name),
                    itemType: 'Accommodation',
                    type: a.property_type,
                    pricePerNight: a.price_range,
                    rating: a.star_rating || 0,
                    image: a.photo_url,
                    description: a.notes || '',
                    address: a.address,
                    category: a.property_type || 'Accommodation',
                    price: a.price_range,
                    hours: a.address || '',
                    tags: a.property_type ? [a.property_type] : ['accommodation'],
                    ...parseSavedOrderMetadata(a.notes),
                }));
 
                const mappedRestaurants = restaurants.map(r => ({
                    id: r.place_id,
                    itemType: 'Restaurant',
                    name: stripDayPrefix(r.name),
                    type: r.cuisine_type,
                    price: r.price_level,
                    rating: r.rating || 0,
                    image: r.photo_url,
                    description: r.notes || '',
                    address: r.address,
                    category: r.cuisine_type || 'Restaurant',
                    hours: r.address || '',
                    tags: r.cuisine_type ? [r.cuisine_type] : ['restaurant'],
                    ...parseSavedOrderMetadata(r.notes),
                }));
 
                const mappedAttractions = attractions.map(a => ({
                    id: a.place_id,
                    itemType: 'Attraction',
                    name: stripDayPrefix(a.name),
                    category: a.category,
                    rating: a.rating || 0,
                    image: a.photo_url,
                    description: a.notes || '',
                    suggested_duration_mins: a.suggested_duration_mins,
                    address: a.address,
                    price: '',
                    hours: a.address || '',
                    tags: a.category ? [a.category] : ['attraction'],
                    ...parseSavedOrderMetadata(a.notes),
                }));
 
                const mappedTransport = transport.map(t => ({
                    id: t.id,
                    option_id: t.booking_reference ?? null,
                    name: formatTransportLabel(t.vehicle_type, stripDayPrefix(t.origin_id), stripDayPrefix(t.destination_id)),
                    hours: `${stripDayPrefix(t.origin_id)} -> ${stripDayPrefix(t.destination_id)}`,
                    type: t.vehicle_type,
                    itemType: 'Transport',
                    price: t.price || '',
                    tags: [t.vehicle_type],
                    notes: t.notes,
                    category: t.vehicle_type,
                    rating: 0,
                    description: parseSavedOrderMetadata(t.notes).noteText || t.notes || '',
                    image: '',
                    ...parseSavedOrderMetadata(t.notes),
                }));
                const hasSavedOrder = [...mappedAttractions, ...mappedRestaurants, ...mappedTransport].some(i => Number.isInteger(i.dayIndex));
                const dayActivityPlanFromSaved = hasSavedOrder
                    ? buildSavedDayActivityPlan({ attractions: mappedAttractions, restaurants: mappedRestaurants, transport: mappedTransport })
                    : null;
 
                setTripDetails(prev => ({
                    ...prev,
                    itinerary_id: routeItineraryId,
                    accommodation: mappedAccommodations,
                    restaurants: mappedRestaurants,
                    attractions: mappedAttractions,
                    transport: mappedTransport,
                    dayActivityPlan: dayActivityPlanFromSaved || prev.dayActivityPlan,
                }));
            } catch (err) {
                console.error('Failed to load existing selections:', err);
                setSaveError('Failed to load existing itinerary selections.');
            } finally {
                setIsLoading(false);
            }
        };
 
        loadExistingSelections();
    }, [location.state?.itinerary_id, setTripDetails]);
 
    console.log(tripDetails)
    const transportList = tripDetails.transport || []
    const accommodationList = tripDetails.accommodation || []
    const restaurantList = tripDetails.restaurants || []
    const attractionList = tripDetails.attractions || []
    const showTransportInline = isFinalReview
 
    const activityDays = tripDetails.dayActivityPlan || buildDayActivityPlan({
        attractions: attractionList,
        restaurants: restaurantList,
        nights: tripDetails.nights,
    });
 
    const transportItems = transportList.map(item => ({
        ...item,
        itemType: 'Transport',
        dayIndex: Number.isInteger(item.dayIndex) ? item.dayIndex : null,
        orderIndex: Number.isInteger(item.orderIndex) ? item.orderIndex : null,
    }));
    const transportByDay = activityDays.map((_, dayIndex) => transportItems.filter((item) => item.dayIndex === dayIndex));
 
    // Activities only (without transports) for initial review
    const activitiesDays = activityDays.map((dayActivities) => dayActivities);
 
    // If the reconstructed activityDays already include transport items (saved reconstruction),
    // use them as-is. Otherwise, interleave transports into activity lists at saved positions.
    const activityDaysContainTransport = activityDays.some(day => day.some(item => (item.itemType || '').toLowerCase() === 'transport'));
 
    const splitDays = activityDaysContainTransport
        ? activityDays
        : activityDays.map((dayActivities, dayIndex) => {
            const accommodationOffset = dayIndex === 0 ? accommodationList.length : 0;
            const dayTransports = [...(transportByDay[dayIndex] || [])]
                .sort((left, right) => (left.orderIndex ?? Number.MAX_SAFE_INTEGER) - (right.orderIndex ?? Number.MAX_SAFE_INTEGER));
            const result = [];
            let transportCursor = 0;
 
            const pushMatchingTransports = (targetIndex) => {
                while (transportCursor < dayTransports.length) {
                    const transport = dayTransports[transportCursor];
                    const adjustedOrderIndex = Number.isInteger(transport.orderIndex)
                        ? Math.max(0, transport.orderIndex - accommodationOffset)
                        : null;
 
                    if (adjustedOrderIndex !== targetIndex) {
                        break;
                    }
 
                    result.push(transport);
                    transportCursor += 1;
                }
            };
 
            pushMatchingTransports(0);
 
            dayActivities.forEach((activity, activityIndex) => {
                result.push(activity);
                pushMatchingTransports(activityIndex + 1);
            });
 
            while (transportCursor < dayTransports.length) {
                result.push(dayTransports[transportCursor]);
                transportCursor += 1;
            }
 
            return result;
        });
 
    const [attractions, setAttractions] = useState(showTransportInline ? splitDays : activitiesDays);
    const [draggedItem, setDraggedItem] = useState(null);
 
    // Update attractions whenever tripDetails selections change (e.g., after loading existing itinerary)
    useEffect(() => {
        setAttractions(showTransportInline ? splitDays : activitiesDays);
    }, [
        JSON.stringify(transportList),
        JSON.stringify(attractionList),
        JSON.stringify(restaurantList),
        JSON.stringify(accommodationList),
        tripDetails.nights,
        showTransportInline,
    ]);
    const handleDragStart = (e, index, dayIndex) => {
        const data = { attractionIndex: index, dayIndex: dayIndex };
        setDraggedItem(data)
    };
 
    const handleDragOver = (e) => e.preventDefault();
 
    const handleDrop = (e, targetIndex, targetDayIndex) => {
        e.preventDefault();
        const newList = [...attractions];
        const removedAttraction = newList[draggedItem['dayIndex']].splice(draggedItem['attractionIndex'], 1);
        newList[targetDayIndex].splice(targetIndex, 0, removedAttraction[0]);
 
        setAttractions(newList);
        setDraggedItem(null);
    };
 
    const handleCreateJourney = async () => {
        if (isSaving) return;
 
        const userId = getCurrentUserId();
        if (!userId) {
            setSaveError('Please log in before saving a journey.');
            return;
        }
 
        setIsSaving(true);
        setSaveError('');
 
        try {
            const accommodationItems = accommodationList.map((item) => ({
                ...item,
                itemType: 'Accommodation',
            }));
            const daysToSaveBase = showTransportInline ? splitDays : activitiesDays;
            const daysToSave = accommodationItems.length > 0
                ? (daysToSaveBase.length > 0
                    ? daysToSaveBase.map((day, index) => (index === 0 ? [...accommodationItems, ...day] : day))
                    : [accommodationItems])
                : daysToSaveBase;
 
            const existingItinerary = tripDetails.itinerary_id
                ? await getItinerary(tripDetails.itinerary_id)
                : null;
 
            const departureDate = toLocalIsoDate(tripDetails.date)
                ?? toIsoDate(tripDetails.date)
                ?? existingItinerary?.departure_date
                ?? new Date().toISOString().slice(0, 10);
            const departureBase = new Date(`${departureDate}T00:00:00`);
            const persistedNights = nightsFromDateRange(
                existingItinerary?.departure_date,
                existingItinerary?.return_date,
            );
            const nights = Math.max(1, Number(tripDetails.nights) || persistedNights || 1);
            const returnDateObj = new Date(departureBase);
            returnDateObj.setDate(returnDateObj.getDate() + nights);
            const returnDate = toLocalIsoDate(returnDateObj) ?? departureDate;
 
            const itineraryUpdate = {
                destination: tripDetails.location ?? 'Unknown destination',
                budget: null,
                departure_date: departureDate,
                return_date: returnDate,
                group_size: Math.max(1, Number(tripDetails.people) || Number(existingItinerary?.group_size) || 1),
            };
 
            let itineraryId = tripDetails.itinerary_id;
 
            if (itineraryId) {
                // Update existing itinerary: delete old selections, update metadata, then save new selections
                await deleteItineraryContent(itineraryId);
                await updateItinerary(itineraryId, itineraryUpdate);
                await saveReviewSelections(itineraryId, daysToSave);
            } else {
                // Create new itinerary
                const itinerary = await createItinerary({
                    user_id: userId,
                    ...itineraryUpdate,
                });
 
                if (!itinerary?.itinerary_id) {
                    throw new Error('Could not create itinerary.');
                }
 
                itineraryId = itinerary.itinerary_id;
                await saveReviewSelections(itineraryId, daysToSave);
            }
 
            sessionStorage.setItem('last_saved_itinerary_id', String(itineraryId));
            sessionStorage.removeItem('active_trip');
            routerNavigate('/', { state: { savedItineraryId: itineraryId } });
        } catch (err) {
            setSaveError(err.message ?? 'Failed to save itinerary.');
        } finally {
            setIsSaving(false);
        }
    };
 
    const handleDeleteJourney = async () => {
        if (isSaving) return;
        if (!tripDetails.itinerary_id) return;
 
        const confirmed = window.confirm('Delete this itinerary? This action cannot be undone.');
        if (!confirmed) return;
 
        setIsSaving(true);
        setSaveError('');
 
        try {
            await deleteItinerary(tripDetails.itinerary_id);
            sessionStorage.removeItem('active_trip');
            sessionStorage.removeItem('last_saved_itinerary_id');
            routerNavigate('/');
        } catch (err) {
            setSaveError(err.message ?? 'Failed to delete itinerary.');
        } finally {
            setIsSaving(false);
        }
    };
 
    return (
        <main className="review-page">
            <h1>Review Trip Details</h1>
 
            {isLoading && <p>Loading itinerary...</p>}
 
            {!isLoading && (
                <>
                    {accommodationList.length > 0 ? (
                        <section className="accommodation-review-section">
                            <h2>Accommodation</h2>
                            <div className="accommodation-review-list">
                                {accommodationList.map((accommodation, index) => (
                                    <div key={accommodation.id || index}>
                                        <span className="item-type-label item-type-accommodation">
                                            Accommodation
                                        </span>
                                        <AttractionCard
                                            attraction={accommodation}
                                            selected={true}
                                            onToggleSelect={() => {}}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    ) : null}
 
                    <div className="days-container">
                        { attractions.map((day, index) => (
                            <Day
                                key={index}
                                dayIndex={index}
                                attractions={day}
                                onDragStart={handleDragStart}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                cityContext={tripDetails.location || ''}
                            />
                        )) }
                    </div>
 
                    <div className="review-footer-actions">
                        <button 
                            className="btn-secondary" 
                            onClick={() => routerNavigate('/journey/accommodation')}
                            disabled={isSaving}
                        >
                            Edit
                        </button>
                        {showTransportButton && (
                            <button 
                                className="btn-primary" 
                                onClick={() => routerNavigate('/journey/transport')}
                                disabled={isSaving}
                            >
                                Choose Transport
                            </button>
                        )}
                        <button 
                            className="btn-primary" 
                            onClick={handleCreateJourney}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : tripDetails.itinerary_id ? 'Update Journey' : 'Create My Journey'}
                        </button>
                        {tripDetails.itinerary_id ? (
                            <button
                                className="btn-secondary"
                                onClick={handleDeleteJourney}
                                disabled={isSaving}
                            >
                                Delete Journey
                            </button>
                        ) : null}
                    </div>
                </>
            )}
            {saveError ? <p className="places-error-sub">{saveError}</p> : null}
        </main>
    )
}
 
export default Review