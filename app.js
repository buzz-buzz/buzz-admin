const Koa = require('koa');
const app = new Koa();
const auth = require('koa-basic-auth');

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        if (401 == err.status) {
            ctx.status = 401;
            ctx.set('WWW-Authenticate', 'Basic');
            ctx.body = 'You don\'t have privilege to access this.';
        } else {
            throw err;
        }
    }
});

app.use(auth({name: 'buzzadmin', pass: 'cool'}));

app.use(async ctx => {
    ctx.body = 'Welcome to buzz admin';
});

app.listen(process.env.PORT || 16666, function () {
    console.log('started!');
});