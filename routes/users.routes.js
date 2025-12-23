const express = require('express');
const router = express.Router();

// Protected route to get current user details
router.get('/current', ensureAuthenticated ,async(req,res)=>{
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

module.exports = router;