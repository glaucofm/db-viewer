const { app, ipcMain, BrowserWindow } = require('electron');
const server = require("./server.js");

let win;

// select across table http://plnkr.co/edit/uIGPwDZpzlljDsqNhKw8?preview

function createWindow () {
    win = new BrowserWindow({
        autoHideMenuBar: true,
        title: 'Kafka Viewer',
        webPreferences: {
            webSecurity: false,
            // nodeIntegration: true
        }
    });

    win.loadURL(`file://${__dirname}/../../dist/angular/index.html`);

    // win.webContents.openDevTools();

    win.maximize();

    win.on('closed', function () {
        // nodeClient.kill('SIGINT');
        win = null;
    });

    server.initialize();
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        // nodeClient.kill('SIGINT');
        app.quit()
    }
});

app.on('activate', function () {
    if (win === null) {
        createWindow()
    }
});

// ipcMain.on("connect", async (event, data) => {
//     console.log('connect', data);
//     kafkaManager.connect(data.name, data.brokers);
// });

