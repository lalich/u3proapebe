require('dotenv').config()
////////////////////////////////
// dependencies
const express = require('express')
const app = express()
const { PORT , DATABASE_URL} = process.env
const morgan = require('morgan')
////////////////////////////////


////////////////////////////////
// mogoose configuration / schema configuration
const mongoose = require('mongoose')
mongoose.connect(DATABASE_URL)

mongoose.connection
.on('open', () => console.log('Connected to db'))
.on('close', () => console.log('Not connected to db'))
.on('error', () => console.log('Error connecting to db'))
////////////////////////////////
//SCHEMA 

const userSchema = new mongoose.Schema({
    
    
})

////////////////////////////////
// Middleware configuration
app.use(morgan('dev'))
app.get('/', (req , res) => {
    res.send("working")
})
////////////////////////////////


////////////////////////////////
// Listener 
app.listen(PORT, () => console.log(`listeing on Port: ${PORT}`))
////////////////////////////////