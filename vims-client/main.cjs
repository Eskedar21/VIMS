const { app, BrowserWindow } = require('electron');
const path = require('path');

// Determine if we are running in development or production
// app.isPackaged is the reliable way to detect a bundled Electron app
const isDev = !app.isPackaged;

function createWindow() {
    // Create the browser window (kiosk disabled for local development)
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        fullscreen: false,
        kiosk: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            // Preload script is necessary for securely bridging Node.js and React
            preload: path.join(__dirname, 'preload.js'), 
        },
    });

    if (isDev) {
        // Load the Vite development URL
        mainWindow.loadURL('http://localhost:5173');
    } else {
        // In production, load the built index.html file from the 'dist' folder
        // Note: You must run 'npm run build' before 'npm run dist' or manually loading this path
        mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }

    // Security fix: Prevent new windows (tabs/pop-ups) from opening outside the main window.
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('file://')) {
            return { action: 'allow' };
        }
        return { action: 'deny' };
    });
}

// Electron lifecycle hooks
app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});