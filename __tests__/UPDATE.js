const { pool, Schema, Types } = require('../index')(require('../__tests.resource/Options'))

const camera = require('../__tests.resource/camera')


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
