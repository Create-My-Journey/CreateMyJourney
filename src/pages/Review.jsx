import { useState, useEffect } from 'react'
import AttractionCard from '../components/AttractionCard'
import './Review.css'
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom'
import { createItinerary, updateItinerary, deleteItinerary, saveReviewSelections, toIsoDate, getAccommodations, getRestaurants, getAttractions, getTransport, deleteItineraryContent } from '../services/databaseApi'

function Day({dayIndex, attractions, onDragStart, onDragOver, onDrop}) {
    return (
        <section className="day-card">
            <h2> 🛈 Day {dayIndex + 1}</h2>
            <ol className="attractions-container">
                { attractions.map((attraction, index) => {
                    return <Attraction 
                        key={attraction.id || index} // Added key here
                        index={index}
                        dayIndex={dayIndex}
                        onDragStart={onDragStart}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        attraction={attraction}
                    />
                })}
            </ol>
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
    
    // Load existing selections when editing an itinerary (but only if not already loaded from context)
    useEffect(() => {
        if (!tripDetails.itinerary_id) {
            setIsLoading(false);
            return;
        }

        // If selections already exist in context (from editing), don't load from DB
        const hasUserSelections = (tripDetails.accommodation && tripDetails.accommodation.length > 0) ||
                                  (tripDetails.restaurants && tripDetails.restaurants.length > 0) ||
                                  (tripDetails.attractions && tripDetails.attractions.length > 0) ||
                                  (tripDetails.transport && tripDetails.transport.length > 0);

        if (hasUserSelections) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const loadExistingSelections = async () => {
            try {
                const [accommodations, restaurants, attractions, transport] = await Promise.all([
                    getAccommodations(tripDetails.itinerary_id),
                    getRestaurants(tripDetails.itinerary_id),
                    getAttractions(tripDetails.itinerary_id),
                    getTransport(tripDetails.itinerary_id),
                ]);

                setTripDetails(prev => ({
                    ...prev,
                    accommodation: accommodations.map(a => ({
                        id: a.place_id,
                        name: a.name,
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
                    })),
                    restaurants: restaurants.map(r => ({
                        id: r.place_id,
                        name: r.name,
                        type: r.cuisine_type,
                        price: r.price_level,
                        rating: r.rating || 0,
                        image: r.photo_url,
                        description: r.notes || '',
                        address: r.address,
                        category: r.cuisine_type || 'Restaurant',
                        hours: r.address || '',
                        tags: r.cuisine_type ? [r.cuisine_type] : ['restaurant'],
                    })),
                    attractions: attractions.map(a => ({
                        id: a.place_id,
                        name: a.name,
                        category: a.category,
                        rating: a.rating || 0,
                        image: a.photo_url,
                        description: a.notes || '',
                        suggested_duration_mins: a.suggested_duration_mins,
                        address: a.address,
                        price: '',
                        hours: a.address || '',
                        tags: a.category ? [a.category] : ['attraction'],
                    })),
                    transport: transport.map(t => ({
                        id: t.id,
                        option_id: t.booking_reference ?? null,
                        name: `${t.origin_id} to ${t.destination_id}`,
                        hours: `${t.origin_id} -> ${t.destination_id}`,
                        type: t.vehicle_type,
                        price: t.price || '',
                        tags: [t.vehicle_type],
                        notes: t.notes,
                        category: t.vehicle_type,
                        rating: 0,
                        description: t.notes || '',
                        image: '',
                    })),
                }));
            } catch (err) {
                console.error('Failed to load existing selections:', err);
                setSaveError('Failed to load existing itinerary selections.');
            } finally {
                setIsLoading(false);
            }
        };

        loadExistingSelections();
    }, [tripDetails.itinerary_id]);
        
    console.log(tripDetails)
    const transportList = tripDetails.transport || []
    const accommodationList = tripDetails.accommodation || []
    const restaurantList = tripDetails.restaurants || []
    const attractionList = tripDetails.attractions || []

    // combine all selected items into one itinerary list and annotate their source type
    const itineraryItems = [
        ...transportList.map(item => ({ ...item, itemType: 'Transport' })),
        ...accommodationList.map(item => ({ ...item, itemType: 'Accommodation' })),
        ...restaurantList.map(item => ({ ...item, itemType: 'Restaurant' })),
        ...attractionList.map(item => ({ ...item, itemType: 'Attraction' })),
    ];

    // split itinerary items between the days
    const splitDays = [];
    const nights = Math.max(1, tripDetails.nights || 1);
    const itemsPerDay = Math.ceil(itineraryItems.length / nights);
    for (let i = 0; i < nights; i++) {
        const start = i * itemsPerDay;
        const end = start + itemsPerDay;
        splitDays.push(itineraryItems.slice(start, end));
    }

    const [attractions, setAttractions] = useState(splitDays);
    const [draggedItem, setDraggedItem] = useState(null);

    // Update attractions whenever tripDetails selections change (e.g., after loading existing itinerary)
    useEffect(() => {
        setAttractions(splitDays);
    }, [JSON.stringify(itineraryItems)]);
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
            const departureDate = toIsoDate(tripDetails.date) ?? new Date().toISOString().slice(0, 10);
            const departureBase = new Date(`${departureDate}T00:00:00`);
            const nights = Math.max(1, Number(tripDetails.nights) || 1);
            const returnDateObj = new Date(departureBase);
            returnDateObj.setDate(returnDateObj.getDate() + nights);
            const returnDate = toIsoDate(returnDateObj) ?? departureDate;

            const itineraryUpdate = {
                destination: tripDetails.location ?? 'Unknown destination',
                budget: null,
                departure_date: departureDate,
                return_date: returnDate,
                group_size: Math.max(1, Number(tripDetails.people) || 1),
            };

            let itineraryId = tripDetails.itinerary_id;

            if (itineraryId) {
                // Update existing itinerary: delete old selections, update metadata, then save new selections
                await deleteItineraryContent(itineraryId);
                await updateItinerary(itineraryId, itineraryUpdate);
                await saveReviewSelections(itineraryId, attractions);
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
                await saveReviewSelections(itineraryId, attractions);
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
                    <div className="days-container">
                        { attractions.map((day, index) => (
                            <Day
                                key={index}
                                dayIndex={index}
                                attractions={day}
                                onDragStart={handleDragStart}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
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