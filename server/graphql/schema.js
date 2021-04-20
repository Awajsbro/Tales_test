const { buildSchema } = require("graphql")

const schema = buildSchema(`
    input PeopleInput {
        _id: String
        firstName: String
        lastName: String
        email: String
        job: String
        team: TeamInput
    }

    input TeamInput {
        _id: String
        name: String
        lead: PeopleInput
        worker: [PeopleInput]
        apprentice: PeopleInput
    }

    type People {
        _id: String
        firstName: String
        lastName: String
        email: String
        job: String
        team: Team
    }

    type Team {
        _id: String
        name: String
        lead: People
        worker: [People]
        apprentice: People
    }

    type Query {
        getPeoples: [People]
        getPeople(_id: String!): People
        getTeams: [Team]
        getTeam(_id: String!): Team
    }

    type Mutation {
        addPeople(input: PeopleInput): People!
        editPeople(input: PeopleInput): People!
        editTeams(input: [TeamInput]): [Team]
        deletePeople(_id: String!): [String]
    }
`)

module.exports = schema