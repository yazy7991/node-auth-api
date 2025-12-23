const Datastore = require('nedb-promises');

// Datastore for storing refresh tokens
const userRefreshToken = Datastore.create('UserRefreshToken.db')

module.exports = userRefreshToken;