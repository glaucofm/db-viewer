let mysql = require('mysql2/promise');

class DbClientMySQL {

    constructor() {
    }

    async connect(connectionInfo) {
        this.connection = await mysql.createConnection({
            host: connectionInfo.host,
            port: connectionInfo.port,
            user: connectionInfo.username,
            password: connectionInfo.password,
            database: connectionInfo.database
        });
        console.log('Connected to', connectionInfo.host, 'as', connectionInfo.username);
    }

    async disconnect() {
        await this.connection.end();
        console.log('Disconnected');
    }

    async query(sql, offset, pageSize) {
        console.log(addPaging(sql, offset, pageSize));
        let [rows, fields] = await this.connection.query(addPaging(sql, offset, pageSize));
        let hasMoreRows = false;
        if (rows.length === pageSize + 1) {
            hasMoreRows = true;
            rows.pop();
        }
        return {
            columns: fields.map(x => { return { name: x.name }}),
            rows,
            hasMoreRows
        };
    }
}

function addPaging(sql, offset, pageSize) {
    return sql + ' limit ' + (pageSize + 1) + ' offset ' + offset;
}

module.exports = DbClientMySQL;

