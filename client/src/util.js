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
    mutation addPeople($input: PeopleInput) {
        addPeople(input: $input) {
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
    mutation editPeople($input: PeopleInput) {
        editPeople(input: $input) {
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
            lead {
                _id
            }
            worker {
                _id
            }
            apprentice{
                _id
            }
        }
    }
`

const DeletePeople = gql`
    mutation deletePeople($_id: String!) {
        deletePeople(_id: $_id)
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
    console.log(people, "avant requette")
    const { editPeople: editedPeople } = await request("http://localhost:4000/graphql", EditPeople, { input: people })
    const indexOldTeam = teams.findIndex(team => team._id === people.team?._id)
    let indexNewTeam = teams.findIndex(team => team._id === editedPeople.team?._id)

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
    let { addPeople: addedPeople } = await request("http://localhost:4000/graphql", AddPeople, { input: people })
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


export const sendTeamsDB = (teams) => {
    request("http://localhost:4000/graphql", EditTeams, { input: teams })
}

export const deletePeopleOnDB = (people) => {
    return request("http://localhost:4000/graphql", DeletePeople, { _id: people._id })
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
