const mysql = require('mysql2')

module.exports = class QueryBuilder {
  constructor(pool, firstStatement, options = {}) {
    this.pool = pool
    this.Model = options.Model
    this.query = [firstStatement]
    this.values = []
  }

  INTO(Model) {
    this.Model = Model
    this.query.push(`INTO \`${this.Model.name}\``)
    return this
  }

  FROM(Model) {
    this.Model = Model
    this.query.push(`FROM \`${this.Model.name}\``)
    return this
  }

  ///////////////////////////////

  SET(input, value) {
    if (typeof input === 'object') {
      const updateStatements = Object.keys(input).map(col => `\`${col}\` = ?`).join(',\n')

      this.query.push(`SET ${updateStatements}`)

      this.values.push(...this._mapValue([input]))
    } else {
      this.query.push(`SET ${input}`)
      if (value != undefined) {
        this.values.push(...value)
      }
    }
    return this
  }

  // sql insert 多筆資料
  // INSERT INTO `camera` (name, description) VALUES ('Test Camera', 'A test camera'), ('Test Camera', 'A test camera');
  VALUES(input) {
    const array = (input instanceof Array) ? input : [input]

    const columnNames = Object.keys(array[0])

    this.query.push(`(${columnNames.join(', ')})`)

    const placeholders = columnNames.map(() => '?').join(', ')
    const valuesPlaceholders = array.map(_ => `(${placeholders})`).join(', ')

    this.query.push('VALUES ' + valuesPlaceholders)
    this.values.push(...this._mapValue(array))

    return this
  }

  _mapValue(array) {
    const columns = this.Model.columns

    const results = []

    for (const object of array) {
      for (const key in object) {
        const { type: { mapper } = {} } = columns[key] ?? {}

        if (mapper) {
          const mappedValue = mapper(object[key])
          results.push(mappedValue)
        } else {
          results.push(object[key])
        }
      }
    }

    return results
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

    return this
  }

  WHERE(condition, value) {
    if (typeof condition === 'string') {

      this.query.push('WHERE ' + condition)
      if (value != undefined) {
        this.values.push(value)
      }
    } else if (typeof condition === 'object') {
      this.query.push('WHERE ?? = ?')

      this.values.push(Object.keys(condition)[0])
      this.values.push(Object.values(condition)[0])
    }

    return this
  }

  AND(condition, value) {
    if (typeof condition === 'string') {
      this.query.push('AND ' + condition)
      if (value != undefined) {
        this.values.push(value)
      }
    } else if (typeof condition === 'object') {
      this.query.push('AND ?? = ?')

      this.values.push(Object.keys(condition)[0])
      this.values.push(Object.values(condition)[0])
    }

    return this
  }

  ON_DUPLICATE_KEY_UPDATE(...keys) {
    this.query.push('ON DUPLICATE KEY UPDATE')
    this.query.push(keys.map(_ => '?? = VALUES(??)').join(',\n'))
    this.values.push(...keys.flatMap(key => [key, key]))

    return this
  }

  LIMIT(limit) {
    this.query.push('LIMIT ?')
    this.values.push(limit)
    return this
  }

  OFFSET(offset) {
    this.query.push('OFFSET ?')
    this.values.push(offset)
    return this
  }

  ORDER_BY(column, direction = 'ASC') {
    this.query.push(`ORDER BY ${column} ${direction}`)
    return this
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
    const [rows, fields] = await client.query(finalQuery)

    if (this.print) {
      console.log(`${new Date() - from}ms`, finalQuery)
    }

    if (rows instanceof Array) {
      return rows.map(row => new this.Model(row))
    } else {
      return rows
    }
  }
}
