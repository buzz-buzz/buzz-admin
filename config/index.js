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
            buzzService: 'http://service.bridgeplus.cn:16160',
        }
    }
};

module.exports = config[process.env.NODE_ENV || 'development'] || config.development;