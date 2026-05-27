import { Link, Form } from "react-router-dom";
import { useContext } from "react";

export default function Index() {
    return(
    <>
        <h1>Let's start by choosing your accommodation!</h1>
        <div class="form-actions">
            <Link to="accommodation" className="btn btn-primary">Begin</Link>
        </div>
    </>
    )
}