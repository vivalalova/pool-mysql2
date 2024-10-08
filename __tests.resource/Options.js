module.exports = {
  host: 'localhost',
  user: 'root',
  password: '123',
  database: 'db',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // Maximum idle connections, default equals `connectionLimit`
  idleTimeout: 60000, // Idle connection timeout in milliseconds, default value is 60000 ms
}
