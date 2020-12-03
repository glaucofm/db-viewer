import {ApplicationRef, Injectable} from "@angular/core";
import {Workspace} from "../model/types";
import {ConfigurationService} from "./configuration.service";


@Injectable()
export class WorkspacesService {

    public workspace: Workspace;
    public workspaces: Workspace[];
    private applicationRef: ApplicationRef;

    private configurationService: ConfigurationService;

    constructor(configurationService: ConfigurationService,
                applicationRef: ApplicationRef) {
        this.configurationService = configurationService;
        this.applicationRef = applicationRef;
        this.workspaces = configurationService.load('workspaces');
        if (!this.workspaces) {
            this.workspaces = [ {
                name: 'Default',
                text: '',
                isActive: true
            } ];
        }
        this.workspace = this.workspaces.find(x => x.isActive);
    }

    public setActive(workspace: Workspace) {
        this.workspaces.forEach(x => x.isActive = false);
        this.workspace = workspace;
        this.workspace.isActive = true;
        this.applicationRef.tick();
    }

    public saveWorkspace(workspace) {
        this.workspaces = this.workspaces.filter(x => x.name != workspace.name);
        this.workspaces.push(workspace);
        this.workspaces.sort((a, b) => a.name == b.name? 0 : a.name > b.name? 1 : -1);
        this.configurationService.save('workspaces', this.workspaces);
        this.workspace = workspace;
        this.applicationRef.tick();
    }

    public deleteWorkspace(workspace) {
        this.workspaces = this.workspaces.filter(x => x.name != workspace.name);
        this.configurationService.save('workspaces', this.workspaces);
        this.applicationRef.tick();
    }

    public save() {
        this.configurationService.save('workspaces', this.workspaces);
    }
}
