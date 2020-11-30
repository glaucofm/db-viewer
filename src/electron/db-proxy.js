const dbClientMySQL = require("./db-client-mysql.js");

const clients = {};

class DBProxy {
    static async connect(connectionInfo) {
        clients[connectionInfo.name] = this.getDbClient(connectionInfo.type);
        await clients[connectionInfo.name].connect(connectionInfo);
        console.log('Connected to', connectionInfo.name, 'as', connectionInfo.username);
    }

    static async disconnect(name) {
        await clients[name].disconnect();
        console.log('Disconnected from', name);
    }

    static async query(name, sql, offset, pageSize) {
        return clients[name].query(sql, offset, pageSize);
    }

    static getDbClient(type) {
        if (type === 'MYSQL') {
            return new dbClientMySQL();
        }
    }
}

module.exports = DBProxy;

