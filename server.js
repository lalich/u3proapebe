const express = require('express')
require('dotenv').config()

const test = 'this is the way'

const app = express()

const { PORT } = process.env

app.listen(PORT, () => console.log(test))