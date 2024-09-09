const { pool } = require('../index');
const Schema = require('../src/Schema')
const { String, Datetime } = require('../src/Types')


class camera extends Schema {
  static get columns() {
    return {
      id: {
        type: String,
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


describe('SELECT', () => {
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

describe('INSERT', () => {
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

    expect(query).toBe('INSERT INTO cameras (id, name, description, location, url, tag1) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id = VALUES(id), name = VALUES(name), description = VALUES(description), location = VALUES(location), url = VALUES(url), tag1 = VALUES(tag1), updated_at = NOW()');
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
    expect(query).toBe('INSERT IGNORE INTO cameras (id, name, description, location, url, tag1) VALUES (?, ?, ?, ?, ?, ?)');
  });
});



// Jest tests
describe.skip('Query Builder', () => {
  test('SELECT query builds correctly', () => {
    const query = pool.SELECT().FROM(camera).WHERE('id = ?').LIMIT(1).buildQuery()
    expect(query).toBe('SELECT `id`, `name`, `description`, `location`, `url`, `tag1`, `created_at`, `updated_at`\nFROM camera\nWHERE id = ?\nLIMIT ?');
  });

  test('ORDER BY clause builds correctly', () => {
    const query = pool.SELECT().FROM(camera).ORDER_BY('name', 'DESC');

    expect(query).toBe('SELECT `id`, `name`, `description`, `location`, `url`, `tag1`, `created_at`, `updated_at`\nFROM camera\nORDER BY name DESC ');
  });

  test('LIMIT and OFFSET clauses build correctly', () => {
    const query = pool.SELECT().FROM(camera).LIMIT(10).OFFSET(5).buildQuery();
    expect(query).toBe('SELECT `id`, `name`, `description`, `location`, `url`, `tag1`, `created_at`, `updated_at`\nFROM camera\nLIMIT ?\nOFFSET ?');
  });

  test('INSERT query builds correctly', () => {
    const data = { name: 'Test Camera', description: 'A test camera' };
    const query = pool.INSERT().INTO(camera).VALUES([data]).buildQuery();
    expect(query).toBe('INSERT INTO cameras (`name`, `description`) VALUES (?, ?)\nON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `description` = VALUES(`description`), `updated_at` = NOW()');
  });

  // test('UPDATE query builds correctly', () => {
  //   const data = { name: 'Updated Camera' };
  //   const query = queryBuilder.UPDATE(Camera).SET(data).WHERE('id = ?');
  //   const builtQuery = query.buildQuery();
  //   expect(builtQuery).toBe('UPDATE cameras\nSET `name` = ?, `updated_at` = NOW()\nWHERE id = ?');
  // });

  // test('DELETE query builds correctly', () => {
  //   const query = queryBuilder.DELETE().FROM(Camera).WHERE('id = ?');
  //   const builtQuery = query.buildQuery();
  //   expect(builtQuery).toBe('DELETE\nFROM camera\nWHERE id = ?');
  // });

});
