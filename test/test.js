const { pool, Camera } = require('../index');

describe('SELECT', () => {
  test('SELECT query should be built correctly', () => {
    const query = pool.SELECT().FROM(Camera)
      .WHERE('tag1 = ?')
      .ORDER_BY('name', 'DESC')
      .LIMIT(10)
      .OFFSET(0);

    const builtQuery = query.buildQuery();
    expect(builtQuery).toBe('SELECT id, name, description, location, url, tag1, created_at, updated_at FROM camera WHERE tag1 = ? ORDER BY name DESC LIMIT ? OFFSET ?');
  })

  test('SELECT query should be built correctly', () => {
    const query = pool.SELECT().FROM(Camera)
      .WHERE({ tag1: 'test' })
      .ORDER_BY('name', 'DESC')
      .LIMIT(10)
      .OFFSET(0);

    const builtQuery = query.buildQuery();
    expect(builtQuery).toBe('SELECT id, name, description, location, url, tag1, created_at, updated_at FROM camera WHERE tag1 = ? ORDER BY name DESC LIMIT ? OFFSET ?');
  });
});

// describe('INSERT', () => {
//     test('INSERT query should be built correctly', () => {
//         const cameraData = {
//             id: '1',
//             name: 'Test Camera',
//             description: 'A test camera',
//             location: 'Test Location',
//             url: 'http://test.com',
//             tag1: 'test'
//         };

//         const query = pool.INSERT().INTO(Camera).VALUES([cameraData]);

//         const builtQuery = query.buildQuery();
//         expect(builtQuery).toBe('INSERT INTO cameras (id, name, description, location, url, tag1) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id = VALUES(id), name = VALUES(name), description = VALUES(description), location = VALUES(location), url = VALUES(url), tag1 = VALUES(tag1), updated_at = NOW()');
//     });

//     test('INSERT IGNORE query should be built correctly', () => {
//         const cameraData = {
//             id: '2',
//             name: 'Another Test Camera',
//             description: 'Another test camera',
//             location: 'Another Test Location',
//             url: 'http://anothertest.com',
//             tag1: 'another_test'
//         };

//         const query = pool.INSERT(true).INTO(Camera).VALUES([cameraData]);

//         const builtQuery = query.buildQuery();
//         expect(builtQuery).toBe('INSERT IGNORE INTO cameras (id, name, description, location, url, tag1) VALUES (?, ?, ?, ?, ?, ?)');
//     });
// });
