import {Component} from '@angular/core';
import {DatabaseService} from '../service/database.service';
import {DatabaseConnection, DatabaseType, Workspace} from '../model/types';
import {ConfigurationService} from "../service/configuration.service";
import {WorkspacesService} from "../service/workspaces.service";

@Component({
    selector: 'app-topbar',
    templateUrl: './topbar.component.html',
    styleUrls: ['./topbar.component.css']
})
export class TopbarComponent {

    public databaseService: DatabaseService;
    public configurationService: ConfigurationService;
    public workspacesService: WorkspacesService;
    public editingConnection: DatabaseConnection;
    public editingWorkspace: Workspace;
    public oldConnection: DatabaseConnection;
    public oldColumns: string = '';
    public databaseTypes = [ DatabaseType.MYSQL, DatabaseType.POSTGRES, DatabaseType.ORACLE ];

    constructor(databaseService: DatabaseService, configurationService: ConfigurationService, workspacesService: WorkspacesService) {
        this.databaseService = databaseService;
        this.configurationService = configurationService;
        this.workspacesService = workspacesService;
    }

    editConnection(connection?: DatabaseConnection) {
        if (connection) {
            this.editingConnection = connection;
            this.oldConnection = JSON.parse(JSON.stringify(connection));
        } else {
            this.editingConnection = {
                name: '',
                type: DatabaseType.MYSQL,
                host: '',
                port: '',
                database: '',
                username: '',
                password: ''
            };
        }
        this.closeMenu('menu-connections');
    }

    saveConnection() {
        this.databaseService.saveConnection(this.editingConnection, this.oldConnection);
        this.editingConnection = null;
    }

    closeMenu(menu: string) {
        document.getElementById(menu).classList.remove('hover');
        setTimeout(() => {
            document.getElementById(menu).classList.add('hover');
        }, 200);
    }

    setTheme(theme) {
        this.configurationService.setTheme({ name: theme });
    }

    editWorkspace(workspace: Workspace) {
        if (workspace) {
            this.editingWorkspace = workspace;
        } else {
            this.editingWorkspace = {
                name: '',
                text: '',
                isActive: false
            }
        }
    }
}
