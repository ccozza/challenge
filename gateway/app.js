import express from "express"
import bodyParser from "body-parser"
import httpProxy from "http-proxy"
import mongoose, { Schema } from "mongoose"
import mongo from "../common/db/db"
import validation from "./middleware/validation"
import UserSchema from "../common/db/UserSchema"
import UserController from "./user/controller"

const app = port => {
    const config = require("./config.json")
    const db = mongo(mongoose, "mongodb://db:27017/challenge")
    const User = UserSchema(db, Schema)
    const app = express()
    const proxy = httpProxy.createProxyServer()

    /**
     * This is the implementation of the proxy, from a config file
     * we setup the proxy and since everything should be secure, we
     * have a middleware for token validation.
     */
    config.services.forEach(service => {
        const address = service.address

        service.routes.forEach(route => {
            app.all(route.path, async (req, res, next) => {
                await validation(User, req, res, next)
            }, (req, res) => {
                proxy.web(req, res, { target: address, headers: {
                    "userId": res.locals.userId //will controll the user access to its own tasks
                }}, err => {
                    console.error(err)
                })
            })
        })
    })

    app.use(bodyParser.json())
    /**
     * User routes, its inside gateway for simplicity, since all security
     * function are here. These routes are open.
     */
    UserController(User, app)

    app.listen(port, () => {
        console.log(`Gateway listenning on port ${port}`)
    })
}

app(process.env.SERVER_PORT || 3050)