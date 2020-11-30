import {ApplicationRef, ChangeDetectorRef, Component, ElementRef, ViewChild, ViewChildren} from '@angular/core';
import {DatabaseService} from '../service/database.service';
import {ApplicationEvent, EventType, Grid, QueryResults} from '../model/types';
import {EventService} from "../service/event.service";
import {ConfigurationService} from "../service/configuration.service";
import {NgxEditorModel} from "ngx-monaco-editor/lib/types";


@Component({
    selector: 'sql-editor',
    templateUrl: 'sql-editor.component.html',
    styleUrls: ['sql-editor.component.css']
})
export class SqlEditorComponent {

    public databaseService: DatabaseService;
    public configurationService: ConfigurationService;
    private applicationRef: ApplicationRef;
    private editor: any;
    public grids: Grid[] = [];

    public editorOptions = {
        language: 'sql',
        folding: false,
        lineNumbersMinChars: 3,
        fontSize: 14,
        lineHeight: 14,
        automaticLayout: true
    };

    public code: string = 'select * \nfrom company\norder by id;';

    constructor(databaseService: DatabaseService, configurationService: ConfigurationService, applicationRef: ApplicationRef) {
        this.databaseService = databaseService;
        this.configurationService = configurationService;
        this.applicationRef = applicationRef;
        EventService.emitter.subscribe((event: ApplicationEvent) => {
            if (event.type === EventType.CONNECTED) {
            }
        });
    }

    public editorInit(editor) {
        this.editor = editor;
        let _this = this;
        let keyBinding = editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => { _this.executeSQL(); });
    }

    private async executeSQL() {
        let sql = this.getSqlAtCurrentLine();
        if (sql.trim().length > 0) {
            let grid: Grid = {
                sql: sql,
                result: undefined,
                isSelected: false,
                isLoadingMore: false
            }
            this.grids.push(grid);
            this.selectGrid(grid);
            grid.result = await this.databaseService.executeQuery(sql);
            this.applicationRef.tick();
        }
    }

    public async loadMoreRows(grid: Grid) {
        grid.isLoadingMore = true;
        await this.databaseService.executeQuery(grid.sql, grid.result);
        grid.isLoadingMore = false;
        this.applicationRef.tick();
    }

    public getSqlAtCurrentLine(): string {
        let lineNumber = this.editor.getPosition().lineNumber - 1;
        let lines = this.code.split('\n');
        lines.unshift('');
        while (lineNumber > 0 && lines[lineNumber].trim().length > 0 && !lines[lineNumber].endsWith(';')) {
            lineNumber--;
        }
        if (lines[lineNumber].trim().length == 0 || lines[lineNumber].endsWith(';')) lineNumber++;
        let sql = '';
        while (lineNumber < lines.length && lines[lineNumber].trim().length > 0) {
            sql += lines[lineNumber] + '\n';
            if (lines[lineNumber].endsWith(';')) {
                break;
            }
            lineNumber++;
        }
        return sql;
    }

    public selectGrid(grid: Grid) {
        this.grids.forEach(x => x.isSelected = false);
        grid.isSelected = true;
        this.applicationRef.tick();
    }

}

