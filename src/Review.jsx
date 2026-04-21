import { useState } from 'react'
import './Review.css'

function Day({dayIndex, attractions, onDragStart, onDragOver, onDrop}) {
    return (
        <section class = "day-card">
            <h2> Day {dayIndex + 1} ! </h2>
            <ol class="attractions-container">
                { attractions.map ( (attraction, index) => {
                    return <Attraction // dont forget to add keys to each attraction
                        name={attraction}
                        index={index}
                        dayIndex={dayIndex}
                        onDragStart={onDragStart}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        description="desc" 
                    />
                } )}
            </ol>
        </section>
    )
}

function Attraction({name, index, dayIndex, onDragStart, onDragOver, onDrop, description}) {
    return (
        <li
        draggable="true"
        onDragStart={(e) => onDragStart(e, index, dayIndex)}
        onDragOver={(e) => onDragOver(e)}
        onDrop={(e) => onDrop(e, index, dayIndex)}
        >
            <div class="attraction-title"> Attraction {name} !</div>
            <p> Description {description} </p>
        </li>
    )
}

function Review() {
    // this receives a list of attractions and restaurants
    // and it has to split it between multiple days

    const [attractions, setAttractions] = useState([
        ["cool", "super-cool", "mega-cool"],
        ["ultra-cool", "immensely-cool"]
    ]);
    
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
                        key={day}
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