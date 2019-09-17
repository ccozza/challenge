export default async (Schema, obj, res) => {
    try {
        const found = await Schema.findOne({ _id: obj._id, user: obj.user })
        .populate({
            path: "user",
            select: "name id",
            model: "User"
        })

        res.status(200).json(found)
    } catch(err) {
        console.log(`Error at getOneById -- ${err}`)
        res.status(500).end()
    }
}