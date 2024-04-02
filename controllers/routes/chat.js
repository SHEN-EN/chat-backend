const Router = require("koa-router");
const router = new Router();
const { Server } = require("socket.io");
const { verifyToken } = require('@/util/index')
const tokenConfig = require('@/config/token')
const jwt = require('jwt-simple')
const client = require('@/models/redis/index')
const logger = require("@/logs/index");

const io = new Server();
const user = {};
io.listen(3001);
io.on("connection", (socket) => {
    const payload = jwt.decode(socket.handshake.auth.authorization.split(' ')[1], tokenConfig.jwtSecret)
    socket.on("join", ({ username }) => {

        // 查询上线用户是否有 离线消息
        client.lRange(payload.uuid, 0, -1).then(res => {
            if (res.length > 0) {
                for (const iterator of res) {
                    io.to(socket.id).emit('private-chat', JSON.parse(iterator))
                }
            }
        })

        user[payload.uuid] = {
            id: socket.id,
            username
        };

    });
    socket.on("private-chat", ({ data, reciverId, avatar }) => {
        
        const messgae = {
            data,
            time: Date.now(),
            senderId: payload.uuid,
            reciverId,
            username: user[payload.uuid].username,
            avatar
        }

        if (!user[reciverId]) { // 用户离线

            client.lPush(`${reciverId}`, JSON.stringify(messgae), (error, reply) => {
                if (error) {
                    logger.error("Error storing message in Redis:", error);
                } else {
                    console.log("Message stored successfully in Redis for user", user[reciverId]);
                }
            });

        } else {
            socket.to(user[reciverId].id).emit('private-chat', messgae)
        }

    });
    // 添加好友通知
    socket.on('add-friends', ({ reciverId }) => {
        socket.to(user[reciverId].id).emit('add-friends')
    })
    //同意好友申请
    socket.on('agree-friend-apply', ({ reciverId, avatar }) => {
        const messgae = {
            data: '',
            time: Date.now(),
            senderId: payload.uuid,
            reciverId,
            username: user[payload.uuid].username,
            avatar,
        }
        socket.to(user[reciverId].id).emit('agree-friend-apply', messgae)
    })
});

io.use((socket, next) => { //拦截器
    const result = verifyToken(socket.handshake.auth.authorization.split(' ')[1], tokenConfig.jwtSecret)
    if (result == 'success') {
        next();
    } else {
        next(new Error("Socket authentication error"));
    }
})
module.exports = router;
