const { pool } = require('../index');
const Schema = require('../src/Schema')
const { PK, String, Datetime } = require('../src/Types')

class camera extends Schema {
  static get columns() {
    return {
      id: { type: PK },
      name: { type: String },
      description: { type: String },
      location: { type: String },
      url: { type: String, },
      tag1: { type: String, },
      created_at: { type: Datetime, },
      updated_at: { type: Datetime, }
    }
  }
}

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

describe('INSERT', () => {
  test('INSERT 單筆', () => {
    const cameraData = {
      id: '1',
      name: 'Test Camera',
      description: 'A test camera',
      location: 'Test Location',
      url: 'http://test.com',
      tag1: 'test'
    };

    const query = pool.INSERT().INTO(camera).SET(cameraData).buildQuery()

    expect(query).toBe(`
INSERT
INTO \`camera\`
SET \`id\` = '1',
\`name\` = 'Test Camera',
\`description\` = 'A test camera',
\`location\` = 'Test Location',
\`url\` = 'http://test.com',
\`tag1\` = 'test'
      `.trim())
  });

  test('INSERT IGNORE query should be built correctly', () => {
    const cameraData = {
      id: '2',
      name: 'Another Test Camera',
      description: 'Another test camera',
      location: 'Another Test Location',
      url: 'http://anothertest.com',
      tag1: 'another_test'
    };

    const query = pool.INSERT(true).INTO(camera).SET(cameraData).buildQuery()
    expect(query).toBe(`
INSERT IGNORE
INTO \`camera\`
SET \`id\` = '2',
\`name\` = 'Another Test Camera',
\`description\` = 'Another test camera',
\`location\` = 'Another Test Location',
\`url\` = 'http://anothertest.com',
\`tag1\` = 'another_test'
      `.trim())
  });


  test('INSERT query builds correctly', () => {
    const data = [{ name: 'Test Camera', description: 'A test camera' }, { name: 'Test Camera', description: 'A test camera' }]
    const query = pool.INSERT().INTO(camera).VALUES(data).buildQuery();
    expect(query).toBe(`
INSERT
INTO \`camera\`
(name, description) VALUES
('Test Camera', 'A test camera'), ('Test Camera', 'A test camera')
      `.trim())
  })
});


// Jest tests
describe('UPDATE', () => {
  test('單一欄位的 UPDATE 查詢正確構建', () => {
    const data = { name: 'Updated Camera' };
    const query = pool.UPDATE(camera).SET(data).WHERE('id = ?', 10).buildQuery()
    expect(query).toBe(`UPDATE \`camera\`\nSET \`name\` = 'Updated Camera'\nWHERE id = 10`.trim())
  });

  test('多個欄位的 UPDATE 查詢正確構建', () => {
    const data = { name: 'Updated Camera', description: 'New description' };
    const query = pool.UPDATE(camera).SET(data).WHERE('id = ?', 10).buildQuery()
    expect(query).toBe(`UPDATE \`camera\`\nSET \`name\` = 'Updated Camera',\n\`description\` = 'New description'\nWHERE id = 10`.trim())
  });

  test('多個 WHERE 條件的 UPDATE 查詢正確構建', () => {
    const data = { status: 'inactive' };
    const query = pool.UPDATE(camera).SET(data).WHERE('id = ?', 10).AND('name = ?', 'Old Camera').buildQuery()
    expect(query).toBe(`UPDATE \`camera\`\nSET \`status\` = 'inactive'\nWHERE id = 10\nAND name = 'Old Camera'`.trim())
  });

  test('帶有 LIMIT 的 UPDATE 查詢正確構建', () => {
    const data = { views: 100 };
    const query = pool.UPDATE(camera).SET(data).WHERE('views < ?', 50).LIMIT(5).buildQuery()
    expect(query).toBe(`UPDATE \`camera\`\nSET \`views\` = 100\nWHERE views < 50\nLIMIT 5`.trim())
  });
});

describe('DELETE', () => {
  test('基本的 DELETE 查詢正確構建', () => {
    const query = pool.DELETE().FROM(camera).WHERE('id = ?', 10).buildQuery()
    expect(query).toBe(`DELETE\nFROM \`camera\`\nWHERE id = 10`)
  });

  test('帶有多個條件的 DELETE 查詢正確構建', () => {
    const query = pool.DELETE().FROM(camera).WHERE('id = ?', 10).AND('name = ?', "kerker").buildQuery()
    expect(query).toBe(`DELETE\nFROM \`camera\`\nWHERE id = 10\nAND name = 'kerker'`)
  });

  test('帶有 LIMIT 的 DELETE 查詢正確構建', () => {
    const query = pool.DELETE().FROM(camera).WHERE('created_at < ?', '2023-01-01').LIMIT(5).buildQuery()
    expect(query).toBe(`DELETE\nFROM \`camera\`\nWHERE created_at < '2023-01-01'\nLIMIT 5`)
  });

  test('帶有對象條件的 DELETE 查詢正確構建', () => {
    const query = pool.DELETE().FROM(camera).WHERE({ tag1: 'obsolete' }).buildQuery()
    expect(query).toBe(`DELETE\nFROM \`camera\`\nWHERE \`tag1\` = 'obsolete'`)
  });

  test('帶有多個對象條件的 DELETE 查詢正確構建', () => {
    const query = pool.DELETE().FROM(camera).WHERE({ tag1: 'obsolete' }).AND({ location: 'unknown' }).buildQuery()
    expect(query).toBe(`DELETE\nFROM \`camera\`\nWHERE \`tag1\` = 'obsolete'\nAND \`location\` = 'unknown'`)
  });
});
