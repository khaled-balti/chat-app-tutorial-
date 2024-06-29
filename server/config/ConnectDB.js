const mongoose = require("mongoose")
const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGOOSE_URL)
        const connection = mongoose.connection
        connection.on("connected", () => {
            console.log("Connected database")
        })
        connection.on("error", (error) => {
            console.log("error connection to database " + error)
        })

    } catch (error) {
        console.log(error)
    }
}
module.exports = connectDB