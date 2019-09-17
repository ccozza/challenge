import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

export default () => {
    const secretKey = "secret-key"
    const algorithm = "HS256"
    const hash = password => bcrypt.hashSync(password, 10)
    const check = (password, _hash) => bcrypt.compareSync(password, _hash)
    const createToken = id => jwt.sign({"id": id}, secretKey, {algorithm: algorithm, expiresIn: "7d"})

    return {
        secretKey: secretKey,
        algorithm: algorithm,
        hash: hash,
        check: check,
        createToken: createToken
    }
}