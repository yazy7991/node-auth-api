const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');

// Function to generate access token
function generateAccessToken(user) {
    return jwt.sign({ id: user.id }, config.SECRET_KEY, { expiresIn: '15m' });
}

// Function to generate refresh token
function generateRefreshToken(user) {
    return jwt.sign({ id: user.id }, config.SECRET_KEY, { expiresIn: '7d' });
}
module.exports = {
    generateAccessToken, generateRefreshToken
};