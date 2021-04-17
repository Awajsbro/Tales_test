import { request, gql } from 'graphql-request'
const GetData = gql`
    {
        getPeoples {
            _id
            firstName
            lastName
            email
            job
            team {
                _id
                name
            }
        }
        getTeams {
            _id
            name
            lead {
                _id
                firstName
                lastName
                email
                job
            }
            worker {
                _id
                firstName
                lastName
                email
                job
            }
            apprentice {
                _id
                firstName
                lastName
                email
                job
            }
        }
    }
`

const AddPeople = gql`
    mutation addPeople($firstName: String!, $lastName: String!, $email: String!, $job: String!) {
        addPeople(firstName: $firstName, lastName: $lastName, email: $email, job: $job) {
            _id
            team {
                _id
                name
                lead {
                    _id
                }
                worker {
                    _id
                }
                apprentice {
                    _id
                }
            }
        }
    }
`

const EditPeople = gql`
    mutation editPeople($_id: String!, $firstName: String, $lastName: String, $email: String, $job: String) {
        editPeople(_id: $_id, firstName: $firstName, lastName: $lastName, email: $email, job: $job) {
            _id
            firstName
            lastName
            email
            job
            team {
                _id
            }
        }
    }
`

const EditTeams = gql`
    mutation editTeams($input: [TeamInput]) {
        editTeams(input: $input) {
            _id
        }
    }
`


export const getInit = () => {
    return request('http://localhost:4000/graphql', GetData)
}


export const sendPeopleDB = (people, teams) => {
    if (people._id) {
        return syncEditPeople(people, teams)
    }
    return syncAddPeople(people, teams)
}

const syncEditPeople = async (people, teams) => {
    const { editPeople: editedPeople } = await request("http://localhost:4000/graphql", EditPeople, { ...people })
    const indexOldTeam = teams.findIndex(team => team._id === people.team?._id)
    let indexNewTeam = teams.findIndex(team => team._id === editedPeople.team?._id)

    console.log(editedPeople)
    if (editedPeople.job === people.job && editedPeople.team?._id === people.team?._id)
        return [editedPeople]

    if (indexOldTeam !== -1)
        teams[indexOldTeam] = removeInTeam(people, teams[indexOldTeam])

    if (editedPeople.team?._id) {
        if (indexNewTeam === -1)
            teams.push({ _id: editedPeople.team._id, lead: editedPeople, worker: [] })
        else
            teams[indexNewTeam] = addInTeam(editedPeople, teams[indexNewTeam])
    }
    return [editedPeople, teams]
}

const syncAddPeople = async (people, teams) => {
    let { addPeople: addedPeople } = await request("http://localhost:4000/graphql", AddPeople, { ...people })
    const index = teams.findIndex(team => team._id === addedPeople.team?._id)

    addedPeople = {
        ...people,
        ...addedPeople,
    }
    if (!addedPeople.team?._id)
        return [addedPeople]

    if (index === -1)
        teams.push({ _id: addedPeople.team._id, lead: addedPeople, worker: [] })
    else
        teams[index] = addInTeam(addedPeople, teams[index])
    return [addedPeople, teams]
}

const removeInTeam = (people, team) => {
    switch (people._id) {
        case team.apprentice?._id:
            delete team.apprentice
            break
        case team.worker[0]?._id:
            team.worker.splice(0, 1)
            break
        default:
            team.worker.splice(1, 1)
    }
    return team
}

const addInTeam = (people, team) => {
    if (people.job === "apprentice")
        team.apprentice = people
    else
        team.worker.push(people)
    return team
}

export const sendTeamsDB = async (teams, peoples) => {
    teams = teams.map(t => {
        return { ...t, lead: t.lead?._id, worker: [t.worker?.[0]?._id, t.worker?.[1]?._id], apprentice: t.apprentice?._id }
    })
    let { editTeams: editedTeams } = await request("http://localhost:4000/graphql", EditTeams, { input: teams })

    editedTeams = teams.map(team => {
        console.log(team.lead, peoples.find(people => people._id === team.lead))
        return {
            ...team,
            lead: peoples.find(people => people._id === team.lead),
            worker: [
                peoples.find(people => people._id === team.worker?.[0]),
                peoples.find(people => people._id === team.worker?.[1])
            ],
            apprentice: peoples.find(people => people._id === team.apprentice)
        }
    })

    const majPeoples = peoples.map(people => {
        if (people.job === "lead")
            return people
        if (people.job === "apprentice")
            return { ...people, team: editedTeams.find(team => team.apprentice?._id === people._id) }
        return {
            ...people,
            team: editedTeams.find(team => team.worker?.[0]?._id === people._id || team.worker?.[1]?._id === people._id)
        }
    })
    return [editedTeams, majPeoples]
}