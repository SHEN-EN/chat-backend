const jwt = require('jwt-simple')
const isEmpty = (obj) => {
    for (const key in obj) {
        if (!obj[key]) {
            return true;
        }
    }
    return false
}
const verifyToken = (token, jwtSecret) => {
    try {
        const payload = jwt.decode(token, jwtSecret)
        const timeStamp = Date.now()
        if (timeStamp > payload.expires) {
            return 'epired'
        }
        return 'success'
    } catch (error) {
        console.error(error)
        return 'error'
    }
}

module.exports = {
    isEmpty,
    verifyToken
}