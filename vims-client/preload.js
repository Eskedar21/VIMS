const { contextBridge, ipcRenderer } = require('electron');

/**
 * Exposes a secure, limited API to the Renderer (React) process.
 * This is crucial for maintaining security in Kiosk Mode (US 001) by not exposing
 * the entire Node.js environment to the web application.
 */
contextBridge.exposeInMainWorld('vimsApi', {
    // --- Authentication & Initialization ---
    // (Future: Used for passing Machine ID or initial auth tokens from Electron to React)
    getMachineInfo: () => ipcRenderer.invoke('get-machine-info'),

    // --- Inspection Machine Integration (US 002) ---
    // Sends a command to the main process to interact with the local machine hardware
    startMachineTest: (testType) => ipcRenderer.invoke('start-machine-test', testType),
    
    // Listens for real-time data updates sent from the main process
    // The main process will send a signal when data arrives from the physical machine
    onMachineDataUpdate: (callback) => ipcRenderer.on('machine-data-update', (_event, value) => callback(value)),

    // --- Offline Data Synchronization (US 004) ---
    // (Future: Used for triggering data synchronization to the central server)
    triggerSync: () => ipcRenderer.invoke('trigger-sync'),
    
    // Listens for connectivity status changes (e.g., offline/online)
    onConnectivityChange: (callback) => ipcRenderer.on('connectivity-change', (_event, status) => callback(status))
});