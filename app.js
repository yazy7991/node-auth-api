const express = require('express');

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

module.exports = app;