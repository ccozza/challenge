export default (Schema, obj, res) => {
    Schema.create(obj, (err, created) => {
        if(err)
            res.status(500).end()
        else
            res.status(201).json({ "message": "created", "id": created._id  })
    })
}