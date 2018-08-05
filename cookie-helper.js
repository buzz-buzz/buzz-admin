let config = require('./config')

let clearCookieOption = {
    expires: new Date(1970, 1, 1),
    path: '/',
    httpOnly: true
};
let sessionCookieOption = {
    expires: 0,
    path: '/',
    httpOnly: true
};

let o = {
    setUserId: function (user_id) {
        this.cookies.set('user_id', user_id, sessionCookieOption);
    },
    deleteUserId: function () {
        this.cookies.set('user_id', '', clearCookieOption);
        this.cookies.set('user_id', '', {
            ...clearCookieOption,
            domain: config.rootDomain
        })
    }
};

o.resetSignOnCookies = function () {
    o.deleteUserId.call(this);
};

module.exports = o;
