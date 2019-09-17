import express from "express"
import bodyParser from "body-parser"
import mongoose, { Schema } from "mongoose"
import mongo from "../common/db/db"
import TaskSchema from "../common/db/TaskSchema"
import TaskController from "../tasks/task/controller"

const app = port => {
    const db = mongo(mongoose, "mongodb://db:27017/challenge")
    const Task = TaskSchema(db, Schema)
    const app = express()
    app.use(bodyParser.json())

    TaskController(Task, app)

    app.listen(port, () => {
        console.log(`Tasks running at port: ${port}`)
    })
}

app(process.env.TASKS_PORT || 3070)