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
        await userModel.userRegistry([uuid, username, password, account])

        ctx.body = {
            code: 200,
            token: generateToken(uuid),
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
            msg: '登录成功',
            token: generateToken(user[0].uuid),
            data: {
                uuid: user[0].uuid,
                account,
                username: user[0].username
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
// 搜索好友
router.get('/searchUser', async (ctx) => {
    const { account } = ctx.query

    if (isEmpty({ account })) {
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

    const { uuid, username, avatar } = user[0]

    ctx.body = {
        code: 200,
        msg: '搜索成功',
        data: {
            uuid,
            username,
            avatar,
            account
        }
    }

})
// 添加好友
router.post('/addUser', async (ctx) => {
    const { senderAccount, reciveAccount } = ctx.request.body

    try {
        const senderUser = await exitUser(senderAccount); // 申请人信息 
        const reciveUser = await exitUser(reciveAccount); // 接收人信息

        // 更新friends表 双向更新
        await userModel.userAddFriends([senderAccount, senderUser[0].uuid, reciveAccount, reciveUser[0].uuid, reciveUser[0].avatar || ''])

        await userModel.userAddFriends([reciveAccount, reciveUser[0].uuid, senderAccount, senderUser[0].uuid, senderUser[0].avatar || ''])

        ctx.body = {
            code: 200,
            msg: '添加成功'
        }

    } catch (error) {

        ctx.body = {
            code: 500,
            msg: error
        }
        
    }
})
const exitUser = async (account) => await userModel.userLogin(account)
const generateToken = (uuid) => {
    const payload = {
        expires: Date.now() + tokenExpiresTime,
        uuid
    }
    return jwt.encode(payload, jwtSecret)
}
module.exports = router