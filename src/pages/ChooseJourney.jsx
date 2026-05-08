import { createContext } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { useState, useEffect } from "react";

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
            <div id="sidebar">
                <NavLink to='accommodation'> Accommodation </NavLink>
                <NavLink to='attractions'> Attractions </NavLink>
                <NavLink to='restaurants'> Restaurants </NavLink>
                <NavLink to='transport'> Transport </NavLink>
                <NavLink to='review'> Review </NavLink>
            </div>
            <Outlet context={[tripData, setTripData]} />
        </>
    )
}