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

  SET(statement, value) {
    if (typeof statement === 'object') {
      const updateStatements = Object.keys(statement).map(col => `\`${col}\` = ?`).join(',\n');

      this.query.push(`SET ${updateStatements}`);

      for (const key in statement) {
        const value = statement[key]
        const { type: { mapper } = {} } = this.Model.columns[key] ?? {}

        if (mapper) {
          const mappedValue = mapper(value)
          this.values.push(mappedValue)
        } else {
          this.values.push(value)
        }
      }
    } else {
      this.query.push(`SET ${statement}`)
      if (value != undefined) {
        this.values.push(...value)
      }
    }
    return this;
  }


  // sql insert 多筆資料
  // INSERT INTO `camera` (name, description) VALUES ('Test Camera', 'A test camera'), ('Test Camera', 'A test camera');
  VALUES(array) {
    let values = []
    if (array instanceof Array) {
      values = array
    } else {
      values = [array]
    }

    const columnNames = Object.keys(values[0])

    const placeholders = columnNames.map(() => '?').join(', ');

    this.query.push(`(${columnNames.join(', ')}) VALUES`)

    const valuesPlaceholders = values.map(_ => `(${placeholders})`).join(', ')
    this.query.push(valuesPlaceholders)

    for (const value of values) {
      this.values = this.values.concat(Object.values(value))
    }

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

  WHERE(condition, value) {
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

  AND(condition, value) {
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

  ON_DUPLICATE_KEY_UPDATE(object) {
    this.query.push(`ON DUPLICATE KEY UPDATE ?? = VALUES(??)`)
    this.values.push(Object.keys(object)[0])
    this.values.push(Object.keys(object)[0])
    return this
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
  /////////////////////////////////////////////////
  buildQuery(withValues = true) {
    let columns = '*'

    if (Object.keys(this.Model.columns).length > 0) {
      columns = Object.keys(this.Model.columns).map(col => `\`${col}\``).join(', ')
    } else {
      columns = '*'
    }

    let statement = this.query.join('\n').replace('{{columns}}', columns)

    if (withValues) {
      return mysql.format(statement, this.values)
    } else {
      return statement
    }
  }

  async exec(connection) {
    const finalQuery = this.buildQuery(true).replace(/\n/g, ' ')

    const from = new Date()

    const client = connection || this.pool
    const results = await client.query(finalQuery)

    if (this.print) {
      console.log(`${new Date() - from}ms`, finalQuery)
    }

    return results.map(result => new this.Model(result))
  }
}
