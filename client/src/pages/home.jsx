import { useState, useEffect } from "react"
import '../styles/App.css';

function Home({ peoples, teams, teamsHandler }) {
    const [editedTeams, setEditedTeams] = useState([])

    useEffect(() => {
        setEditedTeams(teams)
    }, [teams])

    const editTeams = (e, i) => {
        setEditedTeams(() => {
            return editedTeams.map((team, index) => {
                if (i !== index)
                    return team
                if (e.target.name === "name")
                    return { ...team, name: e.target.value }

                const targetPeople = peoples.find(people => people._id === e.target.value)
                if (e.target.name === "worker1")
                    return { ...team, worker: [targetPeople, team.worker[1]] }
                if (e.target.name === "workerA")
                    return { ...team, worker: [team.worker[0], targetPeople] }
                return { ...team, apprentice: targetPeople }
            })
        })
    }

    return <div className="mainBody">
        {editedTeams.map((team, i) => {
            const { _id, name, lead, worker, apprentice } = team

            return <div key={i} className="teamCardBody">
                <div>
                    <h3>Equipe : </h3>
                    <input name="name" type="text" value={name ?? ""} placeholder={_id} onChange={e => editTeams(e, i)} />
                </div>
                <span> Lead : {`${lead?.firstName} ${lead?.lastName}`}</span>

                <div>
                    <span>Collaborateur 1 : </span>
                    <select name="worker1"
                        onChange={e => editTeams(e, i)}
                    >
                        <option value={worker?.[0]?._id}>
                            {worker?.[0] ? `${worker[0].firstName} ${worker[0].lastName}` : "personne d'assigner a ce poste"}
                        </option>
                        {peoples.map((people, i) => {
                            if (people.job !== "worker" || people.team?._id)
                                return null
                            return <option key={i} value={people._id}>
                                {`${people.firstName} ${people.lastName}`}
                            </option>
                        })}
                    </select>
                </div>
                <div>
                    <span>Collaborateur A : </span>
                    <select name="workerA"
                        onChange={e => editTeams(e, i)}
                    >
                        <option value={worker?.[1]?._id}>
                            {worker?.[1] ? `${worker[1].firstName} ${worker[1].lastName}` : "personne d'assigner a ce poste"}
                        </option>
                        {peoples.map((people, i) => {
                            if (people.job !== "worker" || people.team?._id)
                                return null
                            return <option key={i} value={people._id}>
                                {`${people.firstName} ${people.lastName}`}
                            </option>
                        })}
                    </select>
                </div>
                <div>
                    <span>Stagiaire : </span>
                    <select name="apprentice"
                        onChange={e => editTeams(e, i)}
                    >
                        <option value={apprentice?._id}>
                            {apprentice ? `${apprentice.firstName} ${apprentice.lastName}` : "aucun"}
                        </option>
                        {peoples.map((people, i) => {
                            if (people.job !== "apprentice" || people.team?._id)
                                return null
                            return <option key={i} value={people._id}>
                                {`${people.firstName} ${people.lastName}`}
                            </option>
                        })}
                    </select>
                </div>

            </div>
        })}
        <input type="button" value="sauvegarder" className="homeSaveButton" onClick={() => teamsHandler(editedTeams)} />
    </div>
}

export default Home;
