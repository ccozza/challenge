export default (db, Schema) => {
    const userSchema = Schema({
        name: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        created_at: { type: Date, default: Date.now() }
    }, { toJSON: { virtuals: true } })

    return db.models.User || db.model("User", userSchema)
}