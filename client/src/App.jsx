import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { useState, useEffect } from "react"

import SideBar from "./Component/sideBar"
import Home from "./pages/home"
import PeoplesList from "./pages/peoplesList"
import Modal from "./Component/modal"
import './styles/App.css';
import { deletePeopleOnDB, getInit, sendPeopleDB, sendTeamsDB } from "./util"



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
    console.log(people)
    sendPeopleDB(people, teams).then(ret => {

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

  const teamsChangeHandler = (teamsChange, peoplesChange) => {
    setTeams(teamsChange)
    setPeoples(peoplesChange)
    sendTeamsDB(teamsChange, peoplesChange)
  }

  const deletePeopleHandler = async (people) => {
    const peoplesCpy = JSON.parse(JSON.stringify(peoples))
    const teamsCpy = JSON.parse(JSON.stringify(teams))

    const { deletePeople: ret } = await deletePeopleOnDB(people)

    ret.forEach(peopleTeamless => {
      console.log(peopleTeamless)
      const indexPeople = peoplesCpy.findIndex(peopleCpy => peopleCpy._id === peopleTeamless)
      peoplesCpy[indexPeople].team = null
    })

    if (people.team) {
      const indexTeam = teamsCpy.findIndex(teamCpy => teamCpy._id === people.team._id)
      if (people.job === "apprentice")
        teamsCpy[indexTeam].apprentice = null
      else if (people.job === "worker")
        teamsCpy[indexTeam].worker = teamsCpy[indexTeam].worker.filter(worker => worker._id !== people._id)
      else
        teamsCpy.splice(indexTeam, 1)
      setTeams(teamsCpy)
    }

    const indexPeople = peoplesCpy.findIndex(peopleCpy => peopleCpy._id === people._id)
    peoplesCpy.splice(indexPeople, 1)
    setPeoples(peoplesCpy)
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
            <Route exact path="/"><Home peoples={peoples} teams={teams} changeHandler={teamsChangeHandler} /></Route>
            <Route path="/peoples"><PeoplesList peoples={peoples} modalHandler={setModal} deleteHanlder={deletePeopleHandler} /></Route>
            {/* <Route path="/reorder"><ReorderTeams /></Route> */}
          </Switch>
        </div>
        {modal ? <Modal peopleHandler={editPeoples} people={modal} /> : null}
      </div>
    </Router>
  )
}

export default App;
