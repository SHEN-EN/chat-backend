const Koa = require('koa');
const app = new Koa();
const requireDirectory = require('require-directory')
const router = require('koa-router')
const path = require('path')
const bodyParser = require('koa-bodyparser')
const koaJwt = require('koa-jwt')
const tokenConfig = require('./config/token')
const { verifyToken } = require('./util/index')
const crypto = require('./crypto/index')
const cryptoRSA = new crypto()

const static = require('koa-static')

const { addAliases } = require("module-alias");

addAliases({
    '@': __dirname
})
// static File bodyParser 
const staticPath = './public'
app
    .use(static(path.join(__dirname, staticPath)))
    .use(bodyParser())
    .use(router().allowedMethods())

// logger
app.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});


// *******************JWT********************

app.use(koaJwt({ secret: tokenConfig.jwtSecret }).unless({
    path: tokenConfig.whilePath
}))
// Custom 401 
app.use((ctx, next) => {

    ctx.set('x-PublicKey', `${Buffer.from(cryptoRSA.publicKey).toString('base64')}`)

    if (tokenConfig.whilePath.includes(ctx.url)) {
        return next();
    }
    if (ctx.header && ctx.header.authorization) {
        const result = verifyToken(ctx.header.authorization.split(' ')[1], tokenConfig.jwtSecret)

        if (result == 'epired') {
            ctx.body = {
                code: 401,
                msg: `Token已过期`
            }
            return
        }

        if (result == 'error') {
            ctx.status = 401;
            ctx.body = {
                code: 401,
                msg: `非法Token`
            }
            return
        }
    }
    return next().catch((err) => {
        if (401 == err.status) {
            ctx.status = 401;
            ctx.body = {
                code: 401,
                msg: 'Protected resource, use Authorization header to get access'
            };
        } else {
            throw err;
        }
    });
});


// *******************JWT********************



// x-response-time

app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});

// *******************Router*****************
requireDirectory(module, './controllers/routes', {
    visit: (obj) => {
        obj instanceof router && app.use(obj.routes());
    }
})
// *******************Router*****************
console.log('server is running 127.0.0.1:3000')
app.listen(3000);