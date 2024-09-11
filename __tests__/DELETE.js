const { pool, Schema, Types } = require('../index')(require('../__tests.resource/Options'))

const camera = require('../__tests.resource/camera')

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
