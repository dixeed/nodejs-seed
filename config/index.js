'use strict';

/* eslint-disable no-process-env, global-require */

const Confidence = require('confidence');
const Hoek = require('hoek');
const chalk = require('chalk');
const parseArgs = require('yargs-parser');

const dbCredentials = require('./database/credentials');
const secureCredentials = require('./security/credentials');
const argOptions = require('./arg-options');

const DEFAULT_PORT = 8890;
let store = null;
// Set a variable to contain the selected environment for NodeJS or default to 'prod'.
// This keyword will then be used to choose between configurations.
const criteria = { env: process.env.NODE_ENV || 'dev' };

// Wrapper for the Confidence Store --> only the get method is available.
exports.get = key => {
  Hoek.assert(store !== null, chalk`{redBright You should call init() first}`);

  return store.get(key, criteria);
};

exports.init = argv => {
  Hoek.assert(store === null, chalk`{redBright You should call init() only once}`);
  Hoek.assert(Array.isArray(argv), chalk`{redBright Argv should be an array}`);

  const parsedArg = parseArgs(argv, argOptions);

  store = new Confidence.Store({
    publicFolder: 'public/',
    publicImgFolder: 'public/images',

    database: {
      syncForce: {
        $filter: 'env',
        prod: false,
        dev: parsedArg.fixtures,
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

    mailer: { transporter: require('./mailer/transporter') },

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
        cookieOptions: {
          ttl: 1000 * 60 * 60 * 24 * 2, // valid for 2 days
          isSecure: true,
          isHttpOnly: true,
          encoding: 'none',
          clearInvalid: false,
          strictHeader: true,
        },
      },
      hash: { algorithm: 'SHA512' },
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
        ops: { interval: 10 * 60 * 1000 },
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
};
