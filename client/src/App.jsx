import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { useState, useEffect } from "react"

import SideBar from "./Component/sideBar"
import Home from "./pages/home"
import PeoplesList from "./pages/peoplesList"
import Modal from "./Component/modal"
import './styles/App.css';
import { getInit, sendPeopleDB, sendTeamsDB } from "./util"



function App() {
  const [teams, setTeams] = useState([])
  const [peoples, setPeoples] = useState([])
  const [modal, setModal] = useState(false)


  useEffect(() => {
    getInit().then(data => {
      setPeoples(data.getPeoples)
      setTeams(data.getTeams)
    })
  }, [])

  const editPeoples = (people) => {
    sendPeopleDB(people, teams).then(ret => {

      console.log(ret[0])
      if (peoples.find(p => p._id === ret[0]._id)) {
        setPeoples(() => peoples.map(p => {
          if (p._id === ret[0]._id)
            return { ...p, ...ret[0] }
          return p
        }))
      } else
        setPeoples([...peoples, ret[0]])

      if (ret[1])
        setTeams(ret[1])
    })
    setModal(false)
  }

  const editTeams = (teams) => {
    sendTeamsDB(teams, peoples).then(ret => {
      console.log(ret, ret[0])
      setTeams(ret[0])
      setPeoples(ret[1])
    })
  }

  return (
    <Router>
      <div className="App">
        <div
          className={modal ? "bluriedGeneralWrapper" : "generalWrapper"}
          onClick={modal ? () => setModal(false) : null}
        >

          <SideBar />

          <Switch>
            <Route exact path="/"><Home peoples={peoples} teams={teams} teamsHandler={editTeams} /></Route>
            <Route path="/peoples"><PeoplesList peoples={peoples} modalHandler={setModal} promotePeople={editPeoples} /></Route>
            {/* <Route path="/reorder"><ReorderTeams /></Route> */}
          </Switch>
        </div>
        {modal ? <Modal peopleHandler={editPeoples} people={modal} /> : null}
      </div>
    </Router>
  )
}

export default App;
