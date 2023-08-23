require('dotenv').config()
////////////////////////////////
// dependencies
const express = require('express')
const app = express()
const { PORT , DATABASE_URL} = process.env
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')

////////////////////////////////

// Middleware configuration
app.use(morgan('dev'))
app.use(cors())
app.use(express.json())

////////////////////////////////

// mogoose configuration / schema configuration
mongoose.connect(DATABASE_URL ,{
    useUnifiedTopology: true,
    useNewUrlParser: true,
})

mongoose.connection
.on('open', () => console.log('Connected to db'))
.on('close', () => console.log('Not connected to db'))
.on('error', () => console.log('Error connecting to db'))

////////////////////////////////

//Farmer schema 
const productSchema = new mongoose.Schema({
    productname : String ,
    image : String,
    description : String, 
    price : Number ,
    username : String
})

const product = mongoose.model('products' , productSchema)
////////////////////////////////////////////////////////////////
//User schema
const userSchema = new mongoose.Schema({
    username : String,
    password : String,
})

const user = mongoose.model('User' , userSchema)
////////////////////////////////
// farm info schema
const farminfoSchema = new mongoose.Schema({
    farmname : String,
    image : String,
    address : String,
    state : String ,
    city : String,
    username : String,
    password : String
})

const farmerInfo = mongoose.model('Farm information' , farminfoSchema)
////////////////////////////////

// product Routes
app.get('/', (req , res) => {
    res.send({working : "Running"})
})

app.post('/product', async (req ,res) =>{
    try{
        console.log(req.body)
        res.json(await product.create(req.body))
    } catch (error) {
        res.status(400).json(error)
    }

})

app.get('/product' , async (req , res) => {
    try{
        res.json(await product.find({}))
    } catch (error){
        res.status(400).json(error)
    }
})



app.get('/product/:id' , async (req , res) => {
    try{
        const Product = await product.findById(req.params.id)
        res.json(Product) 
    } catch (error) {
        res.status(400).json(error)
    }
})

app.put('/product/:id' , async (req , res) => {
    try{
        res.json(await product.findByIdAndUpdate(req.params.id, req.body  , {new:true}))
    } catch (error) {
        res.status(400).json(error)
    }
})

app.delete('/product/:id' , async (req ,res) => {
    try{
        res.json(await product.findByIdAndDelete(req.params.id))
        res.status(204).json(product)
    } catch (error) {
        res.status(400).json()
    }
})
////////////////////////////////////////////////////////////////
// farm routes


app.get('/farm' , async (req , res) => {
    try{
        res.json(await farmerInfo.find({}))
    } catch (error) {
        res.status(404).json(error)
    }
});


app.post('/farm' , async (req ,res) => {
    try {
        res.json(await farmerInfo.create(req.body))      
    } catch (error) {
        res.status(400).json(error)
    }
})

app.get('/farm/:id' , async (req , res) => {
    try{
        const Farm = await farmerInfo.findById(req.params.id)
        res.json(Farm)
    } catch (error) {
        res.status(404).json(error)
    }
});

app.put('/farm/:id', async (req , res) => {
    try{
        res.json(await farmerInfo.findByIdAndUpdate(req.params.id, req.body  , {new:true}))
    } catch (error) {
        res.status(400).json(error)
    }
})

app.delete('/farm/:id' , async (req , res) => {
    try{
        res.json(await farmerInfo.findByIdAndDelete(req.params.id))
        res.status(204).json(farmerInfo)
    } catch (error) {
        res.status(400).json()
    }
})

////////////////////////////////
// User routes

// Listener 
app.listen(PORT, () => console.log(`listeing on Port: ${PORT}`))
////////////////////////////////
