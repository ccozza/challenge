const describe = require("mocha").describe
const it = require("mocha").it
const chai = require("chai")
const request = require("request")

describe("USER Tests", () => {
    it("Should create a valid user and receive status 201", () => {
        request.post("http://localhost:3050/signup", {
            json: {
                name: "Name",
                email: "email@email.com",
                password: "password"
            }
        }, (_, response) => {
            chai.expect(response.statusCode).to.be.eql(201)
        })
    })

    it("Should try to create a user without providing password and receive status 400", () => {
        request.post("http://localhost:3050/signup", {
            json: {
                name: "Name",
                email: "email2@email2.com"
            }
        }, (_, response) => {
            chai.expect(response.statusCode).to.be.eql(400)
        })
    })

    it("Should try to create a user that already exists and receive status code 400", () => {
        request.post("http://localhost:3050/signup", {
            json: {
                name: "Name",
                email: "email@email.com",
                password: "password"
            }
        }, (_, response) => {
            chai.expect(response.statusCode).to.be.eql(400)
        })
    })

    it("Should login with a valid user and receive status code 200 and a token", () => {
        request.post("http://localhost:3050/signin", {
            json: {
                email: "email@email.com",
                password: "password"
            }
        }, (_, response) => {
            chai.expect(response.statusCode).to.be.eql(200)
            chai.expect(response.body.token).to.exist
        })
    })

    it("Should try to login with a invalid user and receive status code 404", () => {
        request.post("http://localhost:3050/signin", {
            json: {
                email: "invalid@email.com",
                password: "password"
            }
        }, (_, response) => {
            chai.expect(response.statusCode).to.be.eql(404)
        })
    })
})

