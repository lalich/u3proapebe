require('dotenv').config()
////////////////////////////////
// dependencies
const express = require('express')
const app = express()
const { PORT , DATABASE_URL} = process.env
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const cookieParser = require('cookie-parser')
const jsonwebtoken = require('jsonwebtoken')
const session = require('express-session')
////////////////////////////////

// Middleware configuration
app.use(morgan('dev'))
app.use(cors())
app.use(express.json())
app.use(session({
    secret: 'APEFOOD',
    resave: false,
    saveUninitialized: true
}))
const checkAuth = (req, res, next) => {
    if (req.session.loggedIn) {
        next()
    } else {
        res.redirect('farmer/login')
    }
}
app.use(cookieParser())

const aFarmer = (req, res, next) => {
    if(req.session.loggedIn && req.session.farmername) {
        next()
    } else {
        res.redirect('/farmer/login')
    }
}
const aUser = (req, res, next) => {
    if(req.session && req.session.user && req.session.user.aUser) {
        next()
    } else {
        res.redirect('/user/login')
    }
}
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
    productname : {type: String, required: true},
    image : {type: String, required: true},
    description : {type: String, required: true}, 
    price : {type: String, required: true},
    farmername: {type: String, required: true},
    username : {type: String, required: true},
})

const product = mongoose.model('products' , productSchema)
////////////////////////////////////////////////////////////////
//User schema
const userSchema = new mongoose.Schema({
    username : {type: String, required: true, unique: true},
    password : {type: String, required: true},
})

const user = mongoose.model('User' , userSchema)
////////////////////////////////
// farm info schema
const farminfoSchema = new mongoose.Schema({
    farmname : {type: String, required: true},
    image : {type: String, required: true},
    address : {type: String, required: true},
    state : {type: String, required: true},
    city : {type: String, required: true},
    zip: {type: String, required: true},
    farmername: {type: String, required: true},
    username : {type: String, required: true},
    
})

const farmerInfo = mongoose.model('Farm information' , farminfoSchema)
////////////////////////////////
const farmerSchema = new mongoose.Schema({
    farmername: {type: String, required: true, unique: true},
    password: {type: String, required: true}
})
const farmer = mongoose.model('Farmer', farmerSchema)

// product Routes
app.get('/', (req , res) => {
    res.send({working : "Running"})
})

app.post('/product' , aFarmer, async (req ,res) =>{
    try
    {console.log(req.body)
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

app.put('/product/:id' , aFarmer, async (req , res) => {
    try{
        res.json(await product.findByIdAndUpdate(req.params.id, req.body  , {new:true}))
    } catch (error) {
        res.status(400).json(error)
    }
})

app.delete('/product/:id' , aFarmer, async (req ,res) => {
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


app.post('/farm' , aFarmer, async (req ,res) => {
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

app.put('/farm/:id', aFarmer, async (req , res) => {
    try{
        res.json(await farmerInfo.findByIdAndUpdate(req.params.id, req.body  , {new:true}))
    } catch (error) {
        res.status(400).json(error)
    }
})

app.delete('/farm/:id' , aFarmer, async (req , res) => {
    try{
        res.json(await farmerInfo.findByIdAndDelete(req.params.id))
        res.status(204).json(farmerInfo)
    } catch (error) {
        res.status(400).json()
    }
})

app.post('/farmer/signup', async (req, res) => {
    try {
        req.body.password = await bcrypt.hash(req.body.password, await bcrypt.genSalt(10))
        await farmer.create(req.body)
      res.status(201).json({message: 'Signup success, go ahead and plant away!'})
    } catch(error) {
        console.error('You aint a farmer here yet, try again!', error)
        res.send('Please try again, in order to assist your community')
    }
})

app.post('/user/signup', async (req, res) => {
    try {
        req.body.password = await bcrypt.hash(req.body.password, await bcrypt.genSalt(10))
        await user.create(req.body)
      
    } catch(error) {
        console.error('Not yet able to access the user features, please try again', error)
        res.send('Please try again, in order to use the features of a user')
    }})

app.post('/farmer/login', async (req, res) => {
    const aFarmer = await farmer.findOne({ farmername: req.body.farmername })
    console.log(aFarmer)
        if(!aFarmer) {
            res.send('that aint a farmer here.. yet!')
     
        } else {
            const passmatches = bcrypt.compareSync(req.body.password, aFarmer.password)
            if (passmatches) {
                req.session.farmername = req.body.farmername
                req.session.loggedIn = true
                const cookie = res.cookie('sessionID', req.sessionID, {httpOnly: true })
                console.log(cookie)
                res.redirect('/farmer')
            } else {
                res.send('Wrong password, please try again')
                
            }
        }
})

app.post('/user/login', async (req, res) => {
    const aUser = await user.findOne({ username: req.body.username})
        console.log(aUser)
        if(!aUser) {
            res.send('that aint a farmer here.. yet!')
          
        } else {
            const passmatches = bcrypt.compareSync(req.body.password, aUser.password)
            if (passmatches) {
                req.session.username = req.body.username
                req.session.loggedIn = true
               
                const cookie = res.cookie('sessionID', req.sessionID, {httpOnly: true })
                console.log(cookie)
                res.redirect('/')
            } else {
                res.send('Wrong password, please try again')
            
            }
        }

})

app.get('./getcookie', (req, res) => {
    const sessionID = req.cookies.sessionID
    console.log('Session ID:', sessionID)
    res.send('cookie retrieved')
})
app.get('/farmer', checkAuth, (req, res) => {
    res.send('Welcome to your Farmer page')
})

app.get('/logout', (req,res) => {
    req.session.destroy(err => {
    res.redirect('/')
})
})

////////////////////////////////
// User routes

// Listener 
app.listen(PORT, () => console.log(`listeing on Port: ${PORT}`))
////////////////////////////////