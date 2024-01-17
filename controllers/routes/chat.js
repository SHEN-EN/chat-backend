const Router = require("koa-router");
const router = new Router();
const { Server } = require("socket.io");
const io = new Server();
const user = {};
io.listen(3001);
io.on("connection", (socket) => {
    socket.on("join", (userId) => {
        if (!userId) return;
        user[userId] = socket.id;
    });
    socket.on("private-chat", ({ data, reciverId, senderId }) => {

        const messsgae = {
            data,
            time: Date.now(),
            senderId,
        }

        socket.to(user[reciverId]).emit('private-chat', messsgae)
        
    });
});
module.exports = router;
