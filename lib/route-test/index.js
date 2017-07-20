'use strict';

const Q = require('q');
const Boom = require('boom');

exports.register = (server, options, next) => {
  server.route([
    {
      method: 'GET',
      path: '/test',
      handler(request, reply) {
        request.log(['debug'], 'Debug log request example');
        request.log(['error'], 'Error log request example');
        console.log('console log');
        console.error('console error');
        reply('toto');
      },
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/error',
      handler(request, reply) {
        request.log(['debug'], 'Log request example');
        console.log('console log');
        console.error('console error');
        reply(new Error('I am an error'));
      },
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/boom-wrap/boom-error',
      handler(request, reply) {
        const promise = Q.resolve(null)
          .then(() => {
            throw Boom.notFound('I am a 404 test');
          })
          .catch(err => {
            throw Boom.boomify(err);
          });

        reply(promise);
      },
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/boom-wrap/js-error',
      handler(request, reply) {
        const promise = Q.resolve(null)
          .then(() => {
            throw new Error('I am a regular JS error');
          })
          .catch(err => {
            throw Boom.boomify(err);
          });

        reply(promise);
      },
      config: {
        auth: false,
      },
    },
  ]);

  next();
};

exports.register.attributes = {
  name: 'TestPlugin',
  version: '1.0.0',
};
