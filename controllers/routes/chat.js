const Router = require("koa-router");
const router = new Router();
const { Server } = require("socket.io");
const { verifyToken } = require('@/util/index')
const tokenConfig = require('@/config/token')
const jwt = require('jwt-simple')

const io = new Server();
const user = {};
io.listen(3001);
io.on("connection", (socket) => {
    const payload = jwt.decode(socket.handshake.auth.authorization.split(' ')[1], tokenConfig.jwtSecret)
    socket.on("join", ({ username }) => {
        user[payload.uuid] = {
            id: socket.id,
            username
        };

    });
    socket.on("private-chat", ({ data, reciverId }) => {

        const messsgae = {
            data,
            time: Date.now(),
            senderId: payload.uuid,
            reciverId,
            username: user[payload.uuid].username,
        }

        socket.to(user[reciverId].id).emit('private-chat', messsgae)

    });
    // 添加好友通知
    socket.on('add-friends', ({ reciverId }) => {
        socket.to(user[reciverId].id).emit('add-friends')
    })
    //同意好友申请
    socket.on('agree-friend-apply', ({ reciverId, avatar }) => {
        const messsgae = {
            data: '',
            time: Date.now(),
            senderId: payload.uuid,
            reciverId,
            username: user[payload.uuid].username,
            avatar,
        }
        socket.to(user[reciverId].id).emit('agree-friend-apply', messsgae)
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
