const query = require('../sql')
const friendGetList = params => {
    const SQL = `select u.*
    from tb_user u
    join tb_user_friends f ON u.uuid = f.uuid
    where f.frienduuid = ?
    and f.isAgree = ?`;
    return query(SQL, params)
}
const friendAddUser = (params) => {
    const SQL = `insert into tb_user_friends(account,uuid,frienduuid,isAgree,time,isrecord,isapplyUser) values(?,?,?,?,NOW(),1,?)`
    return query(SQL, params)
}
const friendExists = (params) => {
    const SQL = `select * from tb_user_friends where uuid = ? and isAgree=?`
    return query(SQL, params)
}
const friendList = (params) => {
    const SQL = `select * from tb_user_friends where uuid = ? and isrecord = ?`
    return query(SQL, params)
}
const agreeApply = (params) => {
    const SQL = `update tb_user_friends set isAgree='1' where uuid=? and frienduuid=?`
    return query(SQL, params)
}
const clearApply = (params) => {
    const SQL = `update  tb_user_friends set isrecord = '0' where uuid=?`
    return query(SQL, params)
}
const updateFriendNotes = (params) => {
    console.log(params);
    const SQL = `update tb_user_friends set notes = ? where  uuid=? and frienduuid=?`
    return query(SQL, params)
}
module.exports = {
    friendGetList,
    friendAddUser,
    friendExists,
    friendList,
    agreeApply,
    clearApply,
    updateFriendNotes
}