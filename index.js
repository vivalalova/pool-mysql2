module.exports = (options) => {
  return {
    pool: require('./src/Pool')(options),
    Schema: require('./src/Schema'),
    Types: require('./src/Types')
  }
}
