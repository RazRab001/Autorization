const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const router = require('./routes/index')
const errorMiddleware = require('./middleWare/error-middleware')
require('dotenv').config()

const PORT = process.env.PORT || 5000
const app = express()

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/api', router)
app.use(errorMiddleware);
const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        app.listen(PORT, () => console.log(`Servers start on port ${PORT}`))
    } catch (e) {
        console.log(e.message)
    }
}

start()