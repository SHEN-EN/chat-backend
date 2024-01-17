const query = require('../sql')
const userRegistry = (params) => {
    const SQL = `insert into tb_user(uuid,username,password,account) values(?,?,?,?)`
    return query(SQL, params)
}
const userLogin = (params) => {
    const SQL = `select * from tb_user where account = ?`
    return query(SQL, params)
}
const userAddFriends = (params) => {
    const SQL = `insert into tb_user_friends(account,uuid,friendAccount,frienduuid,friendAvatar) values(?,?,?,?,?)`
    return query(SQL, params)
}
module.exports = {
    userRegistry,
    userLogin,
    userAddFriends
}