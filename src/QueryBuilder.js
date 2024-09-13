const mysql = require('mysql2')

/**
 * 構建查詢的類
 */
module.exports = class QueryBuilder {
  /**
   * 構造函數
   * @param {any} pool - 數據庫連接池
   * @param {string} firstStatement - 第一個語句
   * @param {object} options - 選項
   */
  constructor(pool, firstStatement, options = {}) {
    this.pool = pool
    this.Model = options.Model
    this.query = [firstStatement]
    this.values = []
  }

  /**
   * 添加 INTO 條件
   * @param {any} Model - 要添加的值
   * @returns {QueryBuilder} - 當前的 QueryBuilder 實例
   */
  INTO(Model) {
    this.Model = Model
    this.query.push(`INTO \`${this.Model.name}\``)
    return this
  }

  /**
   * 添加 FROM 條件
   * @param {any} Model - 要添加的值
   * @returns {QueryBuilder} - 當前的 QueryBuilder 實例
   */
  FROM(Model) {
    this.Model = Model
    this.query.push(`FROM \`${this.Model.name}\``)
    return this
  }

  //==========set====================================

  /**
   * 添加 SET 條件
   * @param {any} input - 要添加的值
   * @returns {QueryBuilder} - 當前的 QueryBuilder 實例
   */
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

  /**
   * 添加 VALUES 條件
   * @param {any} input - 要添加的值
   * @returns {QueryBuilder} - 當前的 QueryBuilder 實例
   */
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

  //==========conditions====================================

  // 用 object 的方式帶入 WHERE 跟 AND 的條件
  // WHERE_AND({ tag1: 'test', id: 1 })
  // 用Object.keys()的順序下條件

  /**
   * 添加 WHERE 和 AND 條件
   * @param {object} object - 包含條件的物件
   * @returns {QueryBuilder} - 當前的 QueryBuilder 實例
   */
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

  /**
   * 添加 WHERE 條件
   * @param {string} condition - 要添加的條件
   * @param {any} value - 在條件中使用的值
   * @returns {QueryBuilder} - 當前的 QueryBuilder 實例
   */
  WHERE(condition, value) {
    if (typeof condition === 'string') {
      this.query.push('WHERE ' + condition)
      this.values.push(... this._valueHandle(value))
    } else if (typeof condition === 'object') {
      this.query.push('WHERE ?? = ?')

      this.values.push(Object.keys(condition)[0])
      this.values.push(Object.values(condition)[0])
    }

    return this
  }

  /**
   * 添加 AND 條件
   * @param {string} condition - 要添加的條件
   * @param {any} value - 在條件中使用的值
   * @returns {QueryBuilder} - 當前的 QueryBuilder 實例
  */

  AND(condition, value) {
    if (typeof condition === 'string') {
      this.query.push('AND ' + condition)
      this.values.push(... this._valueHandle(value))
    } else if (typeof condition === 'object') {
      this.query.push('AND ?? = ?')

      this.values.push(Object.keys(condition)[0])
      this.values.push(Object.values(condition)[0])
    }

    return this
  }

  /**
   * 處理 WHERE 和 AND 條件中的值
   * @param {any} value - 要處理的值
   * @returns {any[]} - 處理後的值
   */
  _valueHandle(value) {
    if (value instanceof Array) {
      return value
    } else if (value != undefined) {
      return [value]
    } else {
      return []
    }
  }

  //==========others====================================
  /**
   * 添加 ON DUPLICATE KEY UPDATE 條件
   * @param  {...any} keys - 要更新的列名
   * @returns {QueryBuilder} - 當前的 QueryBuilder 實例
   */
  ON_DUPLICATE_KEY_UPDATE(...keys) {
    this.query.push('ON DUPLICATE KEY UPDATE')
    this.query.push(keys.map(_ => '?? = VALUES(??)').join(',\n'))
    this.values.push(...keys.flatMap(key => [key, key]))

    return this
  }

  /**
   * 添加 LIMIT 條件
   * @param {number} limit - 限制的數量
   * @returns {QueryBuilder} - 當前的 QueryBuilder 實例
   */
  LIMIT(limit) {
    this.query.push('LIMIT ?')
    this.values.push(limit)
    return this
  }

  /**
   * 添加 OFFSET 條件
   * @param {number} offset - 偏移量
   * @returns {QueryBuilder} - 當前的 QueryBuilder 實例
   */
  OFFSET(offset) {
    this.query.push('OFFSET ?')
    this.values.push(offset)
    return this
  }

  /**
   * 添加 ORDER BY 條件
   * @param {string} column - 要排序的列名
   * @param {string} direction - 排序方向，默認為 'ASC'
   * @returns {QueryBuilder} - 當前的 QueryBuilder 實例
  */
  ORDER_BY(column, direction = 'ASC') {
    this.query.push(`ORDER BY ${column} ${direction}`)
    return this
  }

  /**
   * 設置是否打印查詢
   * @param {boolean} print - 是否打印查詢，默認為 true
   * @returns {QueryBuilder} - 當前的 QueryBuilder 實例
   */
  PRINT(print = true) {
    this.print = print
    return this
  }

  //==========buildQuery====================================

  /**
   * 構建查詢字符串
   * @param {boolean} withValues - 是否包含值，默認為 true
   * @returns {string} - 構建的查詢字符串
   */
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

  /**
   * 執行查詢
   * @param {any} connection - 數據庫連接
   * @returns {Promise<any>} - 查詢結果
   */
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
