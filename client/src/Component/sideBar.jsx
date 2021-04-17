import { Link } from "react-router-dom"

import "../styles/App.css"

const SideBar = ({ tabHandler }) => {

    return <div className="sideBarBody">
        <Link to="/" className="sideBarElem">Equipes</Link>
        <Link to="/peoples" className="sideBarElem">Personels</Link>
        {/* <Link to="/peoples" className="sideBarElem">Reorganiser</Link> */}
    </div>
}

export default SideBar