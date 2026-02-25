const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const isDev = require("electron-is-dev");

function createWindow() {
    let mainWindow = new BrowserWindow({
        width: 900,
        height: 680,
        icon: path.join(__dirname, "./favicon.ico")
    });

    mainWindow.loadURL(
        isDev
            ? "http://localhost:3000"
            : `file://${path.join(__dirname, "../build/index.html")}`
    );

    mainWindow.on("closed", () => (mainWindow = null));

    // Maximize the window on startup
    // mainWindow.maximize();
    // mainWindow.setMenu(null);
    mainWindow.setAutoHideMenuBar(true);
    mainWindow.setFullScreen(true);
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
