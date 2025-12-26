const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {authenticator} = require('otplib');
const qrcode = require('qrcode');
const crypto = require('crypto');
const cache = require('../cache/auth.cache');
const users = require('../models/user.model'); 
const userRefreshToken = require('../models/refreshToken.model');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');
const userInvalidRefreshToken = require('../models/invalidToken.model');
const { SALT_ROUNDS, TTL_VALUE } = require('../config/auth.config');

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

        const hashed_password = await bcrypt.hash(password,SALT_ROUNDS); // Hash the password before storing it in the database. The higher the SALT_ROUNDS, the more secure but slower the hashing process.

        const newUser = await users.insert({
            name, // Shorthand property names
            email, // Shorthand property email
            password: hashed_password, // Store hashed password
            role: role ?? 'member', // Default role is 'member' if role is not provided
            'is2FAEnabled': false, // Default value for 2FA-> the user has not enabled 2FA
            '2FASecret': null // Default value for 2FA-> no secret initially
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
        } // Validate request body

        const fetched_user = await users.findOne({email}) // Fetch user details from the database

        if(!fetched_user){
            return res.status(401).json({
                message: 'Email or Password is invalid'
            })
        }

        // Compare the password from request with the fetched user password in the database
        const password_match = await bcrypt.compare(password,fetched_user.password);

        if(!password_match){
            return res.status(401).json({
                message: 'Email or Password is invalid'
            })

        }

        if(fetched_user.is2FAEnabled){
            const temp_token = crypto.randomUUID(); // Generate a temporary token for 2FA validation

            cache.set(temp_token, {id: fetched_user._id}, TTL_VALUE); // Store user ID in cache with a TTL of 5 minutes (300 seconds)


            return res.status(200).json({                message: '2FA validation required',
                temp_token,
                expiry: Date.now() + TTL_VALUE * 1000 // Expiry time in milliseconds
            }) // Inform the client that 2FA validation is required

        }else{
            // Generate Access and Refresh Token

            const access_token = generateAccessToken({id: fetched_user._id}); // Short expiry
            const refresh_token = generateRefreshToken({id: fetched_user._id}); // Longer expiry

            await userRefreshToken.insert({
                refresh_token,
                id: fetched_user._id
            }) // Store refresh token in the database created to store refresh tokens.

            return res.status(200).json({
                id: fetched_user._id,
                name: fetched_user.name,
                email: fetched_user.email,
                access_token,
                refresh_token
            }) // Return access and refresh token to the user

        }

        
    } catch (error) {
        return res.status(500).json({message: error.message})
        
    }
    
}

// Refresh Token Controller-> Issue new Access and Refresh Tokens
const refreshToken = async(req,res)=>{
    try {
        const {refresh_token} = req.body;

        if(!refresh_token){
            return res.status(401).json({
                message: 'Refresh token not found'
            })
        } /// Validate request body

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
        } // Handle token errors specifically-> invalid or expired tokens
        return res.status(500).json({
            message: error.message
        })
        
    }
}

// 2FA Controller -> Generate and return 2FA QR Code
const get2FAQrCode = async (req, res) => {
    try {
        const user = await users.findOne({id: req.user.id}); // Fetch user details from the database

        const secret = authenticator.generateSecret(); // Generate a unique secret for the user

        const otpauth = authenticator.keyuri(user.email, 'MyApp', secret); // Generate otpauth URL

        await users.update({id: req.user.id}, {
            $set: {
                '2FASecret': secret,
                'is2FAEnabled': true
            }
        }); // Store the secret and enable 2FA for the user

        await users.compactDatafile(); // Compact the database to free up space

        const qrCodeImage = await qrcode.toBuffer(otpauth, {type: 'image/png', margin: 1}); // Generate QR code image buffer
        res.setHeader('Content-Disposition', 'attachment; filename="qr-code.png"'); // Set header for file download
        return res.status(200).type('image/png').send(qrCodeImage); // Send the QR code image as a response

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

// 2FA Controller -> Validate 2FA Code
const validate2FACode = async (req, res) => {
    try {
        const { totp } = req.body; // Extract TOTP code from request body

        if (!totp) {
            return res.status(422).json({
                message: 'TOTP code is required'
            });
        } // Validate request body

        const user = await users.findOne({ id: req.user.id }); // Fetch user details from the database

        if (!user || !user.is2FAEnabled || !user['2FASecret']) {
            return res.status(400).json({
                message: '2FA is not enabled for this user'
            });
        } // Check if 2FA is enabled for the user

        const isValid = authenticator.check(totp, user['2FASecret']); // Validate the provided TOTP code

        if (!isValid) {
            return res.status(401).json({
                message: 'Invalid TOTP code'
            });
        } // If TOTP code is invalid

        await users.update({ id: req.user.id }, {
            $set: {
                'is2FAEnabled': true
            }
        }); // Mark 2FA as validated for the user

        await users.compactDatafile(); // Compact the database to free up space

        return res.status(200).json({
            message: '2FA validation successful'
        }); // Successful validation
    }
    catch (error) {
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
    get2FAQrCode,
    validate2FACode,
    logout
}