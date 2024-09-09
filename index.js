const mysql = require('mysql2')
const pool = require('./pool')

pool.INSERT = function (ignore = false) {
  return new QueryBuilder(pool, `INSERT ${ignore ? 'IGNORE' : ''}`)
}

pool.SELECT = function () {
  return new QueryBuilder(pool, 'SELECT {{columns}}')
}

class Schema {
  static get columns() {
    return {}
  }
}

class Camera extends Schema {
  static get columns() {
    return {
      id: 'string',
      name: 'string',
      description: 'string',
      location: 'string',
      url: 'string',
      tag1: 'string',
      created_at: 'datetime',
      updated_at: 'datetime'
    };
  }
}


class QueryBuilder {
  constructor(pool, queryType) {
    this.pool = pool;
    this.Model = null;
    this.query = [queryType]
    this.values = []
  }

  INTO(Model) {
    this.Model = Model;
    this.query.push(`INTO ${this.Model.name.toLowerCase()}`);
    return this;
  }

  FROM(Model) {
    this.Model = Model;
    this.query.push(`FROM ${this.Model.name.toLowerCase()}`);
    return this;
  }

  SET() {
    const updateStatements = Object.keys(this.values[0]).map(col => `${col} = VALUES(${col})`).join(', ');
    this.query.push(`SET ${updateStatements}, updated_at = NOW()`);
    return this;
  }

  VALUES(array) {
    this.values = array;
    const columnNames = Object.keys(this.values[0]);
    const placeholders = columnNames.map(() => '?').join(', ');
    this.query.push(`(${columnNames.join(', ')}) VALUES(${placeholders})`);
    return this;
  }

  WHERE_AND(object) {
    if (typeof object !== 'object') {
      throw 'WHERE_CLAUSE must input object'
    }

    let result = this.WHERE('1=1')

    for (const key in object) {
      const value = object[key]
      result = result.AND({ [key]: value })
    }

    return this;
  }

  WHERE(condition, value = null) {
    if (typeof condition === 'string') {
      this.query.push('WHERE ' + condition)
      if (value != undefined) {
        this.values.push(value)
      }
    } else if (typeof condition === 'object') {
      this.query.push(`WHERE ${Object.keys(condition)[0]} = ?`)
      this.values.push(Object.values(condition)[0])
    }

    return this;
  }

  AND(condition, value = null) {
    if (typeof condition === 'string') {
      this.query.push('AND ' + condition)
      if (value != undefined) {
        this.values.push(value)
      }
    } else if (typeof condition === 'object') {
      this.query.push(`WHERE ${Object.keys(condition)[0]} = ?`)
      this.values.push(Object.values(condition)[0])
    }

    return this;
  }

  LIMIT(limit) {
    this.query.push(`LIMIT ?`);
    this.values.push(limit);
    return this;
  }

  OFFSET(offset) {
    this.query.push(`OFFSET ?`);
    this.values.push(offset);
    return this;
  }

  ORDER_BY(column, direction = 'ASC') {
    this.query.push(`ORDER BY ${column} ${direction} `);
    return this;
  }

  buildQuery(withValues = true) {
    let statement = this.query.join('\n');
    statement = statement.replace('{{columns}}', Object.keys(this.Model.columns).join(', '))

    if (withValues) {
      return mysql.format(statement, this.values)
    } else {
      return statement
    }
  }

  async exec() {
    const finalQuery = this.buildQuery(true)

    return await this.pool.query(finalQuery)
  }
}


module.exports = { pool, Camera }
