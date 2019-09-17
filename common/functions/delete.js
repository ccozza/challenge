/**
 * Users are allowed to delete its own tasks, thats why we pass user as obj.user,
 * because we are setting user as userId comming from the gateway header property userId.
 * If a user is trying to delete a someone else task, it will receive status 400.
 */
export default (Schema, obj, res) => {
    Schema.findOneAndDelete({ _id: obj._id, user: obj.user }, obj,
    (err, deleted) => {
        if(err)
            res.status(500).end()
        else {
            if(deleted)
                res.status(200).json({ "message": "deleted" })
            else
                res.status(400).end()
        }
    })
}