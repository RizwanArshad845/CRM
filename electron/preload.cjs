const { contextBridge, ipcRenderer } = require('electron');

// Securely expose specific node functionality back to the frontend
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => process.env.npm_package_version,
  // Add other IPC listeners here if needed
});
