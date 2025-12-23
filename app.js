const express = require('express');
const Datastore = require('nedb-promises');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
require('dotenv').config();

// Initialize express
const app = express();

// Middleware to parse JSON request body
app.use(express.json())

// Initialize NeDB datastores
const users = Datastore.create('User.db')

// Datastore for storing refresh tokens
const userRefreshTokens = Datastore.create('UserRefreshToken.db')


// Basic route
app.get('/', (req,res)=>{
    res.send('REST API Authentication and Authorization')
});

// Use auth routes
app.use('/api/v1/auth', authRoutes);

// Use users routes
app.use('/api/v1/users', usersRoutes);



// Admin only route
app.get('/api/v1/admin', ensureAuthenticated, authorize(['admin']), (req,res)=>{
    return res.status(200).json({
        message: 'Only admins can access ths route!'
    })
})

// Admin and Moderator route
app.get('/api/v1/moderator', ensureAuthenticated, authorize(['admin','moderator']), (req,res)=>{
    return res.status(200).json({
        message: 'Only admins and moderators can access ths route!'
    })
})

// Middleware to ensure the user is authenticated
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

// Middleware to authorize based on user roles
function authorize(roles = []){
    return async function(req,res,next){
        const user = await users.findOne({_id:req.user.id})

        if(!user|| !roles.includes(user.role)){
            return res.status(403).json({
                message: 'Access denied'
            })
        }

        next()
    }
}


module.exports = app;