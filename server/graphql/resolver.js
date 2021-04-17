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


    addPeople: async (args) => {
        try {
            const newPeople = new People({
                ...args
            })

            if (args.job === "lead") {
                const newTeam = new Team({ lead: newPeople._id })
                newTeam.save()
                newPeople.team = newTeam
            } else if (args.job === "worker") {
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

    editPeople: async (args) => {
        try {
            let toEdit = await People.findOne({ _id: args._id }).populate("team")

            if (!args.job || args.job === toEdit.job) {
                Object.keys(args).forEach(key => {
                    toEdit[key] = args[key]
                })
                await toEdit.save()
                return toEdit
            }

            if (toEdit.team && toEdit.team._id) {
                let oldTeam = await Team.findOne({ _id: toEdit.team._id }).populate("lead worker apprentice")
                if (oldTeam.apprentice && toEdit._id === oldTeam.apprentice._id)
                    delete oldTeam.apprentice
                else if (oldTeam.worker[0] && toEdit._id === oldTeam.worker[0]._id)
                    oldTeam.worker.spilce(0, 1)
                else
                    oldTeam.worker.splice(1, 1)

                if (toEdit.job === "apprentice") {
                    if (oldTeam.worker.length < 2)
                        oldTeam.worker.push(toEdit._id)
                    else {
                        const newTeam = await Team.findOne({ $or: [{ worker: { $size: 0 } }, { worker: { $size: 1 } }] })
                        if (newTeam) {
                            newTeam.worker.push(toEdit._id)
                            newTeam.save()
                        }
                    }
                } else {
                    const newTeam = new Team({ lead: toEdit._id, worker: [] })
                    toEdit.team = newTeam
                    await newTeam.save()
                }
                await oldTeam.save()
            }

            Object.keys(args).forEach(key => {
                toEdit[key] = args[key]
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
            input.forEach(async team => {
                await Team.findByIdAndUpdate(team._id, { ...team })

                if (team.worker[0])
                    People.findByIdAndUpdate(team.worker[0]._id, { team: team._id })
                if (team.worker[1])
                    People.findByIdAndUpdate(team.worker[1]._id, { team: team._id })
                if (team.apprentice)
                    People.findByIdAndUpdate(team.apprentice._id, { team: team._id })
            })
            return input
        } catch (err) {
            console.error(err)
            return false
        }
    }
}

module.exports = resolver