import { useState } from 'react'
import './Review.css'

function Day({name}) {
    let attractions = ["cool", "super-cool", "mega-cool"];
    return (
        <section class = "day-card">
            <h2> Day {name} ! </h2>
            <ul class="attractions-container">
                { attractions.map ( (attraction) => {
                    return <Attraction 
                        name={attraction} description="desc" 
                    />
                } )}
            </ul>
        </section>
    )
}

function Attraction(props) {
    return (
        <li>
            <div class="attraction-title"> Attraction {props.name} !</div>
            <p> Description {props.description} </p>
        </li>
    )
}

function Review() {
    let days = [1, 2, 3];
    return (
        <main>
            <h1>Review Trip Details</h1>
            <div class="days-container">
                { days.map( (day) => {
                    return <Day key={day} name={day} />
                }) }
            </div>
        </main>
    )
}

export default Review