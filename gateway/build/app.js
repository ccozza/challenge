'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var express = _interopDefault(require('express'));
var bodyParser = _interopDefault(require('body-parser'));
var httpProxy = _interopDefault(require('http-proxy'));
var mongoose = require('mongoose');
var mongoose__default = _interopDefault(mongoose);
var jwt = _interopDefault(require('jsonwebtoken'));
var bcrypt = _interopDefault(require('bcrypt'));

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

var Security = () => {
    const secretKey = "secret-key";
    const algorithm = "HS256";
    const hash = password => bcrypt.hashSync(password, 10);
    const check = (password, _hash) => bcrypt.compareSync(password, _hash);
    const createToken = id => jwt.sign({"id": id}, secretKey, {algorithm: algorithm, expiresIn: "7d"});

    return {
        secretKey: secretKey,
        algorithm: algorithm,
        hash: hash,
        check: check,
        createToken: createToken
    }
};

var validation = async (User, req, res, next) => {
    const err401 = { "message": "Cannot access this content." };
    const security = Security();

    const auth = req.headers.authorization;
    if(!auth) {
        res.status(400).end();
    } else {
        const token = req.headers.authorization.split(" ")[1];
        if(!token)
            res.status(401).json(err401);
        else {
            try {
                const diss = await jwt.verify(token, security.secretKey, 
                    { algorithm: security.algorithm });

                if(!diss)
                    res.status(401).json(err401);
                else {
                    const user = await User.findOne({ _id: diss.id });
                    if(user && user._id)
                        (res.locals.userId = user._id) && next();
                    else
                        res.status(401).json(err401);
                }
            } catch(err) {
                console.log(err);
                res.status(500).json();
            }
        }
    }
};

var UserSchema = (db, Schema) => {
    const userSchema = Schema({
        name: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        created_at: { type: Date, default: Date.now() }
    }, { toJSON: { virtuals: true } });

    return db.models.User || db.model("User", userSchema)
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

var UserController = (User, app) => {
    const security = Security();

    app.post("/signup", (req, res) => {
        const body = {
            name: req.body["name"] || null,
            email: req.body["email"] || null,
            password: req.body["password"] || null
        };

        if(!body.name || !body.email || !body.password)
            res.status(400).end();
        else {
            User.findOne({ email: req.body.email }, (err, alreadyRegistered) => {
                if(err) {
                    console.log(err);
                    res.status(500).end();
                } else {
                    if(alreadyRegistered && alreadyRegistered._id)
                        res.status(400).end();
                    else {
                        Func.create(User, {
                            "name": req.body.name,
                            "email": req.body.email,
                            "password": security.hash(req.body.password)
                        }, res);
                    }
                }
            });
        }
    });

    app.post("/signin", (req, res) => {
        const body = {
            email: req.body["email"] || null,
            password: req.body["password"] || null
        };

        if(!body.email || !body.password)
            res.status(400).end();
        else {
            User.findOne({ email: body.email }, (err, user) => {
                if(err) {
                    console.log(err);
                    res.status(500).end();
                } else {
                    if(!user)
                        res.status(404).end();
                    else {
                        const token = security.check(body.password, user.password) ? 
                        security.createToken(user._id) : null;
    
                        if(token)
                            res.status(200).json({ "token": token });
                        else
                            res.status(401).end();
                    }
                }
            });
        }
    });
};

const app = port => {
    const config = require("./config.json");
    const db = mongo(mongoose__default, "mongodb://db:27017/challenge");
    const User = UserSchema(db, mongoose.Schema);
    const app = express();
    const proxy = httpProxy.createProxyServer();

    /**
     * This is the implementation of the proxy, from a config file
     * we setup the proxy and since everything should be secure, we
     * have a middleware for token validation.
     */
    config.services.forEach(service => {
        const address = service.address;

        service.routes.forEach(route => {
            app.all(route.path, async (req, res, next) => {
                await validation(User, req, res, next);
            }, (req, res) => {
                proxy.web(req, res, { target: address, headers: {
                    "userId": res.locals.userId //will controll the user access to its own tasks
                }}, err => {
                    console.error(err);
                });
            });
        });
    });

    app.use(bodyParser.json());
    /**
     * User routes, its inside gateway for simplicity, since all security
     * function are here. These routes are open.
     */
    UserController(User, app);

    app.listen(port, () => {
        console.log(`Gateway listenning on port ${port}`);
    });
};

app(process.env.SERVER_PORT || 3050);
