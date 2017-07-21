'use strict';

var config = require('../../config');
var jwt = require('jsonwebtoken');

var internals = {};

exports.register = function(server, options, next) {
  // Define the 'jwt' strategy for authentication on the server.
  server.auth.strategy('jwt', 'jwt', {
    key: config.get('/security/jwt/key'),
    validateFunc: internals.validate,
    verifyOptions: { algorithms: [config.get('/security/jwt/algorithm')] },
  });

  // Set the 'jwt' authentication strategy as the default to apply if no config is specified for a route.
  server.auth.default('jwt');
  server.ext(internals.generateTokenExtension);

  next();
};

exports.register.attributes = {
  name: 'ProjectAuthJwtPlugin',
  version: '1.0.0',
};

internals.cookieOptions = {
  ttl: 1000 * 60 * 60 * 24 * 2, // valid for a month
  isSecure: true,
  isHttpOnly: true,
  encoding: 'none',
  clearInvalid: false,
  strictHeader: true,
};

internals.generateTokenExtension = {
  type: 'onPostHandler',
  method: function createToken(request, response) {
    if (request.path === '/login' || request.path === '/register') {
      var user = request.response.source;

      // If an error happened during the login / registration, the token is not added.
      if (request.response.isBoom) {
        return response.continue();
      }

      var tokenClaims = {
        id: user.id,
      };

      var token = jwt.sign(tokenClaims, config.get('/security/jwt/key'), {
        algorithm: config.get('/security/jwt/algorithm'),
        //TODO: see if other options are needed
      });

      return response(user)
        .header('Authorization', token)
        .state('token', token, internals.cookieOptions);
    }

    return response.continue();
  },
};

internals.validate = function(decoded, request, callback) {
  // TODO: should implement scopes verification, could implement jti fields verifications
  return callback(null, true);
};
