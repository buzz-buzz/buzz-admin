'use strict';

let config = {
    development: {
        endPoints: {
            buzzService: `${process.env.cors}/127.0.0.1:16888`,
            // buzzService: 'http://localhost:16888',
            adminNeue: `${process.env.admin_neue}`,
        },
        superUsers: [532],
        signInUrl: `http://corner-test.buzzbuzzenglish.com/select-role?return_url=%s`,
        origin: 'http://heroku.buzzbuzzenglish.com:16666'
    },
    qa: {
        endPoints: {
            buzzService: process.env.buzz_service_endpoints,
            adminNeue: `${process.env.admin_neue}`,
        },
        superUsers: [56],
        signInUrl: 'http://corner-test.buzzbuzzenglish.com/select-role?return_url=%s',
        origin: 'http://admin-test.buzzbuzzenglish.com'
    },
    production: {
        endPoints: {
            buzzService: process.env.buzz_service_endpoints,
            adminNeue: `${process.env.admin_neue}`,
        },
        superUsers: [3],
        signInUrl: 'http://live.buzzbuzzenglish.com/select-role?return_url=%s',
        origin: 'http://admin.buzzbuzzenglish.com'
    }
};

config.preProduction = config.production;

module.exports = config[process.env.NODE_ENV || 'development'] || config.development;
