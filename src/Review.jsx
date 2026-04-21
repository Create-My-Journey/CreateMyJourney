import { useState } from 'react'
import heroImg from './assets/hero.png'
import './Review.css'

function Day({dayIndex, attractions, onDragStart, onDragOver, onDrop}) {
    return (
        <section class = "day-card">
            <h2> 🛈 Day {dayIndex + 1}</h2>
            <ol class="attractions-container">
                { attractions.map ( (attraction, index) => {
                    return <Attraction // dont forget to add keys to each attraction
                        name={attraction['name']}
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

function Attraction({name, index, dayIndex, onDragStart, onDragOver, onDrop, description}) {
    return (
        <li
        draggable="true"
        onDragStart={(e) => onDragStart(e, index, dayIndex)}
        onDragOver={(e) => onDragOver(e)}
        onDrop={(e) => onDrop(e, index, dayIndex)}
        >
            <div class="li-container">
                <div class="text">
                    <h3 class="attraction-title"> {name}</h3>
                    <p> {description} </p>
                </div>
                <div class="attraction-image">
                    <img src = {heroImg} className="list-image" alt="Attraction Image"></img>
                </div>
            </div>
        </li>
    )
}

function Review() {
    // this receives a list of attractions and restaurants
    // and it has to split it between multiple days

    const [attractions, setAttractions] = useState([
    [
        { 
        name: "Shibuya Crossing", 
        description: "The world's busiest pedestrian intersection, surrounded by bright neon lights and giant screens." 
        },
        { 
        name: "Meiji Jingu Shrine", 
        description: "A serene Shinto shrine dedicated to Emperor Meiji, located in a lush forest in the heart of the city." 
        },
        { 
        name: "Takeshita Street", 
        description: "The epicenter of Tokyo's teenage street fashion and quirky snacks like giant colorful cotton candy." 
        }
    ],
    [
        { 
        name: "Senso-ji Temple", 
        description: "Tokyo's oldest and most significant Buddhist temple, featuring the iconic red Kaminarimon Gate." 
        },
        { 
        name: "Tokyo Skytree", 
        description: "The tallest structure in Japan, offering breathtaking 360-degree views of the entire Kanto region." 
        }
    ],
    [
        { 
        name: "teamLab Planets", 
        description: "An immersive digital art museum where you walk through water and interact with light installations." 
        }
    ]
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