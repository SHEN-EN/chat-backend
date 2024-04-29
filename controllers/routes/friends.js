const Router = require("koa-router");
const friendsModel = require("@/models/modules/friends");
const userModel = require("@/models/modules/user");
const router = new Router();
const { isEmpty } = require("@/util/index");
const logger = require("@/logs/index");
const jwt = require("jwt-simple");
const { jwtSecret } = require("@/config/token");
router.prefix("/v1/friends");

// 获取好友列表
router.get("/getList", async (ctx) => {
    // uuid: 用户id status: 0 | 1 申请是否通过
    const payload = jwt.decode(ctx.header.authorization.split(" ")[1], jwtSecret);

    const { status } = ctx.query;
    if (
        isEmpty({
            status,
        })
    ) {
        ctx.body = {
            code: 400,
            msg: "参数错误",
        };
        return;
    }

    try {
        const result = await friendsModel.friendGetList([payload.uuid, status]);

        for (const iterator of result) {
            const { notes } = (await friendsModel.friendGetNotes([iterator.uuid]))[0]
            iterator.notes = notes;
        }
        delete result[0].password
        ctx.body = {
            code: 200,
            msg: "查询成功",
            data: result,
        };
    } catch (error) {
        ctx.body = {
            code: 500,
            msg: "服务器错误",
        };
        logger.error("/getList ---", error);
    }
});

// 搜索好友
router.get("/searchFriends", async (ctx) => {
    const { account } = ctx.query;
    const payload = jwt.decode(ctx.header.authorization.split(" ")[1], jwtSecret);

    if (
        isEmpty({
            account,
        })
    ) {
        ctx.body = {
            code: 400,
            msg: "参数错误",
        };
        return;
    }

    const user = await exitUser(account);

    if (user.length < 1) {
        //不存在此用户
        ctx.body = {
            code: 200,
            msg: "搜索成功",
            data: [],
        };
        return;
    }

    const { username, avatar } = user[0];

    // 判断搜索的用户是否和本人是好友

    const userFriends = await isExitFriend(payload.uuid, 1); // 本人的朋友列表

    ctx.body = {
        code: 200,
        msg: "搜索成功",
        data: [
            {
                uuid: user[0].uuid,
                username,
                avatar,
                account,
                isFriend: userFriends
                    .map(({ friendUuid }) => friendUuid)
                    .includes(user[0].uuid),
            },
        ],
    };
});
// 添加好友
router.post("/addFriends", async (ctx) => {
    const { account } = ctx.request.body;

    if (
        isEmpty({
            account,
        })
    ) {
        ctx.body = {
            code: 400,
            msg: "参数错误",
        };
        return;
    }

    const payload = jwt.decode(ctx.header.authorization.split(" ")[1], jwtSecret);

    try {
        const senderUser = await exitUser(payload.account); // 申请人信息
        const reciveUser = await exitUser(account); // 接收人信息

        const detail = await isExitFriend(reciveUser[0].uuid, 1); // 查询申请列表是否有申请人信息

        if (detail.length) {
            ctx.body = {
                code: 200,
                msg: "请勿重复申请",
            };
            return;
        }

        // 更新friends表 双向更新
        await friendsModel.friendAddUser([
            payload.account,
            senderUser[0].uuid,
            reciveUser[0].uuid,
            0,
            1
        ]);

        await friendsModel.friendAddUser([
            account,
            reciveUser[0].uuid,
            senderUser[0].uuid,
            0,
            0
        ]);

        ctx.body = {
            code: 200,
            msg: "申请成功",
        };
    } catch (error) {
        ctx.body = {
            code: 500,
            msg: "服务器错误",
        };

        logger.error("/addFriends ---", error);
    }
});



// 修改好友备注
router.put("/setFriendNotes", async (ctx) => {
    const payload = jwt.decode(ctx.header.authorization.split(" ")[1], jwtSecret);
    const { uuid, notes } = ctx.query;

    if (
        isEmpty({
            uuid,
            notes,
        })
    ) {
        ctx.body = {
            code: 400,
            msg: "参数错误",
        };
        return;
    }

    try {
        await friendsModel.updateFriendNotes([
            notes,
            payload.uuid,
            uuid,
        ]);
        ctx.body = {
            code: 200,
            msg: "修改成功",
        };
    } catch (error) {
        logger.error("/setFriendNotes ---", error);
    }
});

// 获取我的好友申请列表
router.get("/getApplyList", async (ctx) => {
    const payload = jwt.decode(ctx.header.authorization.split(" ")[1], jwtSecret);

    try {
        const userFriends = await friendsModel.friendList([payload.uuid, 1]);
        ctx.body = {
            code: 200,
            msg: "查询成功",
            data: userFriends,
        };
    } catch (error) {
        ctx.body = {
            code: 500,
            msg: "服务器错误",
        };
        logger.error("/getApplyList ---", error);
    }
});
// 同意好友申请
router.put("/agreeApply", async (ctx) => {
    const { uuid } = ctx.request.body;

    if (
        isEmpty({
            uuid,
        })
    ) {
        ctx.body = {
            code: 400,
            msg: "参数错误",
        };
        return;
    }

    const payload = jwt.decode(ctx.header.authorization.split(" ")[1], jwtSecret);

    try {
        await friendsModel.agreeApply([payload.uuid, uuid]);
        await friendsModel.agreeApply([uuid, payload.uuid]);
        ctx.body = {
            code: 200,
            msg: "操作成功",
        };
    } catch (error) {
        ctx.body = {
            code: 500,
            msg: "服务器错误",
        };

        logger.error("/agreeApply ---", error);
    }
});
router.delete("/clearApplyList", async (ctx) => {
    const payload = jwt.decode(ctx.header.authorization.split(" ")[1], jwtSecret);
    try {
        await friendsModel.clearApply(payload.uuid);
        ctx.body = {
            code: 200,
            msg: "删除成功",
        };
    } catch (error) {
        ctx.body = {
            code: 500,
            msg: "服务器错误",
        };
        logger.error("/clearApplyList ---", error);
    }
});
const exitUser = async (account) => await userModel.userLogin(account);
const isExitFriend = async (uuid, status) =>
    await friendsModel.friendExists([uuid, status]);
module.exports = router;
