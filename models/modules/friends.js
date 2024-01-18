const query = require('../sql')
const friendGetList = params => {
    const SQL = `select * from tb_user_friends where uuid = ?`;
    return query(SQL, params)
}
const friendAddUser = (params) => {
    const SQL = `insert into tb_user_friends(account,uuid,friendAccount,frienduuid,friendAvatar,friendUsername) values(?,?,?,?,?,?)`
    return query(SQL, params)
}
const friendGetDetail = (params) => {
    const SQL = `select * from tb_user where uuid = ?`
    return query(SQL, params)
}
module.exports = {
    friendGetList,
    friendAddUser,
    friendGetDetail,
}