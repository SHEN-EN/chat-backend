const Router = require('koa-router')
const router = new Router()
const userModel = require('@/models/modules/user')
const logger = require('@/logs/index')
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
        await userModel.userRegistry([uuid, username, password, account, 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'])

        ctx.body = {
            code: 200,
            token: generateToken({ uuid, account }),
            msg: '注册成功',
            data: {
                uuid,
                account,
                username
            }
        }
    } catch (error) {
        ctx.body = {
            code: 500,
            msg: '服务器错误'
        }
        logger.error('/register ---', error)
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
            msg: '登录成功',
            token: generateToken({ uuid: user[0].uuid, account }),
            data: {
                uuid: user[0].uuid,
                account,
                username: user[0].username,
            }
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

router.put('/editUserInfo', async (ctx) => {
    const { username, avatar, birthday, sex, dec } = ctx.request.body;

    const payload = jwt.decode(ctx.header.authorization.split(' ')[1], jwtSecret)

    try {
        await userModel.userEditInfo([username, avatar, dec, sex, birthday, payload.uuid])

        ctx.body = {
            code: 200,
            msg: '修改成功'
        }

    } catch (error) {

        ctx.body = {
            code: 500,
            msg: '服务器错误'
        }

        logger.error('/editUserInfo ---', error)

    }

})

router.get('/getUserInfo', async (ctx) => {
    const payload = jwt.decode(ctx.header.authorization.split(' ')[1], jwtSecret)
    const data = await userModel.userGetInfo([payload.uuid]);

    ctx.body = {
        code: 200,
        msg: '查询成功',
        data: { ...data[0], uuid: payload.uuid }
    }
})
const exitUser = async (account) => await userModel.userLogin(account)
const generateToken = ({ uuid, account }) => {
    const payload = {
        expires: Date.now() + tokenExpiresTime,
        uuid,
        account
    }
    return jwt.encode(payload, jwtSecret)
}
module.exports = router