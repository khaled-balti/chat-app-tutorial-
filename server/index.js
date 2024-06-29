const express = require('express')
const cors = require('cors')
require('dotenv').config()
const connectDB = require('./config/connectDB')
const cookieParser = require("cookie-parser")
const {app, server} = require('./socket/index')
// const app = express()
app.use(express.json())
app.use(cookieParser())
const router = require('./router/index')
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.get('/', (req, res) => {
    res.json({
        message: 'app running on port ' + port
    })
})
app.use('/api', router)
const port = process.env.PORT || 8000
connectDB().then(() => {
    server.listen(port, () => console.log('listening on port ' + port))
}).catch(err => {
    console.log(err)
}) 