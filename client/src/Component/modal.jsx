import { useState } from "react"

const Modal = ({ peopleHandler, people }) => {
    const [firstName, setFirstName] = useState(people?.firstName ?? "")
    const [lastName, setLastName] = useState(people?.lastName ?? "")
    const [email, setEmail] = useState(people?.email ?? "")
    const [job, setJob] = useState(people?.job ?? "apprentice")
    const [promote, setPromote] = useState(false)


    const sendPeople = () => {
        if (firstName === "" || lastName === "" || email === "")
            return

        let jobToSet = job
        if (promote)
            jobToSet = people.job === "apprentice" ? "worker" : "lead"

        peopleHandler({
            ...people,
            firstName,
            lastName,
            email,
            job: jobToSet
        })
    }


    return <div className="modalBody">
        <div className="modalLeftColumn">
            <div>
                <span>Prenom : </span>
                <input type="text"
                    autoFocus
                    placeholder="Prenom"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                />
            </div>
            <div>
                <span>Nom : </span>
                <input type="text"
                    placeholder="Nom"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                />
            </div>
            <div>
                <span>Email : </span>
                <input type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
            </div>
        </div>
        <select name="job"
            className="modalSelecter"
            value={job}
            disabled={people._id}
            onChange={e => setJob(e.target.value)}
        >
            <option value="apprentice">Stagiaire</option>
            <option value="worker">Collaborateur</option>
            <option value="lead">Lead</option>
        </select>

        {people?._id ? <div className="modalCheckboxWrapper">
            <span className={people.job === "lead" ? "modalTextPromote" : null}>Promouvoir : </span>
            <input type="checkbox"
                value={promote}
                disabled={people.job === "lead"}
                onChange={() => setPromote(!promote)}
            />
        </div>
            : null}

        <input type="button"
            value={people._id ? "sauvegarder" : "creer"}
            onClick={() => sendPeople()}
            className="modalSendBotton"
        />
    </div>
}

export default Modal