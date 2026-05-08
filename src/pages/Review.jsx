import { use, useState } from 'react'
import AttractionCard from '../components/AttractionCard'
import './Review.css'
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom'

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
    const [tripDetails, setTripDetails] = useOutletContext();
        
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

    console.log(attractions)
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

    return (
        <main className="review-page">
            <h1>Review Trip Details</h1>
            
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
                >
                    Edit
                </button>
                <button 
                    className="btn-primary" 
                    onClick={() => routerNavigate('/')}
                >
                    Create My Journey
                </button>
            </div>
        </main>
    )
}

export default Review