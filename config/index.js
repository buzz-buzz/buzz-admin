'use strict';

let config = {
    development: {
        endPoints: {
            buzzService: `${process.env.cors}/127.0.0.1:16888`,
            adminNeue: `${process.env.admin_neue}`,
        }
    },
    qa: {
        endPoints: {
            buzzService: process.env.buzz_service_endpoints,
            adminNeue: `${process.env.admin_neue}`,
        }
    },
    production: {
        endPoints: {
            buzzService: process.env.buzz_service_endpoints,
            adminNeue: `${process.env.admin_neue}`,
        }
    }
};

config.preProduction = config.production;

module.exports = config[process.env.NODE_ENV || 'development'] || config.development;
