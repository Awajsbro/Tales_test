import { useState, useEffect } from "react"
import '../styles/App.css';

function Home({ peoples, teams, changeHandler }) {
    const [editedTeams, setEditedTeams] = useState([])
    const [editedPeoples, setEditedPeoples] = useState([])

    useEffect(() => {
        setEditedTeams(teams)
        setEditedPeoples(peoples)
    }, [teams, peoples])

    const editTeams = (e, index) => {
        const teamsToUpdate = JSON.parse(JSON.stringify(editedTeams))

        if (e.target.name === "name")
            teamsToUpdate[index].name = e.target.value
        else {
            const peoplesToUpdate = JSON.parse(JSON.stringify(editedPeoples))
            const indexPeopleToAdd = editedPeoples.findIndex(people => people._id === e.target.value)
            let i

            if (e.target.name === "Stagiaire") {
                i = peoplesToUpdate.findIndex(people => people._id === editedTeams[index]?.apprentice?._id)
                teamsToUpdate[index].apprentice = editedPeoples[indexPeopleToAdd]
            } else if (e.target.name === "Collaborateur 1") {
                i = peoplesToUpdate.findIndex(people => people._id === editedTeams[index]?.worker?.[0]?._id)
                teamsToUpdate[index].worker[0] = editedPeoples[indexPeopleToAdd]
            } else {
                i = peoplesToUpdate.findIndex(people => people._id === editedTeams[index]?.worker?.[1]?._id)
                teamsToUpdate[index].worker[1] = editedPeoples[indexPeopleToAdd]
            }

            if (i >= 0)
                peoplesToUpdate[i].team = null
            peoplesToUpdate[indexPeopleToAdd].team = teams[index]
            setEditedPeoples(peoplesToUpdate)
        }
        setEditedTeams(teamsToUpdate)
    }

    const generateSelect = (name, index, selected, post) => {
        return <div>
            <span>{name} : </span>
            <select name={name}
                onChange={e => editTeams(e, index)}
            >
                <option value={selected?._id}>
                    {selected ? `${selected.firstName} ${selected.lastName}` : "personne d'assigner a ce poste"}
                </option>
                {editedPeoples.map((people, i) => {
                    if (people.job !== post || people.team?._id)
                        return null
                    return <option key={i} value={people._id}>
                        {`${people.firstName} ${people.lastName}`}
                    </option>
                })}
            </select>
        </div>
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
                {generateSelect("Collaborateur 1", i, worker?.[0], "worker")}
                {generateSelect("Collaborateur A", i, worker?.[1], "worker")}
                {generateSelect("Stagiaire", i, apprentice, "apprentice")}

            </div>
        })}
        <input type="button" value="sauvegarder" className="homeSaveButton" onClick={() => changeHandler(editedTeams, editedPeoples)} />
    </div>
}

export default Home;
