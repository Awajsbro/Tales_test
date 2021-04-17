const mongoose = require("mongoose")
const Schema = mongoose.Schema

const PeopleSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    job: String,
    team: { type: "ObjectId", ref: "team" }
})

const People = mongoose.model("people", PeopleSchema)

module.exports = People