const Router = require("koa-router");
const router = new Router();
const { Server } = require("socket.io");
const io = new Server();
const user = {};
io.listen(3001);
io.on("connection", (socket) => {
    socket.on("join", ({ uuid, username }) => {
        if (!uuid) return;
        user[uuid] = {
            id: socket.id,
            username
        };

    });
    socket.on("private-chat", ({ data, reciverId, senderId }) => {

        const messsgae = {
            data,
            time: Date.now(),
            senderId,
            reciverId,
            username: user[senderId].username,
        }
        
        socket.to(user[reciverId].id).emit('private-chat', messsgae)

    });
});
module.exports = router;
