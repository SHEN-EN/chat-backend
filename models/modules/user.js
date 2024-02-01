const query = require('../sql')
const userRegistry = (params) => {
    const SQL = `insert into tb_user(uuid,username,password,account,avatar) values(?,?,?,?,?)`
    return query(SQL, params)
}
const userLogin = (params) => {
    const SQL = `select * from tb_user where account = ?`
    return query(SQL, params)
}
const userEditInfo = (params) => {
    const SQL = `update tb_user set username=?,avatar=?,description=?,sex=?,birthday=? where uuid=?`
    return query(SQL, params)
}
const userGetInfo = (params) => {
    const SQL = `select username,avatar,description,sex,birthday,account from tb_user where uuid=?`
    return query(SQL, params)
}
module.exports = {
    userRegistry,
    userLogin,
    userEditInfo,
    userGetInfo,
}