const mongoose = require("mongoose")

const People = require("../models/people")
const Team = require("../models/team")

const resolver = {
    getPeoples: async () => {
        return await People.find().populate("team")
    },
    getPeople: async ({ _id }) => {
        return await People.findOne({ _id }).populate("team")
    },

    getTeams: async () => {
        return await Team.find((err, res) => res).populate("lead worker apprentice")
    },
    getTeam: async ({ _id }) => {
        return await Team.findOne({ _id }).populate("lead worker apprentice")
    },


    addPeople: async ({ input }) => {
        try {
            const newPeople = new People({
                ...input
            })

            if (input.job === "lead") {
                const newTeam = new Team({ lead: newPeople._id })
                newTeam.save()
                newPeople.team = newTeam
            } else if (input.job === "worker") {
                const futureTeam = await Team.findOne({ $or: [{ worker: { $size: 0 } }, { worker: { $size: 1 } }] })
                if (futureTeam) {
                    futureTeam.worker.push(newPeople._id)
                    futureTeam.save()
                    newPeople.team = futureTeam
                }
            } else {
                let futureTeam = await Team.findOne({ apprentice: { $exists: false } })
                if (futureTeam) {
                    futureTeam.apprentice = newPeople._id
                    futureTeam.save()
                    newPeople.team = futureTeam
                }
            }

            await newPeople.save()
            return newPeople
        } catch (err) {
            console.error(err)
            return false
        }
    },

    editPeople: async ({ input }) => {
        try {
            let toEdit = await People.findOne({ _id: input._id }).populate("team")

            if (!input.job || input.job === toEdit.job) {
                Object.keys(input).forEach(key => {
                    toEdit[key] = input[key]
                })
                await toEdit.save()
                return toEdit
            }

            if (toEdit.team && toEdit.team._id) {
                let oldTeam = await Team.findOne({ _id: toEdit.team._id }).populate("lead worker apprentice")

                if (oldTeam.apprentice && JSON.stringify(toEdit._id) === JSON.stringify(oldTeam.apprentice._id))
                    oldTeam.apprentice = null
                else
                    oldTeam.worker.pull({ _id: toEdit._id })

                if (toEdit.job === "apprentice") {
                    if (oldTeam.worker.length < 2)
                        oldTeam.worker.push(toEdit._id)
                    else {
                        const newTeam = await Team.findOne({ $or: [{ worker: { $size: 0 } }, { worker: { $size: 1 } }] })
                        if (newTeam) {
                            newTeam.worker.push(toEdit._id)
                            newTeam.save()
                            toEdit.team = newTeam._id
                        }
                    }
                }
                await oldTeam.save()
            } else if (toEdit.job === "apprentice") {
                const newTeam = await Team.findOne({ $or: [{ worker: { $size: 0 } }, { worker: { $size: 1 } }] })
                if (newTeam) {
                    newTeam.worker.push(toEdit._id)
                    newTeam.save()
                    toEdit.team = newTeam._id
                }
            }

            if (toEdit.job === "worker") {
                const newTeam = new Team({ lead: toEdit._id, worker: [] })
                toEdit.team = newTeam
                await newTeam.save()
            }

            Object.keys(input).forEach(key => {
                toEdit[key] = input[key]
            })
            await toEdit.save()
            return toEdit

        } catch (err) {
            console.error(err)
            return false
        }
    },

    editTeams: async ({ input }) => {
        try {
            await People.updateMany({}, { team: null })
            const allTeamUpdated = input.map(async team => {
                const teamUpdated = await Team.findByIdAndUpdate(team._id, team)

                peoplesToHadTeam = team.apprentice ? [team.apprentice] : []
                peoplesToHadTeam.push(...team.worker, team.lead)

                await People.bulkWrite([{
                    updateMany: {
                        filter: { _id: peoplesToHadTeam },
                        update: { team: team._id }
                    }
                }])
                return teamUpdated
            })
            return allTeamUpdated
        } catch (err) {
            console.error(err)
            return false
        }
    },

    deletePeople: async ({ _id }) => {
        try {
            const peopledeleted = await People.findById(_id).populate("team")
            let peopleOutOfTeam = []

            if (peopledeleted.team) {
                const desertedTeam = await Team.findOne({ _id: peopledeleted.team._id })
                if (peopledeleted.job === "apprentice") {
                    desertedTeam.apprentice = null
                    desertedTeam.save()
                } else if (peopledeleted.job === "worker") {
                    desertedTeam.worker.pull({ _id: peopledeleted._id })
                    desertedTeam.save()
                } else {
                    peopleOutOfTeam = desertedTeam.apprentice ? [desertedTeam.apprentice, ...desertedTeam.worker] : [...desertedTeam.worker]
                    await Team.deleteOne({ _id: desertedTeam._id })
                }
            }

            await People.bulkWrite([{
                deleteOne: {
                    filter: { _id: _id }
                }
            },
            {
                updateMany: {
                    filter: { id: peopleOutOfTeam },
                    update: { team: null }
                }
            }])

            return peopleOutOfTeam
        } catch (err) {
            console.error(err)
            return false
        }
    }
}

module.exports = resolver