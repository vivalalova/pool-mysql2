const { pool, Schema, Types } = require('../index')(require('../__tests.resource/Options'))

const camera = require('../__tests.resource/camera')

describe('INSERT', () => {

  test('INSERT 單筆', () => {
    const cameraData = {
      id: '1',
      name: 'Test Camera',
      description: 'A test camera',
      location: { x: 1, y: 1 },
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
\`location\` = POINT(1, 1),
\`url\` = 'http://test.com',
\`tag1\` = 'test'
      `.trim())
  });

  test('SET 用字串跟?', () => {
    const query = pool.INSERT(true).INTO(camera).SET(`
id = '2',
name = ?,
description = ?,
location = POINT(121.5, 25.1),
url = 'http://anothertest.com',
tag1 = 'another_test'
        `.trim(),
      [
        'Another Test Camera',
        'Another test camera'
      ]).buildQuery()
    expect(query).toBe(`
INSERT IGNORE
INTO \`camera\`
SET id = '2',
name = 'Another Test Camera',
description = 'Another test camera',
location = POINT(121.5, 25.1),
url = 'http://anothertest.com',
tag1 = 'another_test'
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
