const Koa = require('koa');
const app = new Koa();
const auth = require('koa-basic-auth');
const staticCache = require('koa-static-cache');
const react = require('koa-react-view');
const path = require('path');
const register = require('babel-register');

let viewpath = path.join(__dirname, 'views');
let assetspath = path.join(__dirname, 'public');

react(app, {views: viewpath});

register({
    presets: ['es2015', 'react'],
    extensions: ['.jsx']
});

app.use(staticCache('.'));
app.use(staticCache(assetspath));

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

app.use(auth({name: process.env.BASIC_NAME, pass: process.env.BASIC_PASS}));

app.use(async ctx => {
    ctx.render('index', {
        title: 'Buzzbuzz Admin',
        list: [
            'hello koa',
            'hello react'
        ]
    });
});

app.listen(process.env.PORT || 16666, function () {
    console.log('started!');
});