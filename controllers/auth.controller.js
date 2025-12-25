const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const users = require('../models/user.model');
const userRefreshToken = require('../models/refreshToken.model');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');
const userInvalidRefreshToken = require('../models/invalidToken.model');

// Register Controller
const register = async(req,res)=>{
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
}

// Login Controller
const login = async (req,res) => {
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

        // Generate Access and Refresh Token

        const access_token = generateAccessToken({id: user._id}); // Short expiry
        const refresh_token = generateRefreshToken({id: user._id}); // Longer expiry

        await userRefreshToken.insert({
            refresh_token,
            id:user._id
        }) // Store refresh token in the database

        return res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            access_token,
            refresh_token
        }) // Return access and refresh token to the user

        
    } catch (error) {
        return res.status(500).json({message: error.message})
        
    }
    
}

// Refresh Token Controller
const refreshToken = async(req,res)=>{
    try {
        const {refresh_token} = req.body;

        if(!refresh_token){
            return res.status(401).json({
                message: 'Refresh token not found'
            })
        }

        const decodedRefreshToken = jwt.verify(refresh_token,process.env.REFRESH_KEY); // Will throw error if token is invalid or expired

        const storedRefreshToken = await userRefreshToken.findOne({
            refresh_token,
            id:  decodedRefreshToken.id
        }) // Check if the refresh token exists in the database

        if(!storedRefreshToken){
            return res.status(401).json({
                message: 'Refresh token invalid or expired'
            })

        } // If refresh token not found in the database

        await userRefreshToken.remove({_id: storedRefreshToken._id}) // Invalidate the used refresh token

        await userRefreshToken.compactDatafile() // Compact the database to free up space

        const newAccessToken = generateAccessToken({id: decodedRefreshToken.id}); // Generate new access token
        const newRefreshToken = generateRefreshToken({id: decodedRefreshToken.id}); // Generate new refresh token

        await userRefreshToken.insert({
            refresh_token: newRefreshToken,
            id: decodedRefreshToken.id
        }) // Store the new refresh token in the database

        return res.status(200).json({
            access_token: newAccessToken,
            refresh_token: newRefreshToken
        }) // Return the new tokens to the user

    } catch (error) {

        if(error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError){
            return res.status(401).json({
                message: 'Refresh token invalid or expired'
            })
        }
        return res.status(500).json({
            message: error.message
        })
        
    }
}

// Logout Controller
const logout = async (req,res) => {
    try {
        await userRefreshToken.removeMany({id: req.user.id}) // Remove all refresh tokens associated with the user

        await userRefreshToken.compactDatafile() // Compact the database to free up space

        await userInvalidRefreshToken.insert({
            invalid_token: req.access_token.value,
            expirationTime: req.access_token.exp,
            id: req.user.id
        }) // Store the invalidated access token

        return res.status(204).send() // Successful logout with no content

    } catch (error) {

        return res.status(500).json({
            message: error.message
        })
        
    }
}

module.exports = {
    register,
    login,
    refreshToken,
    logout
}