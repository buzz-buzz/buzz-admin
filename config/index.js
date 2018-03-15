'use strict';

let config = {
    development: {
        endPoints: {
            buzzService: 'https://buzz-corner-service.herokuapp.com',
        }
    },
    production: {
        endPoints: {
            buzzService: 'http://localhost:16888',
        }
    }
};

module.exports = config[process.env.NODE_ENV || 'development'] || config.development;