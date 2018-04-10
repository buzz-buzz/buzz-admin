'use strict';

let config = {
    development: {
        endPoints: {
            buzzService: process.env.buzz_service_endpoints || 'https://buzz-corner-service.herokuapp.com',
        }
    },
    qa: {
        endPoints: {
            buzzService: 'http://localhost:16888',
        }
    },
    production: {
        endPoints: {
            buzzService: process.env.buzz_service_endpoints
        }
    }
};

module.exports = config[process.env.NODE_ENV || 'development'] || config.development;
