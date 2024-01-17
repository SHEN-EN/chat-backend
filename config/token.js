const tokenConfig = {
    jwtSecret: 'jwtSecret',
    tokenExpiresTime: 1000 * 60 * 60 * 24 * 7,
    whilePath: ['/v1/users/register', '/v1/users/login']
}
module.exports = tokenConfig