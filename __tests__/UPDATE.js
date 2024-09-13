const { pool, Schema, Types } = require('../index')(require('../__tests.resource/Options'))

const camera = require('../__tests.resource/camera')


// Jest tests
describe('UPDATE', () => {
  test('單一欄位的 UPDATE 查詢正確構建', () => {
    const data = { name: 'Updated Camera' }
    const query = pool.UPDATE(camera).SET(data).WHERE('id = ?', 10).buildQuery()
    expect(query).toBe('UPDATE `camera`\nSET `name` = \'Updated Camera\'\nWHERE id = 10'.trim())
  })

  test('多個欄位的 UPDATE 查詢正確構建', () => {
    const data = { name: 'Updated Camera', description: 'New description' }
    const query = pool.UPDATE(camera).SET(data).WHERE('id = ?', 10).buildQuery()
    expect(query).toBe('UPDATE `camera`\nSET `name` = \'Updated Camera\',\n`description` = \'New description\'\nWHERE id = 10'.trim())
  })

  test('多個 WHERE 條件的 UPDATE 查詢正確構建', () => {
    const data = { status: 'inactive' }
    const query = pool.UPDATE(camera).SET(data).WHERE('id = ?', 10).AND('name = ?', 'Old Camera').buildQuery()
    expect(query).toBe('UPDATE `camera`\nSET `status` = \'inactive\'\nWHERE id = 10\nAND name = \'Old Camera\''.trim())
  })

  test('帶有 LIMIT 的 UPDATE 查詢正確構建', () => {
    const data = { views: 100 }
    const query = pool.UPDATE(camera).SET(data).WHERE('views < ?', 50).LIMIT(5).buildQuery()
    expect(query).toBe('UPDATE `camera`\nSET `views` = 100\nWHERE views < 50\nLIMIT 5'.trim())
  })
})

describe('ON DUPLICATE KEY UPDATE', () => {
  test('ON DUPLICATE KEY UPDATE 查詢正確構建', () => {
    const data = { id: 1, name: 'Test Camera', views: 100 }
    const query = pool.INSERT().INTO(camera).SET(data).ON_DUPLICATE_KEY_UPDATE('name', 'views').buildQuery()
    expect(query).toBe(`
INSERT
INTO \`camera\`
SET \`id\` = 1,
\`name\` = 'Test Camera',
\`views\` = 100
ON DUPLICATE KEY UPDATE
\`name\` = VALUES(\`name\`),
\`views\` = VALUES(\`views\`)`.trim())
  })

  test('ON DUPLICATE KEY UPDATE 與多個欄位的查詢正確構建', () => {
    const data = [
      {
        id: 2,
        name: 'Another Camera',
        description: 'Updated description',
        views: 200,
        status: 'active'
      }
    ]
    const query = pool.INSERT().INTO(camera).VALUES(data).ON_DUPLICATE_KEY_UPDATE('name', 'description', 'views', 'status').buildQuery()

    expect(query).toBe(`
INSERT
INTO \`camera\`
(id, name, description, views, status)
VALUES (2, 'Another Camera', 'Updated description', 200, 'active')
ON DUPLICATE KEY UPDATE
\`name\` = VALUES(\`name\`),
\`description\` = VALUES(\`description\`),
\`views\` = VALUES(\`views\`),
\`status\` = VALUES(\`status\`)`
      .trim())
  })
})
