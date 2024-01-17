const config = require('../config/database')
const mysql = require('mysql');
const pool = mysql.createPool(config)
const query = (sql, value) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(`SQL ERROR:${err}`)
            } else {
                connection.query(sql, value, (err, rows) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(rows);
                    }
                    connection.release()
                })
            }

        })
    })
}
module.exports = query;