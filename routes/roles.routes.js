const router = require('express').Router();
const ensureAuthenticated = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const users = require('../models/user.model');

// Admin only route
router.get('/admin', ensureAuthenticated, authorize(['admin']), (req,res)=>{
    return res.status(200).json({
        message: 'Only admins can access ths route!'
    })
})

// Admin and Moderator route
router.get('/moderator', ensureAuthenticated, authorize(['admin','moderator']), (req,res)=>{
    return res.status(200).json({
        message: 'Only admins and moderators can access ths route!'
    })
})