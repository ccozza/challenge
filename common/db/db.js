export default (mongoose, conn) => {
    mongoose.connect(conn, {
        useNewUrlParser: true,
        useFindAndModify: false
    })

    const db = mongoose.connection

    /**
     * It must exit(1) due to the 'restart: always' property on docker
     */
    db.on("error", err => {
        console.error(err)
        process.exit(1)
    })

    return db
}