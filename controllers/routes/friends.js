const Router = require('koa-router')
const friendsModel = require('@/models/modules/friends')
const userModel = require('@/models/modules/user')
const router = new Router()
const { isEmpty } = require('@/util/index')
const logger = require('@/logs/index')

router.prefix('/v1/friends')

// 获取好友列表
router.get('/getList', async (ctx) => {
    // uuid: 用户id status: 0 | 1 申请是否通过
    const { uuid, status } = ctx.query
    if (isEmpty({ uuid, status })) {
        ctx.body = {
            code: 400,
            msg: '参数错误'
        }
        return
    }

    try {
        const result = await friendsModel.friendGetList([uuid, status])

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
            msg: '服务器错误'
        }
        logger.error('/getList ---', error)
    }
})

// 搜索好友
router.get('/searchFriends', async (ctx) => {
    const { account, uuid } = ctx.query

    if (isEmpty({ account, uuid })) {
        ctx.body = {
            code: 400,
            msg: '参数错误'
        }
        return
    }

    const user = await exitUser(account)

    if (user.length < 1) {
        ctx.body = {
            code: 200,
            msg: '搜索成功',
            data: []
        }
        return
    }

    const { username, avatar } = user[0]

    // 判断搜索的用户是否和本人是好友

    const userFriends = await isExitFriend(uuid, 1) // 本人的朋友列表

    ctx.body = {
        code: 200,
        msg: '搜索成功',
        data: [{
            uuid: user[0].uuid,
            username,
            avatar,
            account,
            isFriend: userFriends.map(({ friendUuid }) => friendUuid).includes(user[0].uuid)
        }]
    }

})
// 添加好友
router.post('/addFriends', async (ctx) => {
    const { senderAccount, reciveAccount } = ctx.request.body

    try {
        const senderUser = await exitUser(senderAccount); // 申请人信息 
        const reciveUser = await exitUser(reciveAccount); // 接收人信息


        const detail = await isExitFriend(reciveUser[0].uuid, 1) // 查询申请列表是否有申请人信息

        if (detail.length) {
            ctx.body = {
                code: 200,
                msg: '请勿重复申请'
            }
            return
        }

        // 更新friends表 双向更新
        await friendsModel.friendAddUser([senderAccount, senderUser[0].uuid, reciveAccount, reciveUser[0].uuid, reciveUser[0].avatar, reciveUser[0].username, 0])

        await friendsModel.friendAddUser([reciveAccount, reciveUser[0].uuid, senderAccount, senderUser[0].uuid, senderUser[0].avatar, senderUser[0].username, 0])

        ctx.body = {
            code: 200,
            msg: '申请成功'
        }

    } catch (error) {

        ctx.body = {
            code: 500,
            msg: '服务器错误'
        }

        logger.error('/addFriends ---', error)

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
            msg: '服务器错误'
        }
        logger.error('/getFriendDetail ---', error)
    }

})
// 获取我的好友申请列表
router.get('/getApplyList', async (ctx) => {
    const { uuid } = ctx.query;

    if (isEmpty({ uuid })) {
        ctx.body = {
            code: 400,
            msg: '参数错误'
        }
        return
    }
    try {
        const userFriends = await friendsModel.friendList(uuid)

        ctx.body = {
            code: 200,
            msg: '查询成功',
            data: userFriends,
        }
    } catch (error) {

        ctx.body = {
            code: 500,
            msg: '服务器错误'
        }
        logger.error('/getApplyList ---', error)
    }


})
const exitUser = async (account) => await userModel.userLogin(account)
const isExitFriend = async (uuid, status) => await friendsModel.friendExists([uuid, status])
module.exports = router