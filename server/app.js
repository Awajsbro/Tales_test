const express = require("express")
const { graphqlHTTP } = require("express-graphql")
const mongoose = require("mongoose")
const cors = require("cors")

const schema = require("./graphql/schema")
const resolver = require("./graphql/resolver")

const db = mongoose.connect("mongodb://localhost/Tales_test", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => console.log("Connected to mongoDB"))
    .catch(err => console.error("Failed to connect", err))

const app = express()
app.use(cors())
app.use(express.json())

app.use(
    `/graphql`,
    graphqlHTTP({
        schema,
        rootValue: resolver,
        graphiql: true
    })
)


app.listen(4000)
