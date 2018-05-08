const Koa = require('koa');
const app = new Koa();
const auth = require('koa-basic-auth');
const staticCache = require('koa-static-cache');
const koaReactView = require('koa-react-view');
const path = require('path');
const register = require('babel-register');
const Router = require('koa-router');
const router = new Router();
const config = require('./config');
const oldRequest = require('request');
const bodyParser = require('koa-bodyparser');
const request = require('request-promise-native');
const cors = require('koa-cors');
const pkg = require('./package.json');

let viewpath = path.join(__dirname, 'views');
let assetPath = path.join(__dirname, 'public');
let nodeModules = path.join(__dirname, 'node_modules');

koaReactView(app, {views: viewpath});

register({
    presets: ['es2015', 'react', 'stage-0'],
    extensions: ['.jsx']
});

app.use(cors({
    origin: '*'
}));
app.use(bodyParser());
// app.use(staticCache('.'));
app.use(staticCache(assetPath));
app.use(staticCache(nodeModules));

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

app.use(async (ctx, next) => {
    console.log('path = ', ctx.path);
    ctx.state.path = ctx.path;
    console.log('path = ', ctx.state.path);
    await next();
});

const version = new Date().getTime()

let clientPage = async ctx => {
    ctx.render('index', Object.assign(ctx.state, {
        title: 'Home | Buzzbuzz admin',
        v: version,
        config: {
            endPoints: {
                adminNeue: config.endPoints.adminNeue
            }
        }
    }));
};
router
    .get('/ping', async ctx => {
        ctx.body = Object.assign(ctx.state, {
            NODE_ENV: process.env.NODE_ENV,
            version: pkg.version
        });
    })
    .get('/', async ctx => {
        ctx.redirect('/classes');
    })
    .get('/students/:userId?', clientPage)
    .get('/companions/:userId?', clientPage)
    .get('/classes', clientPage)

    .get('/avatar/:userId', async ctx => {
        let profile = await request(`${window.config.endPoints.buzzService}/api/v1/users/${ctx.params.userId}`);

        profile = JSON.parse(profile);
        ctx.body = await oldRequest(profile.avatar);
    })
    .post('/proxy', async ctx => {
        if (ctx.request.body.uri) {
            ctx.request.body.uri = ctx.request.body.uri
                .replace('{buzzService}', config.endPoints.buzzService)
            ;
        }

        ctx.body = await oldRequest(Object.assign({
            headers: {
                // "Authorization": auth
                'X-Requested-With': 'buzz-admin'
            }
        }, ctx.request.body));
    })
    .get('/admin-neue/classDetail/:class_id', async ctx => {
        ctx.redirect(`${config.endPoints.adminNeue}/classDetail/${ctx.params.class_id}`);
    })
;

app
    .use(router.routes())
    .use(router.allowedMethods())
;

let port = process.env.PORT || 16666;
app.listen(port, function () {
    console.log('started! at ', port);
});
