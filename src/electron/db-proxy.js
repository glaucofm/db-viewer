const dbClientMySQL = require("./db-client-mysql.js");
const dbClientOracle = require("./db-client-oracle");

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
        } else if (type === 'ORACLE') {
            return new dbClientOracle();
        }
    }

    static closeAllConnections() {
        for (let name of Object.getOwnPropertyNames(clients)) {
            clients[name].disconnect();
        }
    }
}

module.exports = DBProxy;

