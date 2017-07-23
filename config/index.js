'use strict';

/* eslint-disable no-process-env */

const Confidence = require('confidence');
const dbCredentials = require('./database/credentials');
const secureCredentials = require('./security/credentials');

const DEFAULT_PORT = 8890;
let store = null;
// Set a variable to contain the selected environment for NodeJS or default to 'prod'.
// This keyword will then be used to choose between configurations.
const criteria = { env: process.env.NODE_ENV || 'dev' };

// Wrapper for the Confidence Store --> only the get method is available.
exports.get = key => store.get(key, criteria);

store = new Confidence.Store({
  database: {
    syncForce: {
      $filter: 'env',
      prod: false,
      dev: true,
    },
    name: 'mainDB',
    credentials: {
      dbName: dbCredentials[criteria.env].database,
      user: dbCredentials[criteria.env].user,
      pass: dbCredentials[criteria.env].pass,
      dialect: dbCredentials[criteria.env].dialect,
      host: dbCredentials[criteria.env].host,
      port: dbCredentials[criteria.env].port,
    },
  },

  // Edit this setting with the environment variable real name.
  server: {
    host: process.env.MY_PROJECT_HOST || 'localhost',
    port: process.env.MY_PROJECT_PORT || DEFAULT_PORT,
  },

  security: {
    bcryptRound: {
      $filter: 'env',
      prod: 12,
      dev: 12,
      test: 1,
    },
    jwt: {
      key: secureCredentials.jwt.key,
      algorithm: 'HS512',
    },
  },

  good: {
    $filter: 'env',
    dev: {
      ops: { interval: false },
      reporters: {
        consoleReporter: [
          {
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [
              {
                log: '*',
                request: '*',
                response: '*',
                error: '*',
              },
            ],
          },
          { module: 'good-console' },
          'stdout',
        ],
      },
    },
    prod: {
      ops: { interval: 10 * 60 * 1000 }, // eslint-disable-line no-magic-numbers
      reporters: {
        fileOpsReporter: [
          {
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ ops: '*' }],
          },
          {
            module: 'good-squeeze',
            name: 'SafeJson',
          },
          {
            module: 'good-file',
            args: ['./logs/ops.log'],
          },
        ],
        fileLogReporter: [
          {
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [
              {
                log: '*',
                request: { exclude: 'error' },
                response: '*',
              },
            ],
          },
          {
            module: 'good-squeeze',
            name: 'SafeJson',
          },
          {
            module: 'good-file',
            args: ['./logs/prod.log'],
          },
        ],
        fileErrorReporter: [
          {
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [
              {
                error: '*',
                request: 'error',
              },
            ],
          },
          {
            module: 'good-squeeze',
            name: 'SafeJson',
          },
          {
            module: 'good-file',
            args: ['./logs/error-prod.log'],
          },
        ],
      },
    },
  },
});
