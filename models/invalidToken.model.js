const Datastore = require('nedb-promises');

// Datastore for storing invalid refresh tokens
const userInvalidRefreshToken = Datastore.create('UserInvalidToken.db')

module.exports = userInvalidRefreshToken;