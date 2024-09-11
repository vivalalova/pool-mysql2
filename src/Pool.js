const mysql = require('mysql2/promise')
const QueryBuilder = require('./QueryBuilder')

module.exports = function createPool(options) {
  const pool = mysql.createPool(options)

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

  return pool
}
