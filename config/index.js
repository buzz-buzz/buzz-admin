'use strict';

let config = {
    development: {
        endPoints: {
            buzzService: `${process.env.cors}127.0.0.1:16888`,
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
