/**
 * Users are allowed to update its own tasks, thats why we pass user as obj.user,
 * because we are setting user as userId comming from the gateway header property userId.
 * If a user is trying to update a someone else task, it will receive status 400.
 */
export default (Schema, obj, res) => {
    Schema.findOneAndUpdate({ _id: obj._id, user: obj.user }, obj, { new: true },
    (err, updated) => {
        if(err)
            res.status(500).end()
        else {
            if(updated)
                res.status(200).json({ "message": "updated", "id": updated._id  })
            else
                res.status(400).end()
        }
    })
}