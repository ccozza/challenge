import jwt from "jsonwebtoken"
import Security from "../security"

export default async (User, req, res, next) => {
    const err401 = { "message": "Cannot access this content." }
    const security = Security()

    const auth = req.headers.authorization
    if(!auth) {
        res.status(400).end()
    } else {
        const token = req.headers.authorization.split(" ")[1]
        if(!token)
            res.status(401).json(err401)
        else {
            try {
                const diss = await jwt.verify(token, security.secretKey, 
                    { algorithm: security.algorithm })

                if(!diss)
                    res.status(401).json(err401)
                else {
                    const user = await User.findOne({ _id: diss.id })
                    if(user && user._id)
                        (res.locals.userId = user._id) && next()
                    else
                        res.status(401).json(err401)
                }
            } catch(err) {
                console.log(err)
                res.status(500).json()
            }
        }
    }
}