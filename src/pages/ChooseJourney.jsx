import { createContext } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { useState, useEffect } from "react";
import './ChooseJourney.css'

export default function ChooseJourney() {
    const location = useLocation()

    const [tripData, setTripData] = useState(() => {
        const saved = sessionStorage.getItem("active_trip");
        const saved_parse = saved ? JSON.parse(saved) : null;

        // If location.state has itinerary_id, this is an edit flow; don't use saved session
        if (location.state && location.state.itinerary_id) {
            return location.state;
        }

        if (saved_parse && location.state != null && location.state.tripId !== saved_parse.tripId) {
            return location.state;
        }

        if (saved_parse) {
            return saved_parse;
        }

    return location.state || {};
    });

    // store the data in session storage each time tripData is changed
    useEffect(() => {
        sessionStorage.setItem("active_trip", JSON.stringify(tripData));
    }, [tripData]);

    return(
        <>
            <div className="sidebar">
                <NavLink className="nav-buttons" to='/'> Home </NavLink>
                <NavLink className="nav-buttons" to='accommodation'> Accommodation </NavLink>
                <NavLink className="nav-buttons" to='attractions'> Attractions </NavLink>
                <NavLink className="nav-buttons" to='restaurants'> Restaurants </NavLink>
                <NavLink className="nav-buttons" to='transport'> Transport </NavLink>
                <NavLink className="nav-buttons" to='review'> Review </NavLink>
            </div>
            <Outlet context={[tripData, setTripData]} />
        </>
    )
}