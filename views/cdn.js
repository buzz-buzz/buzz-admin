module.exports = function (resource) {
    if (process.env.NODE_ENV === 'production') {
        return `//cdn-admin-test.buzzbuzzenglish.com${resource}?v=5`
    }

    return resource;
}