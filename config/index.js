'use strict';

var Confidence = require('confidence');
var dbCredentials = require('./database/credentials');
var secureCredentials = require('./security/credentials');

var store;
var criteria;

// Wrapper for the Confidence Store --> only the get method is available.
exports.get = function(key) {
    return store.get(key, criteria);
};

store = new Confidence.Store({
    database: {
        syncForce: {
            $filter: 'env',
            prod: false,
            dev: true
        },
        credentials: {
            $filter: 'env',
            dev: {
                dbName: dbCredentials.dev.database,
                user: dbCredentials.dev.user,
                pass: dbCredentials.dev.pass,
                dialect: dbCredentials.dev.dialect,
                host: dbCredentials.dev.host,
                port: dbCredentials.dev.port
            }
        }
    },

    // Edit this setting with the environment variable real name.
    server: {
        host: process.env.MY_PROJECT_HOST || 'localhost',
        port: process.env.MY_PROJECT_PORT || 8890
    },

    security: {
        bcryptRound: {
            $filter: 'env',
            prod: 12,
            dev: 12,
            test: 1
        },
        jwt: {
            key: secureCredentials.jwt.key,
            algorithm: 'HS512'
        }
    }
});

// Set a variable to contain the selected environment for NodeJS or default to 'prod'.
// This keyword will then be used to choose between configurations.
criteria = {
    env: process.env.NODE_ENV || 'prod'
};