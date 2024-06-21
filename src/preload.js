// preload.js

// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require('electron/renderer');


contextBridge.exposeInMainWorld('electronAPI', {
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    downloadVideo: (url) => ipcRenderer.invoke('download-video', url),
    downloadAudio: (url) => ipcRenderer.invoke('download-audio', url),
    downloadSubs: (url) => ipcRenderer.invoke('download-subs', url)
});
window.addEventListener('DOMContentLoaded', () => {
    console.log('Preload script loaded');
  });
