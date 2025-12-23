const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');

// Function to generate access token-> short expiry
function generateAccessToken(payload) {
    return jwt.sign(payload, process.env.SECRET_KEY, { subject: config.ACCESS_TOKEN_SUBJECT, expiresIn: config.ACCESS_TOKEN_EXPIRY });
}

// Function to generate refresh token-> longer expiry
function generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_KEY, { subject: config.REFRESH_TOKEN_SUBJECT, expiresIn: config.REFRESH_TOKEN_EXPIRY });
}
module.exports = {
    generateAccessToken, generateRefreshToken
};