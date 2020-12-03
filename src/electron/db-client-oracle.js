const oracledb = require('oracledb');

class DbClientOracle {

    constructor() {
        try {
            oracledb.initOracleClient({libDir: '.\\oracle_client'});
        } catch (err) {
            console.error(err);
        }
    }

    async connect(connectionInfo) {
        console.log('Connecting to', connectionInfo);
        this.connection = await oracledb.getConnection({
            user: connectionInfo.username,
            password: connectionInfo.password,
            connectString: connectionInfo.host + ':' + connectionInfo.port + '/' + connectionInfo.database
        });
        console.log('Connected to', connectionInfo.host, 'as', connectionInfo.username);
    }

    async disconnect() {
        await this.connection.release();
        console.log('Disconnected');
    }

    async query(sql, offset, pageSize) {
        console.log(addPaging(sql, offset, pageSize));
        let result = await this.connection.execute(addPaging(sql, offset, pageSize), [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        // console.log(result);
        let hasMoreRows = false;
        if (result.rows && result.rows.length === pageSize + 1) {
            hasMoreRows = true;
            result.rows.pop();
        }
        return {
            columns: result.metaData? result.metaData : [],
            rows: result.rows? result.rows : [],
            hasMoreRows,
            rowsAffected: result.rowsAffected
        };
    }
}

function addPaging(sql, offset, pageSize) {
    if (sql.trim().toLowerCase().startsWith('select')) {
        sql = sql + ' offset ' + offset + ' rows fetch next ' + (pageSize + 1) + ' rows only';
    }
    return sql;
}

module.exports = DbClientOracle;

