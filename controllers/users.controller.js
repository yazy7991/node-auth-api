const users = require('../models/user.model');

const currentUser = async(req,res)=>{
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

}

module.exports = {
    currentUser
};