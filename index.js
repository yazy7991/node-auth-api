const express = require('express');
const Datastore = require('nedb-promises');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Initialize express
const app = express();

// Configure body parser
app.use(express.json())

// Simulate a user table local action
const users = Datastore.create('User.db')


app.get('/', (req,res)=>{
    res.send('REST API Authentication and Authorization')
});

// Route for user registration
app.post('/api/v1/auth/register', async(req,res)=>{
    try {
        const {name, email, password, role} = req.body;
        
        if(!name || !email || !password){
            return res.status(422).json({message: 'Please fill in all the provided fields'})
        }

        // Validation to prevent email duplication in the database record.
        if(await users.findOne({email})){
            return res.status(409).json({
                message: 'Email already exist'
            })

        }

        const hashed_password = await bcrypt.hash(password,10);

        const newUser = await users.insert({
            name,
            email,
            password: hashed_password,
            role: role ?? 'member'
        })

        return res.status(201).json({
            message: "User registered successfully 👍",
            id: newUser._id
        })
        
    } catch (error) {
        return res.status(500).json({message: error.message})
        
    }
})

// Route for user login
app.post('/api/v1/auth/login', async (req,res) => {
    try {
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(422).json({message: 'Either email or password field is incomplete'})
        }

        const user = await users.findOne({email})

        if(!user){
            return res.status(401).json({
                message: 'Email or Password is invalid'
            })
        }

        // Compare the password from request with the stored user password in the database
        const password_match = await bcrypt.compare(password,user.password);

        if(!password_match){
            return res.status(401).json({
                message: 'Email or Password is invalid'
            })

        }

        // Create access token when all validations are correct
        const payload = {
            id: user._id
        };

        const secret = process.env.SECRET_KEY;


        const access_token = jwt.sign(
            payload,
            secret,
            {
                subject: 'accessApi',
                expiresIn: '1h'
            }
        )

        return res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            access_token
        })

        
    } catch (error) {
        return res.status(500).json({message: error.message})
        
    }
    
})

app.get('/api/v1/users/current', ensureAuthenticated ,async(req,res)=>{
    try {
        const user = await users.findOne({
            _id: req.user.id
        })

        return res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email
        })
        
    } catch (error) {
        return res.status(500).json({message: error.message})

        
    }

})

app.get('/api/v1/admin', ensureAuthenticated, authorize(['admin']), (req,res)=>{
    return res.status(200).json({
        message: 'Only admins can access ths route'
    })
})

async function ensureAuthenticated(req,res,next) {
    const access_token = req.headers.authorization;
    console.log(access_token);
    

    if(!access_token){
        return res.status(401).json({
            message: 'Accessn token not found'
        })
    }

    try {
        const decoded_access_token = jwt.verify(access_token,process.env.SECRET_KEY)

        console.log(decoded_access_token);
        

        req.user = {
            id: decoded_access_token.id
        }

        next()
        
    } catch (error) {
        return res.status(401).json({
            message: 'Access token invalid or expired'
        })
        
    }
    
}

function authorize(roles = []){
    return async function(req,res,next){
        const user = await users.findOne({_id:req.user.id})

        if(!user|| !roles.includes(user.role)){
            return res.status(40)
        }
    }
}



app.listen(3000, ()=> console.log('Server started at port 3000'))