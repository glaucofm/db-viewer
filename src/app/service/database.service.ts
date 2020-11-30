import {Injectable} from '@angular/core';
import {ApplicationEvent, DatabaseConnection, EventType, QueryResults} from '../model/types';
import {EventService} from "./event.service";
import {ConfigurationService} from "./configuration.service";
import {IpcService} from "./ipc.service";

@Injectable()
export class DatabaseService {

    public connections: DatabaseConnection[] = [];
    private configurationService: ConfigurationService;
    private connection: DatabaseConnection;

    constructor(configurationService: ConfigurationService) {
        this.configurationService = configurationService;
        this.connections = configurationService.load('connections');
        if (!this.connections) {
            this.connections = [];
            configurationService.save('connections', this.connections);
        }
        for (const connection of this.connections) {
            connection.isConnected = false;
        }
        this.subscribeToEvents();
    }

    private subscribeToEvents() {
        let _this = this;
        EventService.emitter.subscribe((event: ApplicationEvent) => {
            if (event.type == EventType.CONNECTED) {
                _this.setConnected(event.data);
            }
        });
    }

    public saveConnection(connection: DatabaseConnection, editedConnection?: DatabaseConnection) {
        if (editedConnection) {
            delete this.connections[editedConnection.name];
        }
        this.connections = this.connections.filter(x => x.name != connection.name);
        this.connections.push(connection);
        this.connections = this.connections.sort((a, b) => a.name == b.name? 0 : a.name > b.name? 1 : -1);
        this.configurationService.save('connections', this.connections);
    }

    public async connect(connection: DatabaseConnection) {
        connection.isConnecting = true;
        await fetch('http://localhost:9771/connect', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(connection)
        });
        connection.isConnecting = false;
        connection.isConnected = true;
        this.connection = connection;
    }

    private setConnected(name: string) {
    }

    public isConnected(): boolean {
        return this.connections.filter(x => x.isConnected).length > 0;
    }

    public isConnecting(): boolean {
        return this.connections.filter(x => x.isConnecting).length > 0;
    }

    public getActiveConnectionName(): string {
        if (this.connections.filter(x => x.isConnected).length) {
            return this.connections.find(x => x.isConnected || x.isConnecting).name;
        }
    }

    public async disconnect(connection: DatabaseConnection) {
        await fetch('http://localhost:9771/disconnect', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(connection)
        });
        connection.isConnected = false;
        // EventService.emitter.emit({ type: EventType.DISCONNECT, data: connection });
    }

    public async executeQuery(sql: string, currentQueryResults: QueryResults = undefined): Promise<QueryResults> {
        const response = await fetch('http://localhost:9771/query/', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: this.connection.name,
                sql,
                offset: currentQueryResults? currentQueryResults.rows.length : 0,
                pageSize: this.configurationService.config.numberOfRowsToFetch
            })
        });
        if (response.status == 200) {
            let queryResults = await response.json();
            if (currentQueryResults) {
                currentQueryResults.rows.push(...queryResults.rows);
                currentQueryResults.hasMoreRows = queryResults.hasMoreRows;
            } else {
                return queryResults;
            }
        } else {
            if (currentQueryResults) {
                currentQueryResults.error = await response.text();
            } else {
                return {
                    columns: [], rows: [], hasMoreRows: false,
                    error: await response.text()
                }
            }
        }
    }

}
