import { createContext } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { useState, useEffect } from "react";
import './ChooseJourney.css'

export default function ChooseJourney() {
    const location = useLocation()

    // initialize either from storage or from the location state
    const [tripData, setTripData] = useState(() => {
        const saved = sessionStorage.getItem("active_trip");
        return saved ? JSON.parse(saved) : (location.state || {});
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