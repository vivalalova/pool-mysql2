const { pool } = require('../index');
const Schema = require('../src/Schema')
const { PK, String, Datetime } = require('../src/Types')


class camera extends Schema {
  static get columns() {
    return {
      id: {
        type: PK,
      },
      name: {
        type: String,
      },
      description: {
        type: String,
      },
      location: {
        type: String,
      },
      url: {
        type: String,
      },
      tag1: {
        type: String,
      },
      created_at: {
        type: Datetime,
      },
      updated_at: {
        type: Datetime,
      }
    }
  }
}


describe.skip('SELECT', () => {
  test('基本的 SELECT 查詢', () => {
    const query = pool.SELECT().FROM(camera)
      .WHERE('tag1 = "test"')
      .ORDER_BY('name', 'DESC')
      .LIMIT(10)
      .OFFSET(0)

    const builtQuery = query.buildQuery();
    expect(builtQuery).toBe(`
SELECT \`id\`, \`name\`, \`description\`, \`location\`, \`url\`, \`tag1\`, \`created_at\`, \`updated_at\`
FROM \`camera\`
WHERE tag1 = "test"
ORDER BY name DESC
LIMIT 10
OFFSET 0
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
});

describe.skip('INSERT', () => {
  test('INSERT query should be built correctly', () => {
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
});


// Jest tests
describe('Query Builder', () => {
  test('LIMIT and OFFSET clauses build correctly', () => {
    const query = pool.SELECT().FROM(camera).LIMIT(10).OFFSET(5).buildQuery();
    expect(query).toBe('SELECT `id`, `name`, `description`, `location`, `url`, `tag1`, `created_at`, `updated_at`\nFROM `camera`\nLIMIT 10\nOFFSET 5');
  })

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

  test('UPDATE query builds correctly', () => {
    const data = { name: 'Updated Camera' };
    const query = pool.UPDATE(camera).SET(data).WHERE('id = ?', 10).buildQuery()
    expect(query).toBe(`UPDATE \`camera\`\nSET \`name\` = 'Updated Camera'\nWHERE id = 10`.trim())
  });

  test('DELETE query builds correctly', () => {
    const query = pool.DELETE().FROM(camera).WHERE('id = ?', 10).AND('name = ?', "kerker").buildQuery()
    expect(query).toBe(`DELETE\nFROM \`camera\`\nWHERE id = 10\nAND name = 'kerker'`)
  });

});
