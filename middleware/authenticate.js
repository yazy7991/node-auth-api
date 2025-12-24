const jwt = require('jsonwebtoken');

// Middleware to ensure the user is authenticated
async function ensureAuthenticated(req,res,next) {
    const access_token = req.headers.authorization;
    console.log(access_token);

    if(!access_token){
        return res.status(401).json({ message: 'Accessn token not found'})
    }

    try {
        const decoded_access_token = jwt.verify(access_token,process.env.SECRET_KEY)

        console.log(decoded_access_token); //decoded token info
        
        req.user = {id: decoded_access_token.id}; // Attach user info to request object

        next() // Proceed to next middleware or route handler
        
    } catch (error) {

        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Access token expired', code: 'ACCESS_TOKEN_EXPIRED' }); // Custom code to indicate token expiration
        } else if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Access token invalid', code: 'ACCESS_TOKEN_INVALID' }); // Custom code to indicate invalid token
        }else {
            return res.status(500).json({ message: error.message }); // General server error
        }
        
    }
    
}

module.exports = ensureAuthenticated;
