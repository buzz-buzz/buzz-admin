module.exports = function (resource) {
    if (process.env.NODE_ENV === 'production') {
        return `//cdn-admin.buzzbuzzenglish.com${resource}?v=7`
    }

    if (process.env.NODE_ENV === 'qa') {
        return `//cdn-admin-test.buzzbuzzenglish.com${resource}?v=7`
    }

    return resource;
}