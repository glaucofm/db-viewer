import {Injectable} from "@angular/core";
import {Configuration, DatabaseConnection} from "../model/types";

@Injectable()
export class ConfigurationService {

    public theme = 'light';

    public config: Configuration = {
        numberOfRowsToFetch: 50,
        connections: []
    };

    private currentConfigForComparison = JSON.stringify(this.config);

    constructor() {
        this.setTheme();
        this.loadConfiguration();
        setInterval(() => this.saveConfiguration(), 60000);
    }

    private loadConfiguration() {
        let config = this.internalLoad('db-viewer-config');
        if (!config) {
            config = this.config;
            this.internalSave('db-viewer-config', config);
        } else {
            this.config = config;
        }
    }

    saveConfiguration() {
        if (JSON.stringify(this.config) !== this.currentConfigForComparison) {
            this.internalSave('db-viewer-config', this.config);
            this.currentConfigForComparison = JSON.stringify(this.config);
        }
    }

    setTheme(theme?: { name: 'light' | 'dark' }) {
        if (!theme) {
            theme = this.internalLoad('theme');
            if (!theme) {
                theme = { name: 'light' };
            }
        }
        this.internalSave('theme', theme);
        this.theme = theme.name;
        document.getElementsByTagName("body")[0].className = theme.name + '-theme';
    }

    public save(key, data) {
        this.internalSave('db-viewer-' + key, data);
    }

    public load(key): any {
        return this.internalLoad('db-viewer-' + key);
    }

    private internalSave(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    private internalLoad(key): any {
        if (localStorage.getItem(key)) {
            return JSON.parse(localStorage.getItem(key));
        }
    }

}

