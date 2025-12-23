const Datastore = require('nedb-promises');

// Datastore for storing refresh tokens
const RefreshToken = Datastore.create('RefreshToken.db')

module.exports = RefreshToken;