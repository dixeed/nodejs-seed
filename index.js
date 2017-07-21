'use strict';

const Sequelize = require('sequelize');
const Hapi = require('hapi');

const config = require('./config');
const loadFixtures = require('./fixtures');

const server = new Hapi.Server();

module.exports = server;

/////////////////////////////////////////////////////////////////////////

server.connection({
  host: config.get('/server/host'),
  port: config.get('/server/port'),
  routes: {
    cors: true,
    files: {
      relativeTo: __dirname,
    },
  },
});

////////////////////////////////////////////////////////////////////
//                                                                //
//                      Plugins registration                      //
//                                                                //
////////////////////////////////////////////////////////////////////
server
  .register([
    {
      register: require('hapi-sequelize'),
      options: {
        name: config.get('/database/name'),
        sequelize: new Sequelize(
          config.get('/database/credentials/dbName'),
          config.get('/database/credentials/user'),
          config.get('/database/credentials/pass'),
          {
            dialect: config.get('/database/credentials/dialect'),
            host: config.get('/database/credentials/host'),
            port: config.get('/database/credentials/port'),
          }
        ),

        models: ['lib/**/model.js', 'lib/**/models/*.js'],
        forceSync: config.get('/database/syncForce'),
      },
    },
    {
      register: require('good'),
      options: config.get('/good'),
    },
    require('hapi-auth-jwt2'),
    require('./lib/auth-jwt'),
    require('./lib/route-test'),
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
  .then(() => {
    const db = server.plugins['hapi-sequelize'][config.get('/database/name')];

    // Reload the database when the server is restarted (only in dev mode).
    return db.sequelize.sync({
      force: config.get('/database/syncForce'),
    });
  })
  .catch(function(err) {
    console.error('Failed to load a plugin: ', err);
    process.exit(2);
  })
  ////////////////////////////////////////////////////////////////////
  //                                                                //
  //                      Start the server                          //
  //                                                                //
  ////////////////////////////////////////////////////////////////////
  .then(() => {
    // Success callback for the db.sequelize.sync() function call above.
    console.log('Models synced: [' + 'OK' + ']');
    console.log('Loading fixtures ...');
    return loadFixtures();
  })
  .then(status => {
    console.log(status);

    return server.start();
  })
  .then(function() {
    console.log('Server started on port : [' + config.get('/server/port') + ']');
  })
  .catch(function(err) {
    console.error('Started server with errors: ' + err);
    process.exit(3);
  });
