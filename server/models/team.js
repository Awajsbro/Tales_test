const mongoose = require("mongoose")
const Schema = mongoose.Schema

const TeamSchema = new Schema({
    name: String,
    lead: { type: "ObjectId", ref: "people" },
    worker: [{ type: "ObjectId", ref: "people" }],
    apprentice: { type: "ObjectId", ref: "people" },

})

const Team = mongoose.model("team", TeamSchema)

module.exports = Team