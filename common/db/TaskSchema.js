export default (db, Schema) => {
    const taskSchema = Schema({
        title: { type: String, required: true },
        description: { type: String, required: true },
        createdAt: { type: Date, required: true, default: Date.now() },
        updatedAt: { type: Date },
        deadLineTime: { type: Date, required: true }, //time when it should be done
        notificationTime: { type: Date, required: true }, //time to send notification
        completedTime: { type:Date }, //if not null means that the task its completed
        user: { type: Schema.Types.ObjectId, ref: "User" }
    }, { toJSON: { virtuals: true } })

    return db.models.Task || db.model("Task", taskSchema)
}