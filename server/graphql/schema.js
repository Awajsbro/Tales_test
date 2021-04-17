const { buildSchema } = require("graphql")

const schema = buildSchema(`
    input PeopleInput {
        _id: String
        firstName: String
        lastName: String
        email: String
        job: String
        Team: String
    }

    input TeamInput {
        _id: String
        name: String
        lead: String
        worker: [String]
        apprentice: String
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
        addPeople(firstName: String!, lastName: String!, email: String!, job: String!, team: String): People!
        editPeople(_id: String!, firstName: String, lastName: String, email: String, job: String, team: String): People!
        editTeams(input: [TeamInput]): [Team]
    }
`)

module.exports = schema