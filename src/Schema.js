
// 繼承的class name 會是 table name
module.exports = class Schema {
  constructor(dict) {
    if (dict) {
      for (const key in dict) {
        this[key] = dict[key]
      }
    }
  }

  get columns() {
    return {}
  }


  static get columns() {
    const object = new this()
    return object.columns
  }

  static get KEYS() {
    const columns = this.columns

    return Object.keys(columns)
      .filter(column => isRealColumn(columns[column]))
      .map(column => `${object.constructor.name}.${column}`)
  }
}


const isRealColumn = (column) => {
  const type = this.realType(column)

  return type
    && (type instanceof Array === false)
    && typeof type !== 'object'
}
