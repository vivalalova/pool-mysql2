const mysql = require('mysql2')

class BaseType {
  static validate(value) {
    return true
  }
}

class PK extends BaseType {

}

class String extends BaseType {

}

class Datetime extends BaseType {

}

class Point extends BaseType {
  static validate(value) {
    function rangeValidator({ x, y }) {
      const xx = Number(x)
      const yy = Number(y)

      if (xx != x || yy != y || xx < -180 || xx > 180 || yy < -180 || yy > 180) {
        return false
      }

      return true
    }

    if (typeof value === 'object') {
      return rangeValidator(value)
        && parseFloat(value.x) == value.x
        && parseFloat(value.y) == value.y
    } else if (typeof value === 'string') {
      const matched = value.match(Point.regex)
      return (matched && matched.length == 2)
        && rangeValidator({ x: matched[0], y: matched[1] })
    }

    return false
  }

  static mapper(value) {
    if (!Point.validate(value)) {
      throw 'invalid'
    }

    let x, y

    if (typeof value === 'string') {
      ([x, y] = value.match(/(\d+\.\d+)|(\d+)/g))
    } else if (typeof value === 'object') {
      ({ x, y } = value)
    } else {
      throw `map to POINT failed, input: ${value}`
    }

    return mysql.raw(`POINT(${parseFloat(x)}, ${parseFloat(y)})`)
  }
}

class Polygon extends BaseType {

}

class MultiPolygon extends BaseType {

}

module.exports = { BaseType, PK, String, Datetime, Point, Polygon, MultiPolygon }
