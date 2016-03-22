'use strict';

const config = require('./config');
const setDatabaseServerExtensions = require('./config/database/extension');

const Hapi = require('hapi');
const server = new Hapi.Server();

module.exports = server;

/////////////////////////////////////////////////////////////////////////

server.connection({
    host: config.get('/server/host'),
    port: config.get('/server/port')
});

setDatabaseServerExtensions(server);

////////////////////////////////////////////////////////////////////
//                                                                //
//                      Plugins registration                      //
//                                                                //
////////////////////////////////////////////////////////////////////
server.register([
    {
        register: require('hapi-sequelize'),
        options: {
            database: config.get('/database/credentials/dbName'),
            user: config.get('/database/credentials/user'),
            pass: config.get('/database/credentials/pass'),
            dialect: config.get('/database/credentials/dialect'),
            host: config.get('/database/credentials/host'),
            port: config.get('/database/credentials/port'),

            models: 'lib/**/model.js',
            logging: false // should be a function if want to log
        }
    },
    require('hapi-auth-jwt2')
    // Add a hapi plugin here by adding a line with require('./lib/my-plugin').
    // If you want to provide options while registering a plugin you need to use the following synthax instead:
    // {
    //     register: require('./lib/my-plugin'),
    //     options: { myOpt: 'value' }
    // }
])

/////////////////////////////////////////////////////////////////////////
//                                                                     //
//                      Plugins configuration                          //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
.then(function () {
    var db = server.plugins['hapi-sequelize'].db;

    // Reload the database when the server is restarted (only in dev mode).
    return db.sequelize.sync({
        force: config.get('/database/syncForce')
    });
})
.catch(function (err) {
    console.error('Failed to load a plugin: ', err);
    process.exit(2);
})

////////////////////////////////////////////////////////////////////
//                                                                //
//                      Start the server                          //
//                                                                //
////////////////////////////////////////////////////////////////////
.then(function() {
    // Success callback for the db.sequelize.sync() function call above.
    console.log('Models synced: [' + 'OK' + ']');
    return server.start();
})
.then(function() {
    console.log('Server started on port : [' + config.get('/server/port') + ']');
})
.catch(function(err) {
    console.error('Started server with errors: ' + err);
    process.exit(3);
});
