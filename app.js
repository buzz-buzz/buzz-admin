const membership = require("./membership");

const koaSend = require('koa-send');

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
const jwt = require('jsonwebtoken');

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
    if (ctx.request.path === '/sign-out') {
        await membership.signOut(ctx, next);
        return ctx.redirect(membership.getSignInUrl('/'));
    } else if (ctx.request.path === '/ping') {
        return ctx.body = Object.assign(ctx.state, {
            NODE_ENV: process.env.NODE_ENV,
            version: pkg.version,
            rootDomain: config.rootDomain
        });
    }

    await next();
});

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        if (401 === Number(err.status)) {
            ctx.set('WWW-Authenticate', 'Basic');
            membership.rejectAccess(ctx);
        } else if (404 === Number(err.statusCode) && err.result && err.result.error !== 'The requested user does not exists') {
            await membership.signOut(ctx, async () => {
            });
            ctx.redirect(membership.getSignInUrl(ctx.request.url));
            //ctx.throw(err.status, err);
        } else {
            if(ctx.request.path === '/'){
                ctx.redirect(membership.getSignInUrl(ctx.request.url));
            }else{
                ctx.throw(err.status, err)
            }
        }
    }
});

// app.use(auth({name: process.env.BASIC_NAME, pass: process.env.BASIC_PASS}));

app.use(membership.ensureAuthenticated)

app.use(membership.ensureSystemUsers)

app.use(async (ctx, next) => {
    ctx.state.path = ctx.path;

    await next();
});

const version = new Date().getTime()

let clientPage = async ctx => {
    ctx.render('index', Object.assign(ctx.state, {
        title: 'Home | BuzzBuzz Admin',
        v: version,
        NODE_ENV: process.env.NODE_ENV,
        config: {
            endPoints: {
                adminNeue: config.endPoints.adminNeue
            }
        },
    }));
};
router
    .get('/', async ctx => {
        ctx.redirect('/classes');
    })
    .get('/users/:userId?', clientPage)
    .get('/students/:userId?',  clientPage)
    .get('/companions/:userId?',  clientPage)
    .get('/classes',  clientPage)
    .get('/version', clientPage)
    .get('/feedbacks/:class_id',  clientPage)
    .get('/avatar/:userId', async ctx => {
        try {
            if(ctx.params.userId && ctx.params.userId !== '0'){
                let profile = await request(`${config.endPoints.buzzService}/api/v1/users/${ctx.params.userId}`, {
                    headers: {
                        'X-Requested-With': 'buzz-admin'
                    }
                });

                profile = JSON.parse(profile);
                if (profile.avatar) {
                    ctx.redirect(profile.avatar)
                }
            }else {
                await koaSend(ctx, '/images/empty_avatar.jpg', {
                    root: __dirname + '/public'
                })
            }
        } catch (error) {
            ctx.redirect('https://cdn-corner.resource.buzzbuzzenglish.com/logo2.png');
        }
    })
    .post('/proxy', async ctx => {
        if (ctx.request.body.uri) {
            ctx.request.body.uri = ctx.request.body.uri
                .replace('{buzzService}', config.endPoints.buzzService)
                .replace('{buzzApi}', config.endPoints.buzzApi)
            ;
        }

        let auth = `Basic ${new Buffer(`${process.env.BASIC_NAME}:${process.env.BASIC_PASS}`).toString('base64')}`;

        let headers = {
            'X-Requested-With': 'buzz-admin'
        };

        if(ctx.state && ctx.state.user && ctx.state.user.userId){
            let token = '';
            try{
                token = jwt.sign({user_id: ctx.state.user.userId}, process.env.BASIC_PASS);
            }
            catch (ex){

            }
            headers.token = token;
            headers.Cookie = `user_id=${ctx.state.user.userId}`;
        }

        let options = {
            headers: headers
        };

        if (['qa', 'production', 'preProduction'].indexOf(process.env.NODE_ENV) >= 0) {
            options.headers["Authorization"] = auth;
            console.log('auth when proxy because it is in ', process.env.NODE_ENV);
        }

        let response = await oldRequest(Object.assign(options, ctx.request.body)); 

        if(response.statusCode === 401 || response.statusCode === 403){
            //ctx.redirect(membership.getSignInUrl('/')); 
            console.log('--no auth--');
            ctx.body = '<html><head><title>Buzzbuzz Admin</title></head><body>你当前登录的用户身份没有权限查看该页面，请<a' +
            ' href="/sign-out">点击这里</a>尝试用新的身份登录。</body></html>';
        }else{
            ctx.body = response;
        }
    })
    .get('/admin-neue/classDetail/:class_id', async ctx => {
        if(ctx.state && ctx.state.user && ctx.state.user.userId){
            let token = jwt.sign({user_id: ctx.state.user.userId}, process.env.BASIC_PASS);
            ctx.redirect(`${config.endPoints.adminNeue}/classDetail/${ctx.params.class_id}?token=${token}`);
        }else{
            ctx.redirect(`${config.endPoints.adminNeue}/classDetail/${ctx.params.class_id}`);
        }
    })
    .get('/admin-neue/tagDetail/:user_id', async ctx => {
        if(ctx.state && ctx.state.user && ctx.state.user.userId){
            let token = jwt.sign({user_id: ctx.state.user.userId}, process.env.BASIC_PASS);
            ctx.redirect(`${config.endPoints.adminNeue}/tagDetail/${ctx.params.user_id}?token=${token}`);
        }else{
            ctx.redirect(`${config.endPoints.adminNeue}/tagDetail/${ctx.params.user_id}`);
        }
    })
    .get('/admin-neue/content-list', async ctx => {
        if(ctx.state && ctx.state.user && ctx.state.user.userId){
            let token = jwt.sign({user_id: ctx.state.user.userId}, process.env.BASIC_PASS);
            ctx.redirect(`${config.endPoints.adminNeue}/contentList?token=${token}`);
        }else{
            ctx.redirect(`${config.endPoints.adminNeue}/contentList`);
        }
    })
    .get('/admin-neue/bannerList', async ctx => {
        if(ctx.state && ctx.state.user && ctx.state.user.userId){
            let token = jwt.sign({user_id: ctx.state.user.userId}, process.env.BASIC_PASS);
            ctx.redirect(`${config.endPoints.adminNeue}/bannerList?token=${token}`);
        }else{
            ctx.redirect(`${config.endPoints.adminNeue}/bannerList`);
        }
    })
    .get('/admin-neue/faq-list', async ctx => {
        if(ctx.state && ctx.state.user && ctx.state.user.userId){
            let token = jwt.sign({user_id: ctx.state.user.userId}, process.env.BASIC_PASS);
            ctx.redirect(`${config.endPoints.adminNeue}/faqList?token=${token}`);
        }else{
            ctx.redirect(`${config.endPoints.adminNeue}/faqList`);
        }
    })
    .get('/admin-neue/importUser', async ctx => {
        if(ctx.state && ctx.state.user && ctx.state.user.userId){
            let token = jwt.sign({user_id: ctx.state.user.userId}, process.env.BASIC_PASS);
            ctx.redirect(`${config.endPoints.adminNeue}/importUser?token=${token}`);
        }else{
            ctx.redirect(`${config.endPoints.adminNeue}/importUser`);
        }
    })
    .get('/admin-neue/referralList', async ctx => {
        if(ctx.state && ctx.state.user && ctx.state.user.userId){
            let token = jwt.sign({user_id: ctx.state.user.userId}, process.env.BASIC_PASS);
            ctx.redirect(`${config.endPoints.adminNeue}/referralList?token=${token}`);
        }else{
            ctx.redirect(`${config.endPoints.adminNeue}/referralList`);
        }
    })
    .get('/admin-neue/weappList', async ctx => {
        if(ctx.state && ctx.state.user && ctx.state.user.userId){
            let token = jwt.sign({user_id: ctx.state.user.userId}, process.env.BASIC_PASS);
            ctx.redirect(`${config.endPoints.adminNeue}/weappList?token=${token}`);
        }else{
            ctx.redirect(`${config.endPoints.adminNeue}/weappList`);
        }
    })
    .get('/current-user', membership.ensureAuthenticated, membership.ensureSystemUsers, async ctx => {
        ctx.body = ctx.state.user;
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
