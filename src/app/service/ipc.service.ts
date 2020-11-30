import {EventEmitter, Injectable} from '@angular/core';
import {ApplicationEvent, EventType} from "../model/types";
import {EventService} from "./event.service";

// const electron = (<any>window).require('electron');

@Injectable({ providedIn: 'root' })
export class IpcService {

    constructor() {
        // electron.ipcRenderer.on(EventType.CONNECTED, (event, data) => {
        //     console.log(EventType.CONNECTED, data);
        //     EventService.emitter.emit({ type: EventType.CONNECTED });
        // });
    }

    public send(type: EventType, data: any) {
        // electron.ipcRenderer.send(type, data);
    }

}
