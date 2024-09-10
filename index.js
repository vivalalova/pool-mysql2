const mysql = require('mysql2/promise')

const pool = mysql
  .createPool({
    host: 'localhost',
    user: 'root',
    password: '123',
    database: 'db',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // Maximum idle connections, default equals `connectionLimit`
    idleTimeout: 60000, // Idle connection timeout in milliseconds, default value is 60000 ms
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  })

const QueryBuilder = require('./src/QueryBuilder')

pool.SELECT = function (first = '{{columns}}', ...others) {
  const columns = [first, ...others]
  return new QueryBuilder(pool, `SELECT ${columns.join(', ')}`)
}

pool.INSERT = function (ignore = false) {
  return new QueryBuilder(pool, `INSERT${ignore ? ' IGNORE' : ''}`)
}

pool.UPDATE = function (Model) {
  return new QueryBuilder(pool, `UPDATE \`${Model.name}\``, { Model })
}

pool.DELETE = function () {
  return new QueryBuilder(pool, 'DELETE')
}

module.exports = { pool, Schema: require('./src/Schema') }
