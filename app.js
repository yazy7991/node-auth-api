const express = require('express');
const Datastore = require('nedb-promises');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const rolesRoutes = require('./routes/roles.routes');
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
app.use('/', (req,res)=>{
    res.send('REST API Authentication and Authorization')
});

// Use auth routes
app.use('/api/v1/auth', authRoutes);

// Use users routes
app.use('/api/v1/users', usersRoutes);

// Use roles routes
app.use('/api/v1/roles', rolesRoutes);


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