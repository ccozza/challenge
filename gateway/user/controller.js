import Security from "../security"
import Func from "../../common/functions/functions"

export default (User, app) => {
    const security = Security()

    app.post("/signup", (req, res) => {
        const body = {
            name: req.body["name"] || null,
            email: req.body["email"] || null,
            password: req.body["password"] || null
        }

        if(!body.name || !body.email || !body.password)
            res.status(400).end()
        else {
            User.findOne({ email: req.body.email }, (err, alreadyRegistered) => {
                if(err) {
                    console.log(err)
                    res.status(500).end()
                } else {
                    if(alreadyRegistered && alreadyRegistered._id)
                        res.status(400).end()
                    else {
                        Func.create(User, {
                            "name": req.body.name,
                            "email": req.body.email,
                            "password": security.hash(req.body.password)
                        }, res)
                    }
                }
            })
        }
    })

    app.post("/signin", (req, res) => {
        const body = {
            email: req.body["email"] || null,
            password: req.body["password"] || null
        }

        if(!body.email || !body.password)
            res.status(400).end()
        else {
            User.findOne({ email: body.email }, (err, user) => {
                if(err) {
                    console.log(err)
                    res.status(500).end()
                } else {
                    if(!user)
                        res.status(404).end()
                    else {
                        const token = security.check(body.password, user.password) ? 
                        security.createToken(user._id) : null
    
                        if(token)
                            res.status(200).json({ "token": token })
                        else
                            res.status(401).end()
                    }
                }
            })
        }
    })
}