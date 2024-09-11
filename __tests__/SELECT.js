const { pool, Schema, Types } = require('../index')(require('../__tests.resource/Options'))
const camera = require('../__tests.resource/camera')

describe('SELECT', () => {
  test('基本的 SELECT 查詢', () => {
    const query = pool.SELECT().FROM(camera)
      .WHERE('tag1 = "test"')
      .ORDER_BY('name', 'DESC')
      .LIMIT(10)
      .OFFSET(3)

    const builtQuery = query.buildQuery();
    expect(builtQuery).toBe(`
SELECT \`id\`, \`name\`, \`description\`, \`location\`, \`url\`, \`tag1\`, \`created_at\`, \`updated_at\`
FROM \`camera\`
WHERE tag1 = "test"
ORDER BY name DESC
LIMIT 10
OFFSET 3
      `.trim())
  })

  test('帶有對象條件的 SELECT 查詢', () => {
    const query = pool.SELECT().FROM(camera)
      .WHERE({ tag1: 'test' })
      .ORDER_BY('name', 'DESC')
      .LIMIT(10)
      .OFFSET(0);

    const builtQuery = query.buildQuery();
    expect(builtQuery).toBe(`
SELECT \`id\`, \`name\`, \`description\`, \`location\`, \`url\`, \`tag1\`, \`created_at\`, \`updated_at\`
FROM \`camera\`
WHERE \`tag1\` = 'test'
ORDER BY name DESC
LIMIT 10
OFFSET 0
      `.trim());
  });

  test('帶有多個 AND 條件的 SELECT 查詢', () => {
    const query = pool.SELECT().FROM(camera)
      .WHERE_AND({ tag1: 'test', id: 1 })
      .ORDER_BY('name', 'DESC')

    const builtQuery = query.buildQuery();
    expect(builtQuery).toBe(`
SELECT \`id\`, \`name\`, \`description\`, \`location\`, \`url\`, \`tag1\`, \`created_at\`, \`updated_at\`
FROM \`camera\`
WHERE 1=1
AND \`tag1\` = 'test'
AND \`id\` = 1
ORDER BY name DESC
      `.trim())
  });

  test('自訂欄位 查詢', () => {
    const query = pool.SELECT('id').FROM(camera)
      .WHERE_AND({ tag1: 'test', id: 1 })
      .ORDER_BY('name', 'DESC')

    const builtQuery = query.buildQuery();
    expect(builtQuery).toBe(`
SELECT id
FROM \`camera\`
WHERE 1=1
AND \`tag1\` = 'test'
AND \`id\` = 1
ORDER BY name DESC
      `.trim())
  });
});
