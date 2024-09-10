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

}

class Polygon extends BaseType {

}

class MultiPolygon extends BaseType {

}

module.exports = { BaseType, PK, String, Datetime, Point, Polygon, MultiPolygon };
