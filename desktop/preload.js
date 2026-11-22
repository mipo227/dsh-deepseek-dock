"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("dock", {
  getState: function () { return ipcRenderer.invoke("dock:get-state"); },
  refresh: function () { return ipcRenderer.invoke("dock:refresh"); },
  setExpanded: function (expanded, height) { return ipcRenderer.invoke("dock:set-expanded", Boolean(expanded), height); },
  quit: function () { ipcRenderer.send("dock:quit"); },
  onState: function (listener) {
    const handler = function (_event, state) { listener(state); };
    ipcRenderer.on("dock:state", handler);
    return function () { ipcRenderer.removeListener("dock:state", handler); };
  }
});
