const express = require('express'); // Import express framework
require('dotenv').config(); // Load environment variables
const authRoutes = require('./routes/auth.routes'); // Import auth routes
const usersRoutes = require('./routes/users.routes'); // Import users routes
const rolesRoutes = require('./routes/roles.routes'); // Import roles routes


// Initialize express
const app = express();

// Middleware to parse JSON request body
app.use(express.json())

// Basic route
app.use('/', (req,res)=>{
    res.send('REST API Authentication and Authorization')
});

// Use auth routes-> This will handle registration, login, and token refresh
app.use('/api/v1/auth', authRoutes);

// Use users routes-> This will handle user-related operations
app.use('/api/v1/users', usersRoutes);

// Use roles routes->This will handle role-based access control
app.use('/api/v1/roles', rolesRoutes);

module.exports = app;