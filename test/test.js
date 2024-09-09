const { pool, Camera } = require('../index');

describe('QueryBuilder', () => {
    test('INSERT query should be built correctly', () => {
        const query = pool.INSERT().INTO(Camera)
            .VALUES([
                { id: 'cam1', name: 'Camera 1', description: 'Test camera 1', location: 'Location 1', url: 'http://example.com/1', tag1: 'test' },
                { id: 'cam2', name: 'Camera 2', description: 'Test camera 2', location: 'Location 2', url: 'http://example.com/2', tag1: 'test' }
            ]);

        const builtQuery = query.buildQuery();
        expect(builtQuery).toBe('INSERT INTO cameras (id, name, description, location, url, tag1) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE');
    });

    test('SELECT query should be built correctly', () => {
        const query = pool.SELECT().FROM(Camera)
            .WHERE('tag1 = ?')
            .ORDER_BY('name', 'DESC')
            .LIMIT(1)
            .OFFSET(0)

        const builtQuery = query.buildQuery();
        expect(builtQuery).toBe('SELECT id, name, description, location, url, tag1, created_at, updated_at FROM cameras WHERE tag1 = ? ORDER BY name DESC LIMIT 1 OFFSET 0');
    });
});
