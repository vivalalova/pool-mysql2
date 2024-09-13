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
}
