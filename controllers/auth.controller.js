const bcrypt = require('bcryptjs');
const users = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');

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

        const refresh_token = jwt.sign({id: user._id},process.env.REFRESH_KEY, {subject:'refreshToken', expiresIn: '1w'});

        await userRefreshTokens.insert({
            refresh_token,
            id:user._id
        })

        return res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            access_token,
            refresh_token
        })

        
    } catch (error) {
        return res.status(500).json({message: error.message})
        
    }
    
}

const refreshToken = async(req,res)=>{
    try {
        const {refresh_token} = req.body;

        if(!refresh_token){
            return res.status(401).json({
                message: 'Refresh token not found'
            })
        }

        const decodedRefreshToken = jwt.verify(refresh_token,process.env.REFRESH_KEY); // Will throw error if token is invalid or expired

        const userRefreshToken = await userRefreshTokens.findOne({
            refresh_token,
            id:  decodedRefreshToken.id
        })

        if(!userRefreshToken){
            return res.status(401).json({
                message: 'Refresh token invalid or expired'
            })

        }

        await userRefreshTokens.remove({_id:userRefreshToken._id})



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


module.exports = {
    register,
    login,
    refreshToken
}