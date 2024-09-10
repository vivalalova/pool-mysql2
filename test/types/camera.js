const { pool, Schema, Types } = require('../../index')

module.exports = class camera extends Schema {
  static get columns() {
    return {
      id: { type: Types.PK },
      name: { type: Types.String },
      description: { type: Types.String },
      location: { type: Types.String },
      url: { type: Types.String },
      tag1: { type: Types.String },
      created_at: { type: Types.Datetime },
      updated_at: { type: Types.Datetime }
    }
  }
}
