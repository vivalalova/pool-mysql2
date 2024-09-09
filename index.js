const pool = require('mysql2/promise')
    .createPool({
        host: 'localhost',
        user: 'root',
        password: '123',
        database: 'db',
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 10, // 最大空闲连接数，默认等于 `connectionLimit`
        idleTimeout: 60000, // 空闲连接超时，以毫秒为单位，默认值为 60000 ms
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
    })

/////////////////////////////////////////////////////////////////////////


class Schema {
    static get columns() {
        return {};
    }
}

class Camera extends Schema {
    static get columns() {
        return {
            id: 'string',
            name: 'string',
            description: 'string',
            location: 'string',
            url: 'string',
            tag1: 'string',
            created_at: 'datetime',
            updated_at: 'datetime'
        };
    }
}

pool.INSERT = function (ignore = false) {
    return new QueryBuilder(pool, 'INSERT', ignore);
}

pool.SELECT = function () {
    return new QueryBuilder(pool, 'SELECT');
}


class QueryBuilder {
    constructor(pool, queryType, ignore = false) {
        this.pool = pool;
        this.queryType = queryType;
        this.ignore = ignore;
        this.Model = null;
        this.columns = {};
        this.whereConditions = [];
        this.limitValue = null;
        this.offsetValue = null;
        this.orderByColumns = [];
        this.query = '';
        this.values = [];
    }

    INTO(Model) {
        this.Model = Model;
        this.columns = Model.columns;
        this.query += `INTO ${this.Model.name.toLowerCase()}s`;
        return this;
    }

    FROM(Model) {
        this.Model = Model;
        this.columns = Model.columns;
        this.query += ` FROM ${this.Model.name.toLowerCase()}s`;
        return this;
    }

    SET() {
        const updateStatements = Object.keys(this.values[0]).map(col => `${col} = VALUES(${col})`).join(', ');
        this.query += ` SET ${updateStatements}, updated_at = NOW()`;
        return this;
    }

    VALUES(array) {
        this.values = array;
        const columnNames = Object.keys(this.values[0]);
        const placeholders = columnNames.map(() => '?').join(', ');
        this.query += ` (${columnNames.join(', ')}) VALUES (${placeholders})`;
        return this;
    }

    WHERE(condition) {
        if (this.whereConditions.length === 0) {
            this.query += ' WHERE';
        } else {
            this.query += ' AND';
        }
        this.query += ` ${condition}`;
        this.whereConditions.push(condition);
        return this;
    }

    LIMIT(limit) {
        this.limitValue = limit;
        this.query += ` LIMIT ${limit}`;
        return this;
    }

    OFFSET(offset) {
        this.offsetValue = offset;
        this.query += ` OFFSET ${offset}`;
        return this;
    }

    ORDER_BY(column, direction = 'ASC') {
        if (this.orderByColumns.length === 0) {
            this.query += ' ORDER BY';
        } else {
            this.query += ',';
        }
        this.query += ` ${column} ${direction}`;
        this.orderByColumns.push(`${column} ${direction}`);
        return this;
    }

    buildQuery() {
        let finalQuery = '';
        if (this.queryType === 'INSERT') {
            finalQuery = this.ignore ? 'INSERT IGNORE ' : 'INSERT ';
            finalQuery += this.query;
            if (!this.ignore) {
                finalQuery += ' ON DUPLICATE KEY UPDATE';
            }
        } else if (this.queryType === 'SELECT') {
            const columnNames = Object.keys(this.columns);
            finalQuery = `SELECT ${columnNames.join(', ')}` + this.query;
        }
        return finalQuery;
    }

    async exec() {
        const finalQuery = this.buildQuery();
        if (this.queryType === 'INSERT') {
            const columnNames = Object.keys(this.values[0]);
            this.values = this.values.map(item => columnNames.map(col => item[col]));
        }
        return await this.pool.query(finalQuery, this.values.flat());
    }
}


module.exports = { pool, Camera }
