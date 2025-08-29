import { contextBridge, ipcRenderer } from 'electron';

console.log('in preloads');
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    // invoke: (channel, data) => ipcRenderer.invoke(channel, data),
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
  },
});