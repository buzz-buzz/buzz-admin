const Koa = require('koa');
const app = new Koa();

app.use(async ctx => {
    ctx.body = 'Welcome to BuzzAdmin';
});

app.listen(process.env.PORT || 16666);