'use strict';

let config = {
    development: {
        endPoints: {
            buzzService: 'https://buzz-corner-service.herokuapp.com',
        }
    },
    uat: {
        endPoints: {
            buzzService: 'https://buzz-corner-service.herokuapp.com',
        }
    },
    production: {
        endPoints: {
            buzzService: 'https://localhost:16888',
        }
    }
};

module.exports = config[process.env.NODE_ENV || 'development'] || config.development;