import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatCardModule} from '@angular/material';
import {TopbarComponent} from './topbar/topbar.component';
import {ButtonComponent} from './button/button.component';
import {ModalComponent} from './modal/modal.component';
import {FormsModule} from '@angular/forms';
import {DatabaseService} from './service/database.service';
import {SqlEditorComponent} from './sql-editor/sql-editor.component';
import {MomentModule} from 'ngx-moment';
import {NgxJsonViewerModule} from 'ngx-json-viewer';
import {ConfigurationService} from "./service/configuration.service";
import {IpcService} from "./service/ipc.service";
import {MonacoEditorModule, NgxMonacoEditorConfig} from "ngx-monaco-editor";

const monacoConfig: NgxMonacoEditorConfig = {
    baseUrl: 'assets',
    defaultOptions: { scrollBeyondLastLine: false },
    onMonacoLoad
};

@NgModule({
    declarations: [
        AppComponent,
        TopbarComponent,
        ButtonComponent,
        ModalComponent,
        SqlEditorComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatCardModule,
        FormsModule,
        MomentModule,
        NgxJsonViewerModule,
        MonacoEditorModule.forRoot(monacoConfig)
    ],
    providers: [
        DatabaseService,
        ConfigurationService,
        IpcService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

export function onMonacoLoad() {
    console.log((window as any).monaco);
    monaco.editor.defineTheme('myTheme', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
            'editorGutter.background': '#F8F8F8',
            'editorLineNumber.foreground': '#A0A0A0',
            'editor.lineHighlightBackground': '#F8F8F8',
            'editor.selectionBackground': '#FFFF00',
            'editor.selectionHighlightBackground': '#D5F5D3'
        }
    });
    monaco.editor.setTheme('myTheme');
}
