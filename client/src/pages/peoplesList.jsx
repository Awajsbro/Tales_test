import { useState, useEffect } from "react"

const PeoplesList = ({ peoples, modalHandler, deleteHanlder }) => {
    const [filtedPeoples, setFiltedPeoples] = useState(peoples)
    const [firstNameFilter, setFirstNameFilter] = useState("")
    const [lastNameFilter, setLastNameFilter] = useState("")
    const [jobFilter, setJobFilter] = useState("")
    const [haveTeamFilter, setHaveTeamFilter] = useState(0)


    useEffect(() => {
        const firstNameFilterNormalized = firstNameFilter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        const lastNameFilterNormalized = lastNameFilter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

        setFiltedPeoples(peoples.filter(people => {
            const haveTeam = people.team?._id ? 1 : -1
            if ((firstNameFilterNormalized === "" || people.firstName.toLowerCase().includes(firstNameFilterNormalized))
                && (lastNameFilterNormalized === "" || people.lastName.toLowerCase().includes(lastNameFilterNormalized))
                && (jobFilter === "" || people.job === jobFilter)
                && (haveTeamFilter === 0 || haveTeamFilter === haveTeam))
                return people
            return null
        }))
    }, [firstNameFilter, lastNameFilter, jobFilter, peoples, haveTeamFilter])

    const deletePeople = (e, people) => {
        e.stopPropagation()
        deleteHanlder(people)
    }


    return <div className="peoplesListBody">
        <div className="peoplesListFilterField">
            <div>
                <span>Prenom : </span>
                <input type="text"
                    placeholder="Filtrer les prenoms"
                    value={firstNameFilter}
                    onChange={e => setFirstNameFilter(e.target.value)}
                />
            </div>
            <div>
                <span>Nom : </span>
                <input type="text"
                    placeholder="Filtrer les noms"
                    value={lastNameFilter}
                    onChange={e => setLastNameFilter(e.target.value)}
                />
            </div>
            <div>
                <span>Job : </span>
                <select name="job"
                    value={jobFilter}
                    onChange={e => setJobFilter(e.target.value)}
                >
                    <option value=""></option>
                    <option value="lead">Lead</option>
                    <option value="worker">Collaborateur</option>
                    <option value="apprentice">Stagiaire</option>
                </select>
            </div>
            <div>
                <span>en equipe : </span>
                <select name="team"
                    value={haveTeamFilter}
                    onChange={e => setHaveTeamFilter(Number.parseInt(e.target.value))}
                >
                    <option value={0}></option>
                    <option value={1}>oui</option>
                    <option value={-1}>non</option>
                </select>
            </div>
            <input type="button"
                value="nouveau collaborateur"
                onClick={() => modalHandler({})}
            />
        </div>

        <div className="peoplesListLegend">
            <span>Prenom</span>
            <span>Nom</span>
            <span>email</span>
            <span>job</span>
            <span>equipe</span>
            <span>renvoyer</span>
        </div>

        {filtedPeoples.map((people, i) => {
            if (people.firstName.toLowerCase().includes(firstNameFilter))
                return <div key={i}
                    onClick={() => modalHandler(people)}
                    className="peoplesListData"
                >
                    <span>{people.firstName}</span>
                    <span>{people.lastName}</span>
                    <span>{people.email}</span>
                    <span>{people.job === "lead" ? "lead" : people.job === "worker" ? "collaborateur" : "stagiaire"}</span>
                    <span>{people.team ? "oui" : "non"}</span>
                    <span>
                        <input type="button"
                            value="X"
                            className="peoplesListDataDeleteButon"
                            onClick={e => deletePeople(e, people)}
                        />
                    </span>
                </div>
            return null
        })}
    </div>
}

export default PeoplesList