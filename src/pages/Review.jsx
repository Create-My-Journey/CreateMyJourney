import { useState } from 'react'
import heroImg from '../assets/hero.png'
import './Review.css'

function Day({dayIndex, attractions, onDragStart, onDragOver, onDrop}) {
    return (
        <section class = "day-card">
            <h2> 🛈 Day {dayIndex + 1}</h2>
            <ol class="attractions-container">
                { attractions.map ( (attraction, index) => {
                    return <Attraction // dont forget to add keys to each attraction
                        name={attraction['name']}
                        imageUrl={attraction['image']}
                        index={index}
                        dayIndex={dayIndex}
                        onDragStart={onDragStart}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        description={attraction['description']} 
                    />
                } )}
            </ol>
        </section>
    )
}

function Attraction({name, index, dayIndex, imageUrl, onDragStart, onDragOver, onDrop, description}) {
    return (
        <li
        draggable="true"
        onDragStart={(e) => onDragStart(e, index, dayIndex)}
        onDragOver={(e) => onDragOver(e)}
        onDrop={(e) => onDrop(e, index, dayIndex)}
        >
            <div class="li-container">
                <div class="text-container">
                    <h3 class="attraction-title"> {name}</h3>
                    <p> {description} </p>
                </div>
                <div class="attraction-image">
                    <img src = {imageUrl} className="list-image" alt="Attraction Image"></img>
                </div>
            </div>
        </li>
    )
}

function Review( { attractionList, trip, user }) {
    // this receives a list of attractions and restaurants
    // and it has to split it between multiple days

    console.log(attractionList);
    
    // split the attraction between the days
    const splitDays = [];
    const itemsPerDay = Math.ceil(attractionList.length / trip['nights']);
    for (let i = 0; i < trip['nights']; i++) {
        const start = i * itemsPerDay;
        const end = start + itemsPerDay;
        splitDays.push(attractionList.slice(start, end));
    }

    const [attractions, setAttractions] = useState(splitDays);
    
    const [draggedItem, setDraggedItem] = useState(null);

    const handleDragStart = (e, index, dayIndex) => {
        // store the data of the dragged item
        const data = {
            attractionIndex: index,
            dayIndex: dayIndex
        };
        setDraggedItem(data)
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, targetIndex, targetDayIndex) => {
        e.preventDefault();

        // create a copy of the list of attractions for the target day
        const newList = [...attractions];

        console.log(targetDayIndex);
        console.log(draggedItem['dayIndex']);
        
        // remove the selected attraction from the initial position
        const removedAttraction = newList[draggedItem['dayIndex']].splice(draggedItem['attractionIndex'], 1);

        // add it to the new position
        newList[targetDayIndex].splice(targetIndex, 0, removedAttraction[0]);

        setAttractions(newList);
        setDraggedItem(null);
    };

    return (
        <main>
            <h1>Review Trip Details</h1>
            <div class="days-container">
                { attractions.map( (day, index) => {
                    return <Day
                        key={index}
                        dayIndex={index}
                        attractions={day}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    />
                }) }
            </div>
        </main>
    )
}

export default Review