const config = require('./config');
const cookie = require('./cookie-helper');
const util = require('util');
const request = require('request-promise-native')
const jwt = require('jsonwebtoken');

async function setUserToState(context, user_id) {
    context.state.user = {
        userId: user_id,
        super: (config.superUsers || []).indexOf(Number(user_id)) >= 0
    };

    return context.state.user;
}

async function setUserFromCookie(context) {
    if (!context.cookies) {
        return;
    }

    let user_id = context.cookies.get('user_id');

    if (user_id) {
        await setUserToState(context, user_id);
    } else {
        delete context.state.user;
    }
}

async function setUserFromQueryString(context) {
    // TODO: allow login by query string using more safer method (temp token, for example)
    return false;

    let user_id = context.query.user_id;

    if (user_id) {
        await setUserToState(context, user_id);
        cookie.setUserId.call(context, user_id);
    }

    return user_id;
}

async function setUserFromQSOrCookie(context) {
    (await setUserFromQueryString(context))
    || (await setUserFromCookie(context));
}

let membership = {};

membership.getSignInUrl = function (returnUrl) {
    return util.format(config.signInUrl, `${encodeURIComponent(`${config.origin}${returnUrl}`)}`);
};
membership.ensureAuthenticated = async function (context, next) {
    await setUserFromQSOrCookie(context);

    if (!context.state.user) {
        if (context.request.get('X-Request-With') === 'XMLHttpRequest') {
            context.status = 401;
            context.body = membership.getSignInUrl(context.request.referer);
        } else {
            return context.redirect(membership.getSignInUrl(context.request.url));
        }


    }

    await next();
};

membership.rejectAccess = function (ctx) {
    ctx.status = 401;
    ctx.body = '<html><head><title>Buzzbuzz Admin</title></head><body>你当前登录的用户身份没有权限查看该页面，请<a' +
        ' href="/sign-out">点击这里</a>尝试用新的身份登录。</body></html>';
};

membership.ensureSystemUsers = async function (context, next) {
    let userId = context.state.user.userId;

    let token = '';
    try{
        token = jwt.sign({user_id: userId}, process.env.BASIC_PASS);
       }
        catch (ex){
                
       }

    let profile = JSON.parse(await request({
        uri: `${config.endPoints.buzzService}/api/v1/users/${userId}`,
        headers: {
            'X-Requested-With': 'buzz-admin',
            token: token
        }
    }));

    if (!profile.isSystemUser) {
        await membership.signOut(context, async () => {
        });

        membership.rejectAccess(context);

        return;
    } else {
        context.state.user.profile = profile;
        context.state.user.super = profile.isSuper;
    }

    await next();
}

membership.pretendToBeOtherUser = async function (context, next) {
    await setUserToState(context, context.params.user_id)
    cookie.setUserId.call(context, context.params.user_id)

    await next();
}

membership.signOut = async function (ctx, next) {
    cookie.resetSignOnCookies.call(ctx);

    await next();
};

membership.signInFromToken = async (ctx, next) => {
    await setUserFromQSOrCookie(ctx);

    await next();
};

module.exports = membership;
