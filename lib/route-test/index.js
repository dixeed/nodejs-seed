'use strict';

exports.register = (server, options, next) => {
  server.route([
    {
      method: 'GET',
      path: '/test',
      handler(request, reply) {
        request.log('Log request example');
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
        request.log('Log request example');
        console.log('console log');
        console.error('console error');
        reply(new Error('I am an error'));
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
