
export interface Configuration {
    numberOfRowsToFetch: number;
    connections: DatabaseConnection[];
}

export enum DatabaseType {
    MYSQL = 'MYSQL',
    POSTGRES = 'POSTGRES',
    ORACLE = 'ORACLE'
}

export interface DatabaseConnection {
    name: string;
    type: DatabaseType;
    host: string;
    port: string;
    database: string;
    username: string;
    password: string;
    isConnecting?: boolean
    isConnected?: boolean
}

export interface Topic {
    name: string;
    isSelected: boolean;
    connectionName?: string
}

export enum EventType {
    DISCONNECT = 'disconnect',
    THEME = 'theme',
    CONNECT = 'connect',
    CONNECTED = 'connected'
}

export interface ApplicationEvent {
    type: EventType;
    data?: any;
}

export interface Grid {
    sql: string;
    result: QueryResults;
    isSelected: boolean;
    isLoadingMore: boolean;
}

export interface QueryResults {
    columns: ColumnDefinition[];
    rows: Row[];
    error: string;
    hasMoreRows: boolean;
}

export interface ColumnDefinition {
    name: string;
}

export interface Row {
    [key: string]: any;
}
