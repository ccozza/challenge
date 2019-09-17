import Func from "../../common/functions/functions"

export default (Task, app) => {
    app.get("/tasks/get/page/:page/size/:size", async (req, res) => {
        const userId = req.headers.userId
        await Func.getMany(Task, { _id: req.params.id, user: userId }, res)
    })

    app.get("/tasks/get/:id", async (req, res) => {
        const userId = req.headers.userId
        await Func.getOneById(Task, { _id: req.params.id, user: userId }, res)
    })

    app.delete("/tasks/delete", (req, res) => {
        const body = {
            id: req.body["id"] || null
        }

        if(!body.id)
            res.status(400).end()
        else {
            const userId = req.headers.userId
            Func.remove(Task, { _id: body.id, user: userId }, res)
        }
    })

    app.post("/tasks/create", (req, res) => {
        const body = {
            title: req.body["title"] || null,
            description: req.body["description"] || null,
            deadLineTime: req.body["deadLineTime"] || null,
            notificationTime: req.body["notificationTime"] || null
        }

        if(!body.title || !body.description || !body.deadLineTime || !body.notificationTime)
            res.status(400).end()
        else {
            const userId = req.headers.userId
            Func.create(Task, {
                user: userId, //the user logged in is the user creating a task
                title: body.title,
                description: body.description,
                deadLineTime: body.deadLineTime,
                notificationTime: body.notificationTime,
                createdAt: Date.now()
            }, res)
        }
    })

    app.put("/tasks/update", (req, res) => {
        const body = {
            _id: req.body["id"] || null,
            title: req.body["title"] || null,
            description: req.body["description"] || null,
            deadLineTime: req.body["deadLineTime"] || null,
            notificationTime: req.body["notificationTime"] || null
        }

        if(!body._id || !body.title || !body.description || !body.deadLineTime 
            || !body.notificationTime) {
                res.status(400).end()
        } else {
            const userId = req.headers.userId
            Func.update(Task, {
                user: userId,
                _id: body.id,
                title: body.title,
                description: body.description,
                deadLineTime: body.deadLineTime,
                notificationTime: body.notificationTime,
                updatedAt: Date.now(),
                completedTime: body.completedTime || null 
                //if receive completedTime, complete the task otherwise its just a normal update
            })
        }
    })
}