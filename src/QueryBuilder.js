const mysql = require('mysql2')

module.exports = class QueryBuilder {
  constructor(pool, firstStatement, options = {}) {
    this.pool = pool
    this.Model = options.Model
    this.query = [firstStatement]
    this.values = []
  }

  INTO(Model) {
    this.Model = Model;
    this.query.push(`INTO \`${this.Model.name}\``);
    return this;
  }

  FROM(Model) {
    this.Model = Model;
    this.query.push(`FROM \`${this.Model.name}\``);
    return this;
  }

  ///////////////////////////////

  SET(value) {
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
      this.query.push(`WHERE ?? = ?`)

      this.values.push(Object.keys(condition)[0])
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
      this.query.push(`AND ?? = ?`)

      this.values.push(Object.keys(condition)[0])
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
    this.query.push(`ORDER BY ${column} ${direction}`);
    return this;
  }

  PRINT(print = true) {
    this.print = print
    return this
  }

  buildQuery(withValues = true) {
    let columns = Object.keys(this.Model.columns).map(col => `\`${col}\``).join(', ')
    let statement = this.query.join('\n').replace('{{columns}}', columns)

    if (withValues) {
      return mysql.format(statement, this.values)
    } else {
      return statement
    }
  }

  async exec() {
    const finalQuery = this.buildQuery(true)

    let from = new Date()
    const results = await this.pool.query(finalQuery)

    if (this.print) {
      console.log(`${new Date() - from}ms`, finalQuery)
    }

    return results.map(result => new this.Model(result))
  }
}
