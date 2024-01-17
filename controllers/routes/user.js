const Router = require('koa-router')
const router = new Router()
const userModel = require('@/models/modules/user')
const { v4: uuidv4 } = require('uuid');
const { isEmpty } = require('@/util/index')
const { tokenExpiresTime, jwtSecret } = require('@/config/token')
const jwt = require('jwt-simple')

router.prefix('/v1/users')
router.post('/register', async (ctx) => {

    const { username, password, account } = ctx.request.body;

    if (isEmpty({ account, password, account })) {
        ctx.body = {
            code: 400,
            msg: '参数错误'
        }
        return
    }

    const user = await exitUser(account)

    if (user.length > 0) {
        ctx.body = {
            code: 400,
            msg: '用户已存在,请勿重复注册'
        }
        return
    }

    try {
        const uuid = uuidv4();
        await userModel.userRegistry([uuid, username, password, null, account])

        ctx.body = {
            code: 200,
            token: generateToken(uuid),
            msg: '注册成功'
        }
    } catch (error) {
        ctx.body = {
            code: 500,
            msg: error
        }
    }

})

router.post('/login', async (ctx) => {

    const { account, password } = ctx.request.body;

    if (isEmpty({ account, password })) {
        ctx.body = {
            code: 400,
            msg: '参数错误'
        }
        return
    }

    const user = await exitUser(account)

    if (user.length < 1) {
        ctx.body = {
            code: 400,
            msg: '账号不存在'
        }
        return
    }

    if (user[0].password === password) {
        ctx.body = {
            code: 200,
            msg: '登录成功'
        }
        return
    } else {
        ctx.body = {
            code: 400,
            msg: '密码错误'
        }
        return
    }
})
const exitUser = async (account) => await userModel.userLogin(account)
const verifyParams = ctx => {
    const { account, password } = ctx.request.body;
    if (isEmpty({ account, password })) {
        ctx.body = {
            code: 400,
            msg: '参数错误'
        }
        return false
    }
    return true
}
const generateToken = (uuid) => {
    const payload = {
        expires: Date.now() + tokenExpiresTime,
        uuid
    }
    return jwt.encode(payload, jwtSecret)
}
module.exports = router