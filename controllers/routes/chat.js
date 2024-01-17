const Router = require('koa-router')
const router = new Router()
const { Server } = require("socket.io");
const io = new Server();
io.listen(3001)
io.on('connection', (socket) => {
    console.log(socket.id);
});
module.exports = router