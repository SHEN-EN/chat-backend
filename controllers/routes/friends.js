const Router = require('koa-router')
const friendsModel = require('@/models/modules/friends')
const router = new Router()
const { isEmpty } = require('@/util/index')

router.prefix('/v1/friends')
// 获取好友列表
router.get('/getList', async (ctx) => {

    const { uuid } = ctx.query
    if (isEmpty({ uuid })) {
        ctx.body = {
            code: 400,
            msg: '参数错误'
        }
        return
    }

    try {
        const result = await friendsModel.friendGetList([uuid])

        ctx.body = {
            code: 200,
            msg: '查询成功',
            data: result.map(item => {
                return {
                    account: item.friendAccount,
                    uuid: item.friendUuid,
                    avatar: item.friendAvatar,
                    username: item.friendUsername,
                }
            }) || []
        }

    } catch (error) {
        ctx.body = {
            code: 500,
            msg: error
        }
    }
})

// 搜索好友
router.get('/searchFriends', async (ctx) => {
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
router.post('/addFriends', async (ctx) => {
    const { senderAccount, reciveAccount } = ctx.request.body

    try {
        const senderUser = await exitUser(senderAccount); // 申请人信息 
        const reciveUser = await exitUser(reciveAccount); // 接收人信息

        // 更新friends表 双向更新
        await friendsModel.friendAddUser([senderAccount, senderUser[0].uuid, reciveAccount, reciveUser[0].uuid, reciveUser[0].avatar, reciveUser[0].username])

        await friendsModel.friendAddUser([reciveAccount, reciveUser[0].uuid, senderAccount, senderUser[0].uuid, senderUser[0].avatar, senderUser[0].username])

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

//获取好友详情
router.get('/getFriendDetail', async (ctx) => {
    const { uuid } = ctx.query;
    if (isEmpty({ uuid })) {
        ctx.body = {
            code: 400,
            msg: '参数错误'
        }
        return
    }

    try {
        const result = await friendsModel.friendGetDetail([uuid])

        if (!result.length) {
            ctx.body = {
                code: 400,
                msg: '请检查uuid是否有误'
            }
            return
        }

        const { username, avatar, account, dec, sex, birthday } = result[0]

        ctx.body = {
            code: 200,
            msg: '查询成功',
            data: {
                username, avatar, account, dec, sex, birthday
            }
        }

    } catch (error) {
        ctx.body = {
            code: 500,
            msg: error
        }
    }

})

const exitUser = async (account) => await userModel.userLogin(account)

module.exports = router