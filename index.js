#!/usr/bin/env node

'use strict';

/* eslint-disable global-require, no-process-exit */

const Sequelize = require('sequelize');
const Hapi = require('hapi');
const chalk = require('chalk');
const { Line } = require('clui');
const ora = require('ora');

const config = require('./config');
config.init(process.argv);
const loadFixtures = require('./fixtures');
const MODELS_SYNC_ERROR = 2;
const LOADING_FIXTURES_ERROR = 3;
const LOADING_PLUGINS_ERROR = 4;
const GLOBAL_ERROR = 5;

const server = new Hapi.Server();

// CLI pretty things
const blankLine = new Line().fill();
const pluginsSpinner = ora('Loading plugins');
const modelsSpinner = ora('Models synchronization');
const fixturesSpinner = ora('Loading fixtures');
const serverSpinner = ora('Starting server');

module.exports = server;

// ///////////////////////////////////////////////////////////////////////

server.connection({
  host: config.get('/server/host'),
  port: config.get('/server/port'),
  routes: {
    cors: true,
    files: { relativeTo: __dirname },
  },
});

// //////////////////////////////////////////////////////////////////
//                                                                //
//                      Plugins registration                      //
//                                                                //
// //////////////////////////////////////////////////////////////////
blankLine.output();
pluginsSpinner.start();

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
    require('inert'),
    require('hapi-auth-jwt2'),
    require('./lib/auth-jwt'),
    require('./lib/route-test'),
    // Add a hapi plugin here by adding a line with require('./lib/my-plugin').
    // If you want to provide options while registering a plugin you need to use the following synthax instead:
    // {
    //     Register: require('./lib/my-plugin'),
    //     Options: { myOpt: 'value' }
    // }
  ])
  .catch(err => {
    pluginsSpinner.fail(`Loading plugins: ${err.stack}`);
    blankLine.output();
    process.exit(LOADING_PLUGINS_ERROR);
  })
  // ///////////////////////////////////////////////////////////////////////
  //                                                                     //
  //                      Plugins configuration                          //
  //                                                                     //
  // ///////////////////////////////////////////////////////////////////////
  .then(() => {
    pluginsSpinner.succeed();

    blankLine.output();
    modelsSpinner.start();

    const db = server.plugins['hapi-sequelize'][config.get('/database/name')];

    // Reload the database when the server is restarted (only in dev mode).
    return db.sequelize.sync({ force: config.get('/database/syncForce') });
  })
  .catch(err => {
    modelsSpinner.fail(`Models synchronization: ${err.stack}`);
    blankLine.output();
    process.exit(MODELS_SYNC_ERROR);
  })
  // //////////////////////////////////////////////////////////////////
  //                                                                //
  //                      Start the server                          //
  //                                                                //
  // //////////////////////////////////////////////////////////////////
  .then(() => {
    // Success callback for the db.sequelize.sync() function call above.
    modelsSpinner.succeed();

    blankLine.output();
    fixturesSpinner.start();

    if (config.get('/database/syncForce') === true) {
      return loadFixtures();
    }

    return null;
  })
  .catch(({ stderr }) => {
    fixturesSpinner.fail(`Loading fixtures: ${stderr}`);
    process.exit(LOADING_FIXTURES_ERROR);
  })
  .then(() => {
    if (config.get('/database/syncForce') === true) {
      fixturesSpinner.succeed();
    } else {
      fixturesSpinner.warn();
    }

    blankLine.output();
    serverSpinner.start();

    return server.start();
  })
  .then(() => {
    serverSpinner.succeed(
      chalk`Server started on port : [{yellowBright ${config.get('/server/port')}}]`
    );
    blankLine.output();
  })
  .catch(err => {
    serverSpinner.fail(`Started server with errors: ${err.stack}`);
    blankLine.output();
    process.exit(GLOBAL_ERROR);
  });
