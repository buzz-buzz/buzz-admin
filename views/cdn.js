let package = require('../package.json');

module.exports = function (resource) {
    let version = package.version.replace(/\./g, '-')
    if (process.env.NODE_ENV === 'production') {
        return `//cdn-admin.buzzbuzzenglish.com${resource}?v=${version}`
    }

    if (process.env.NODE_ENV === 'qa') {
        return `//cdn-admin-test.buzzbuzzenglish.com${resource}?v=${version}`
    }

    return `${resource}?v=${version}`;
}