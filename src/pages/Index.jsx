import { Link, Form } from "react-router-dom";

export default function Index() {
    return(
    <>
        <h1>Hey!</h1>
        <div class="form-actions">
            <Link to="transport" className="btn btn-primary">Start the journey!</Link>
        </div>
    </>
    )
}