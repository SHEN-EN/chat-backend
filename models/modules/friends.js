const query = require('../sql')
const friendGetList = params => {
    const SQL = `select * from tb_user_friends where uuid = ? and isAgree=?`;
    return query(SQL, params)
}
const friendAddUser = (params) => {
    const SQL = `insert into tb_user_friends(account,uuid,friendAccount,frienduuid,friendAvatar,friendUsername,isAgree,time) values(?,?,?,?,?,?,?,NOW())`
    return query(SQL, params)
}
const friendGetDetail = (params) => {
    const SQL = `select * from tb_user where uuid = ?`
    return query(SQL, params)
}
const friendExists = (params) => {
    const SQL = `select * from tb_user_friends where uuid = ? and isAgree=?`
    return query(SQL, params)
}
const friendList = (params) => {
    const SQL = `select * from tb_user_friends where uuid = ?`
    return query(SQL, params)
}
const agreeApply = (params) => {
    const SQL = `update tb_user_friends set isAgree='1' where uuid=? and frienduuid=?`
    return query(SQL, params)
}
module.exports = {
    friendGetList,
    friendAddUser,
    friendGetDetail,
    friendExists,
    friendList,
    agreeApply
}