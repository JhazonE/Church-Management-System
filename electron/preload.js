const { contextBridge, ipcRenderer } = require('electron');

// Note: Database functions are handled through API routes in Next.js
// No direct database access needed in Electron preload script

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI = {
  // Platform information
  platform: process.platform,

  // Version information
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },

  // Window controls (for frameless window)
  minimize: () => ipcRenderer.invoke('minimize-window'),
  maximize: () => ipcRenderer.invoke('maximize-window'),
  unmaximize: () => ipcRenderer.invoke('unmaximize-window'),
  close: () => ipcRenderer.invoke('close-window'),
  isMaximized: () => ipcRenderer.invoke('is-maximized'),
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),

  // Printing functionality
  printPage: (options) => ipcRenderer.invoke('print-page', options),
  printToPDF: (options) => ipcRenderer.invoke('print-to-pdf', options),
  showPrintPreview: (options) => ipcRenderer.invoke('show-print-preview', options),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  showPrintDialog: (options) => ipcRenderer.invoke('show-print-dialog', options),

  // Listen for events from main process
  on: (channel, callback) => {
    // Whitelist of valid channels
    const validChannels = ['window-maximized', 'window-unmaximized'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },

  // Remove all listeners for a channel
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
