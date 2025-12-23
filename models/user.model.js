const Datastore = require('nedb-promises');

// Initialize NeDB datastores
const users = Datastore.create('User.db')

module.exports = users;