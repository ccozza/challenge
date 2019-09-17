'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var express = _interopDefault(require('express'));
var bodyParser = _interopDefault(require('body-parser'));
var mongoose = require('mongoose');
var mongoose__default = _interopDefault(mongoose);

var mongo = (mongoose, conn) => {
    mongoose.connect(conn, {
        useNewUrlParser: true,
        useFindAndModify: false
    });

    const db = mongoose.connection;

    /**
     * It must exit(1) due to the 'restart: always' property on docker
     */
    db.on("error", err => {
        console.error(err);
        process.exit(1);
    });

    return db
};

var TaskSchema = (db, Schema) => {
    const taskSchema = Schema({
        title: { type: String, required: true },
        description: { type: String, required: true },
        createdAt: { type: Date, required: true, default: Date.now() },
        updatedAt: { type: Date },
        deadLineTime: { type: Date, required: true }, //time when it should be done
        notificationTime: { type: Date, required: true }, //time to send notification
        completedTime: { type:Date }, //if not null means that the task its completed
        user: { type: Schema.Types.ObjectId, ref: "User" }
    }, { toJSON: { virtuals: true } });

    return db.models.Task || db.model("Task", taskSchema)
};

var Create = (Schema, obj, res) => {
    Schema.create(obj, (err, created) => {
        if(err)
            res.status(500).end();
        else
            res.status(201).json({ "message": "created", "id": created._id  });
    });
};

/**
 * Users are allowed to update its own tasks, thats why we pass user as obj.user,
 * because we are setting user as userId comming from the gateway header property userId.
 * If a user is trying to update a someone else task, it will receive status 400.
 */
var Update = (Schema, obj, res) => {
    Schema.findOneAndUpdate({ _id: obj._id, user: obj.user }, obj, { new: true },
    (err, updated) => {
        if(err)
            res.status(500).end();
        else {
            if(updated)
                res.status(200).json({ "message": "updated", "id": updated._id  });
            else
                res.status(400).end();
        }
    });
};

/**
 * Users are allowed to delete its own tasks, thats why we pass user as obj.user,
 * because we are setting user as userId comming from the gateway header property userId.
 * If a user is trying to delete a someone else task, it will receive status 400.
 */
var Delete = (Schema, obj, res) => {
    Schema.findOneAndDelete({ _id: obj._id, user: obj.user }, obj,
    (err, deleted) => {
        if(err)
            res.status(500).end();
        else {
            if(deleted)
                res.status(200).json({ "message": "deleted" });
            else
                res.status(400).end();
        }
    });
};

var GetOneById = async (Schema, obj, res) => {
    try {
        const found = await Schema.findOne({ _id: obj._id, user: obj.user })
        .populate({
            path: "user",
            select: "name id",
            model: "User"
        });

        res.status(200).json(found);
    } catch(err) {
        console.log(`Error at getOneById -- ${err}`);
        res.status(500).end();
    }
};

var GetMany = async (Schema, obj, res) => {
    try {
        const found = await Schema.find({ _id: obj._id, user: obj.user })
        .populate({
            path: "user",
            select: "name id",
            model: "User"
        });

        res.status(200).json(found);
    } catch(err) {
        console.log(`Error at getMany -- ${err}`);
        res.status(500).end();
    }
};

var Func = {
    create: Create,
    update: Update,
    remove: Delete,
    getOneById: GetOneById,
    getMany: GetMany
};

var TaskController = (Task, app) => {
    app.get("/tasks/get/page/:page/size/:size", async (req, res) => {
        const userId = req.headers.userId;
        await Func.getMany(Task, { _id: req.params.id, user: userId }, res);
    });

    app.get("/tasks/get/:id", async (req, res) => {
        const userId = req.headers.userId;
        await Func.getOneById(Task, { _id: req.params.id, user: userId }, res);
    });

    app.delete("/tasks/delete", (req, res) => {
        const body = {
            id: req.body["id"] || null
        };

        if(!body.id)
            res.status(400).end();
        else {
            const userId = req.headers.userId;
            Func.remove(Task, { _id: body.id, user: userId }, res);
        }
    });

    app.post("/tasks/create", (req, res) => {
        const body = {
            title: req.body["title"] || null,
            description: req.body["description"] || null,
            deadLineTime: req.body["deadLineTime"] || null,
            notificationTime: req.body["notificationTime"] || null
        };

        if(!body.title || !body.description || !body.deadLineTime || !body.notificationTime)
            res.status(400).end();
        else {
            const userId = req.headers.userId;
            Func.create(Task, {
                user: userId, //the user logged in is the user creating a task
                title: body.title,
                description: body.description,
                deadLineTime: body.deadLineTime,
                notificationTime: body.notificationTime,
                createdAt: Date.now()
            }, res);
        }
    });

    app.put("/tasks/update", (req, res) => {
        const body = {
            _id: req.body["id"] || null,
            title: req.body["title"] || null,
            description: req.body["description"] || null,
            deadLineTime: req.body["deadLineTime"] || null,
            notificationTime: req.body["notificationTime"] || null
        };

        if(!body._id || !body.title || !body.description || !body.deadLineTime 
            || !body.notificationTime) {
                res.status(400).end();
        } else {
            const userId = req.headers.userId;
            Func.update(Task, {
                user: userId,
                _id: body.id,
                title: body.title,
                description: body.description,
                deadLineTime: body.deadLineTime,
                notificationTime: body.notificationTime,
                updatedAt: Date.now(),
                completedTime:  null 
                //if receive completedTime, complete the task otherwise its just a normal update
            });
        }
    });
};

const app = port => {
    const db = mongo(mongoose__default, "mongodb://db:27017/challenge");
    const Task = TaskSchema(db, mongoose.Schema);
    const app = express();
    app.use(bodyParser.json());

    TaskController(Task, app);

    app.listen(port, () => {
        console.log(`Tasks running at port: ${port}`);
    });
};

app(process.env.TASKS_PORT || 3070);
