'use strict';

module.exports = function setDatabaseServerExtension(server) {

    server.ext({
        type: 'onPreHandler',
        method: function(request, reply) {
            request.models = server.plugins['hapi-sequelize'].db.sequelize.models;
            reply.continue();
        }
    });
};