import { useState } from 'react'
import heroImg from '../assets/hero.png'
import AttractionCard from '../components/AttractionCard'
import './Review.css'

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
          <AttractionCard
            attraction={attraction}
            selected={true}
          />
        </li>
    )
}

function Review( { attractionList = [], restaurantList = [], trip, user }) {
    // this receives a list of attractions and restaurants
    // and it has to split it between multiple days

    console.log(attractionList);
    console.log(restaurantList);

    // combine selected attractions and restaurants into one itinerary list
    const itineraryItems = [...attractionList, ...restaurantList];

    // split itinerary items between the days
    const splitDays = [];
    const nights = Math.max(1, trip?.['nights'] || 1);
    const itemsPerDay = Math.ceil(itineraryItems.length / nights);
    for (let i = 0; i < nights; i++) {
        const start = i * itemsPerDay;
        const end = start + itemsPerDay;
        splitDays.push(itineraryItems.slice(start, end));
    }

    const [attractions, setAttractions] = useState(splitDays);
    const [draggedItem, setDraggedItem] = useState(null);

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

            {/* New Navigation Buttons */}
            <div className="review-footer-actions">
                <button 
                    className="btn-secondary" 
                    onClick={() => navigate('transport')}
                >
                    Edit
                </button>
                <button 
                    className="btn-primary" 
                    onClick={() => navigate('home')}
                >
                    Create My Journey
                </button>
            </div>
        </main>
    )
}

export default Review