const query = require('../sql')
const userRegistry = (params) => {
    const SQL = `insert into tb_user(uuid,username,password,avatar,account) values(?,?,?,?,?)`
    return query(SQL, params)
}
const userLogin = (params) => {
    const SQL = `select * from tb_user where account = ?`
    return query(SQL, params)
}
module.exports = {
    userRegistry,
    userLogin
}