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
    
})

const Product = mongoose.model('products' , productSchema)
////////////////////////////////////////////////////////////////
//User schema
const userSchema = new mongoose.Schema({
    username : {type: String, required: true, unique: true},
    password : {type: String, required: true},
    zip : {type: String, required: true}
})

const User = mongoose.model('User' , userSchema)
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
    
    
})

const FarmInfo = mongoose.model('Farm information' , farminfoSchema)
////////////////////////////////
const farmerSchema = new mongoose.Schema({
    farmername: {type: String, required: true, unique: true},
    password: {type: String, required: true}
})
const Farmer = mongoose.model('Farmer', farmerSchema)


// Middleware configuration
app.use(cookieParser())
app.use(morgan('dev'))
app.use(cors({
    origin:'http://localhost:3000',
    credentials: true,
}))
app.use(express.json())


const checkAuth = (req, res, next) => {
    if (req.session.loggedIn) {
        next()
    } else {
        res.redirect('farmer/login')
    }
}


const aFarmer = async (req, res, next) => {
    if(req.cookies.token) {
       const payload = await jsonwebtoken.verify(req.cookies.token, process.env.SECRET)
       req.payload = payload

       next()
    } else {
        res.redirect('/farmer/login')
    }
}
const aUser = async (req, res, next) => {
    if(req.cookies.token) {
        const payload = await jsonwebtoken.verify(req.cookies.token, process.env.SECRET)
        req.paylaod = payload
        next()
    } else {
        res.redirect('/user/login')
    }
}
////////////////////////////////



// product Routes
app.get('/', (req , res) => {
    res.send({working : "Running"})
})

app.get('/product' , async (req , res) => {
    try{
        res.json(await Product.find({}))
    } catch (error){
        res.status(400).json(error)
    }
})

app.get('/product/:id' , async (req , res) => {
    try{
        const product = await Product.findById(req.params.id)
        res.json(product) 
    } catch (error) {
        res.status(400).json(error)
    }
})

app.get('/farmer/product', aFarmer, async (req , res) => {
    try{
        const product = await Product.find({farmername: req.payload.farmername})
        
        res.json(product)
    } catch (error){
        res.status(400).json(error)
    }
})


app.post('/product' , aFarmer, async (req ,res) =>{
    try
    {console.log(req.body)
        req.body.farmername = req.payload.farmername
        
        const product = await Product.create(req.body)
        // log the product //
        console.log(product)
        res.json(product)
    } catch (error) {
        res.status(400).json(error)
    }

})


app.get('/farmer/product/:id', aFarmer, async (req , res) => {
    try{
        const product = await Product.findById(req.params.id)
        res.json(product) 
    } catch (error) {
        res.status(400).json(error)
    }
})



app.put('/product/:id' , aFarmer, async (req , res) => {
    try{
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        })
        res.json(product)
    } catch (error) {
        res.status(400).json(error)
    }
})

app.delete('/product/:id' , aFarmer, async (req ,res) => {
    try{
        const product = res.json(await Product.findByIdAndDelete(req.params.id))
        res.status(204).json(product)
    } catch (error) {
        res.status(400).json()
    }
})
// taken out for now but will be used for favorite catalog
// app.get('user/product', aUser, async (req , res) => {
//     try{
//         const product = await Product.find({username: req.payload.username})
        
//         res.json(product)
//     } catch (error){
//         res.status(400).json(error)
//     }
// })
////////////////////////////////////////////////////////////////
// farm routes


app.get('/farm' , async (req , res) => {
    try{
    
        res.json(await FarmInfo.find({}))
    } catch (error) {
        res.status(404).json(error)
    }
});

app.get('/farm/:id' , async (req , res) => {
    try{
        const farm = await FarmInfo.findById(req.params.id)
        res.json(farm)
    } catch (error) {
        res.status(404).json(error)
    }
});

app.get('/farmer/farm', aFarmer, async (req , res) => {
    try{
        const farm = await FarmInfo.find({farmername: req.payload.farmername})
        
        res.json(farm)
    } catch (error) {
        res.status(404).json(error)
    }
});

app.get('/farmer/farm/:id', aFarmer, async (req , res) => {
    try{
        const farm = await FarmInfo.findById(req.params.id)
        
        res.json(farm)
    } catch (error) {
        res.status(404).json(error)
    }
});

app.post('/farm' , aFarmer, async (req ,res) => {
    try {
        req.body.farmername = req.payload.farmername

        const farm = await FarmInfo.create(req.body)
        console.log(farm)
        res.json(farm)      
    } catch (error) {
        res.status(400).json(error)
    }
})

app.put('/farm/:id', aFarmer, async (req , res) => {
    try{
        const farm = await FarmInfo.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        })
        res.json(farm)
    } catch (error) {
        res.status(400).json(error)
    }
})

app.delete('/farm/:id' , aFarmer, async (req , res) => {
    try{
        const farm = await FarmInfo.findByIdAndDelete(req.params.id)
        res.json(farm)
        res.status(204).json(farm)
    } catch (error) {
        res.status(400).json()
    }
})

app.post('/farmer/signup', async (req, res) => {
    try {
        let { farmername, password } = req.body
        password = await bcrypt.hash(password, await bcrypt.genSalt(10))
        
        const farmer = await Farmer.create({ farmername, password })
 
      res.status(201).json({message: 'Signup success, go ahead and plant away!'})

    } catch(error) {
        console.error('You aint a farmer here yet, try again!', error)
        res.send('Please try again, in order to assist your community')
    }
})

app.post('/user/signup', async (req, res) => {
    try {
        let { username, password, zip } = req.body
        password = await bcrypt.hash(password, await bcrypt.genSalt(10))
        
        const user = await User.create({ username, password, zip })
 
      res.status(201).json({message: 'Signup success, go ahead and food it up!'})
    } catch(error) {
        console.error('Not yet able to access the user features, please try again', error)
        res.send('Please try again, in order to use the features of a user')
    }})

app.post('/farmer/login', async (req, res) => {
    try {
        const { farmername, password, } = req.body
        const farmer = await Farmer.findOne({ farmername })
        console.log(farmer)

        if (!farmer) {
            throw new Error('nah not planting seeds here yet')
        }
        console.log(password, farmer)
        const paswordCheck = await bcrypt.compare(password, farmer.password)
        if (!paswordCheck) {
            throw new Error('Wrong keyphrase plase try again')
        }
        const token = jsonwebtoken.sign({ farmername: farmer.farmername }, process.env.SECRET)
        res.cookie('token', token, {
            httpOnly: true,
            path: '/',
            domain: 'localhost',
            secure: false,
            sameSite: 'lax',
            maxAge: 3600000,
        }) 
            res.json(farmer)
           } catch (error) {
            res.status(400).json({ error: error.message })
           }
})

app.post('/user/login', async (req, res) => {
        try {
            const { username, password, zip } = req.body
            const user = await User.findOne({ username })
            console.log(user)
    
            if (!user) {
                throw new Error('nah not planting seeds here yet')
            }
            console.log(password, user)
            const paswordCheck = await bcrypt.compare(password, user.password)
            if (!paswordCheck) {
                throw new Error('Wrong keyphrase plase try again')
            }
            const token = jsonwebtoken.sign({ username: user.username }, process.env.SECRET)
            res.cookie('token', token, {
                httpOnly: true,
                path: '/',
                domain: 'localhost',
                secure: false,
                sameSite: 'lax',
                maxAge: 3600000,
            }) 
            console.log(token)
                res.json(user)
               } catch (error) {
                res.status(400).json({ error: error.message })
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

app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "You have been logged out" });
  })


////////////////////////////////
// User routes

// Listener 
app.listen(PORT, () => console.log(`listeing on Port: ${PORT}`))
////////////////////////////////