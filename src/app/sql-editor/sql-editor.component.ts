import {ApplicationRef, Component, HostListener} from '@angular/core';
import {DatabaseService} from '../service/database.service';
import {Grid, QueryResults} from '../model/types';
import {ConfigurationService} from "../service/configuration.service";
import {WorkspacesService} from "../service/workspaces.service";


@Component({
    selector: 'sql-editor',
    templateUrl: 'sql-editor.component.html',
    styleUrls: ['sql-editor.component.css']
})
export class SqlEditorComponent {

    public databaseService: DatabaseService;
    public configurationService: ConfigurationService;
    public workspacesService: WorkspacesService;
    private applicationRef: ApplicationRef;
    private editor: any;
    public grids: Grid[] = [];
    public console: string;
    public isConsoleSelected = false;
    public valueToDisplay: string;
    public sqlEditorHeight = 500;
    public sqlResultsBodyHeight = 400;
    public sqlResultsBodyMarginTop = -10;
    public resizeStatus = {
        isResizing: false,
        initialMouseYPos: 0,
        initialSqlEditorHeight: 0,
        currentMouseYPos: 0
    };

    public editorOptions = {
        language: 'sql',
        folding: false,
        lineNumbersMinChars: 3,
        fontSize: 14,
        lineHeight: 14,
        automaticLayout: true
    };

    constructor(databaseService: DatabaseService,
                configurationService: ConfigurationService,
                applicationRef: ApplicationRef,
                workspacesService: WorkspacesService) {
        this.databaseService = databaseService;
        this.configurationService = configurationService;
        this.applicationRef = applicationRef;
        this.workspacesService = workspacesService;
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        let sqlResultsBody = document.getElementById("sql-results-body");
        if (sqlResultsBody) {
            this.sqlResultsBodyHeight = document.body.clientHeight - sqlResultsBody.offsetTop - 1;
            this.sqlResultsBodyMarginTop = (sqlResultsBody.offsetTop - 45) / -50;
        }
    }

    @HostListener('mousemove', ['$event'])
    private onMouseMove(event) {
        this.resizeStatus.currentMouseYPos = event.clientY;
        if (this.resizeStatus.isResizing) {
            this.sqlEditorHeight = this.resizeStatus.initialSqlEditorHeight + (this.resizeStatus.currentMouseYPos - this.resizeStatus.initialMouseYPos);
            this.onResize(null);
        }
    }

    public editorInit(editor) {
        this.editor = editor;
        let _this = this;
        let keyBinding = editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => { _this.executeSQL(); });
    }

    private async executeSQL() {
        let sql = this.getSqlAtCurrentLine();
        if (sql.trim().length == 0) {
            return;
        }
        this.logToConsole(sql);
        this.workspacesService.save();
        let grid: Grid;
        if (sql.trim().toLowerCase().startsWith('select')) {
            grid = {
                id: Math.random() * 1000000000,
                sql: sql,
                result: undefined,
                isSelected: false,
                isLoadingMore: false
            }
            this.grids.push(grid);
            this.selectGrid(grid);
            this.applicationRef.tick();
            this.onResize(null);
        } else {
            this.selectConsole(true);
        }
        let result = await this.databaseService.executeQuery(sql);
        if (grid) {
            grid.result = result;
            this.shortenLongColumns(result);
            this.logToConsole('--> Received ' + grid.result.rows.length + ' rows', '');
        } else {
            if (result.rowsAffected !== undefined) {
                this.logToConsole('--> Command execution successful: ' + result.rowsAffected + ' rows.', '');
            } else {
                this.logToConsole('--> Command execution successful.', '');
            }
            this.selectConsole(true);
        }
        this.applicationRef.tick();
    }

    private shortenLongColumns(result: QueryResults) {
        for (let row of result.rows) {
            for (let column of result.columns) {
                if (row[column.name] == null) {
                    row[column.name] = '{null}'
                } else if (row[column.name].toString().length > 100) {
                    row[column.name + '.original'] = row[column.name];
                    row[column.name] = row[column.name].toString().substring(0, 100) + '...';
                }
            }
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
        let lines = this.workspacesService.workspace.text.split('\n');
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
        sql = sql.trim().replace(/; *--[^\n]*$/, '').replace(/; *$/, '').replace(/; *\n$/, '');
        return sql;
    }

    public selectGrid(grid: Grid) {
        this.isConsoleSelected = false;
        this.grids.forEach(x => x.isSelected = false);
        grid.isSelected = true;
        this.applicationRef.tick();
    }

    public deleteGrid(grid: Grid) {
        this.grids = this.grids.filter(x => x.id != grid.id);
        if (this.grids.length > 0) {
            this.grids[this.grids.length - 1].isSelected = true;
        } else {
            this.isConsoleSelected = true;
        }
        this.applicationRef.tick();
    }

    private logToConsole(text1: string, text2: string = null, text3: string = null, text4: string = null, text5: string = null, text6: string = null, text7: string = null, text8: string = null) {
        if (!this.console) {
            this.console = '';
        }
        let texts = [ text1, text2, text3, text4, text5, text6, text7, text8 ];
        for (let text of texts) {
            if (text !== undefined && text !== null) {
                this.console += text.replace(/\n$/, '') + '\n';
            }
        }
    }

    private selectConsole(shouldSelect: boolean) {
        this.isConsoleSelected = shouldSelect;
        this.applicationRef.tick();
    }

    public showValue(value: any) {
        this.valueToDisplay = value;
        this.applicationRef.tick();
    }

    public startResize() {
        this.resizeStatus.isResizing = true;
        this.resizeStatus.initialMouseYPos = this.resizeStatus.currentMouseYPos;
        this.resizeStatus.initialSqlEditorHeight = this.sqlEditorHeight;
    }

    public stopResize() {
        this.resizeStatus.isResizing = false;
    }

}

