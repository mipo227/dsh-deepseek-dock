"use strict";

const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, screen } = require("electron");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFile } = require("node:child_process");
const { readDockState } = require("./data");

const APP_NAME = "DSH DeepSeek Dock";
const AGENT_LABEL = "com.mipo227.dsh-deepseek-dock";
const AGENT_PATH = path.join(os.homedir(), "Library", "LaunchAgents", AGENT_LABEL + ".plist");
const COLLAPSED = { width: 112, height: 100 };
const EXPANDED = { width: 322, height: 520 };

app.setName(APP_NAME);

let win = null;
let tray = null;
let alwaysOnTop = true;
let ticker = null;

function placeWindow(expanded, contentHeight) {
  if (win === null || win.isDestroyed()) return;
  const area = screen.getPrimaryDisplay().workArea;
  const width = expanded ? EXPANDED.width : COLLAPSED.width;
  const desired = expanded ? EXPANDED.height : COLLAPSED.height;
  const height = Math.max(expanded ? 260 : 80, Math.min(desired, area.height - 20));
  const bounds = {
    x: area.x + area.width - width,
    y: area.y + area.height - height,
    width: width,
    height: height
  };
  const current = win.getBounds();
  if (current.x === bounds.x && current.y === bounds.y && current.width === bounds.width && current.height === bounds.height) return;
  win.setBounds(bounds, true);
}

function currentState() {
  try { return readDockState(); }
  catch (error) { return { ok: false, error: String(error && error.message || error) }; }
}

function sendState() {
  if (win === null || win.isDestroyed()) return;
  try { win.webContents.send("dock:state", currentState()); }
  catch (error) {}
}

function createWindow() {
  win = new BrowserWindow({
    width: COLLAPSED.width,
    height: COLLAPSED.height,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    hasShadow: false,
    alwaysOnTop: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.setAlwaysOnTop(true, "floating");
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.loadFile(path.join(__dirname, "index.html"));
  win.once("ready-to-show", function () {
    placeWindow(false);
    win.showInactive();
    sendState();
    if (process.env.DSH_DOCK_CAPTURE === "1") {
      const capture = function (file) {
        win.webContents.capturePage().then(function (image) {
          try { fs.writeFileSync(file, image.toPNG()); } catch (error) {}
        }).catch(function () {});
      };
      setTimeout(function () { capture("/tmp/dock-collapsed.png"); }, 2500);
      setTimeout(function () {
        win.webContents.executeJavaScript("document.getElementById('tile').click()").catch(function () {});
      }, 3200);
      setTimeout(function () { capture("/tmp/dock-expanded.png"); }, 5200);
    }
  });
  win.on("closed", function () { win = null; });
}

function toggleWindow() {
  if (win === null || win.isDestroyed()) {
    createWindow();
    return;
  }
  if (win.isVisible()) win.hide();
  else { win.showInactive(); sendState(); }
}

function trayImage() {
  const file = path.join(__dirname, "trayTemplate.png");
  try {
    if (fs.existsSync(file)) {
      const image = nativeImage.createFromPath(file);
      image.setTemplateImage(true);
      return image;
    }
  } catch (error) {}
  return nativeImage.createEmpty();
}

function hasLoginItem() {
  return fs.existsSync(AGENT_PATH);
}

function xml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildAgentPlist() {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n' +
    '<plist version="1.0">\n' +
    '<dict>\n' +
    '  <key>Label</key><string>' + xml(AGENT_LABEL) + '</string>\n' +
    '  <key>ProgramArguments</key>\n' +
    '  <array>\n' +
    '    <string>' + xml(process.execPath) + '</string>\n' +
    '    <string>' + xml(__dirname) + '</string>\n' +
    '  </array>\n' +
    '  <key>RunAtLoad</key><true/>\n' +
    '  <key>KeepAlive</key><false/>\n' +
    '  <key>LimitLoadToSessionType</key><string>Aqua</string>\n' +
    '  <key>StandardOutPath</key><string>/tmp/dsh-deepseek-dock.log</string>\n' +
    '  <key>StandardErrorPath</key><string>/tmp/dsh-deepseek-dock.log</string>\n' +
    '</dict>\n' +
    '</plist>\n';
}

function reloadAgent() {
  if (hasLoginItem()) {
    execFile("/bin/launchctl", ["unload", "-w", AGENT_PATH], function () {});
  }
  try { fs.unlinkSync(AGENT_PATH); } catch (error) {}
}

function enableLoginItem() {
  try {
    fs.mkdirSync(path.dirname(AGENT_PATH), { recursive: true });
    fs.writeFileSync(AGENT_PATH, buildAgentPlist());
    execFile("/bin/launchctl", ["load", "-w", AGENT_PATH], function () {});
  } catch (error) {
    console.warn("[dock] login item failed: " + String(error && error.message || error));
  }
}

function toggleLoginItem() {
  if (hasLoginItem()) reloadAgent();
  else enableLoginItem();
  updateTrayMenu();
}

function updateTrayMenu() {
  if (tray === null) return;
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: "显示 / 隐藏", click: toggleWindow },
    { label: "刷新", click: function () { sendState(); } },
    { type: "separator" },
    {
      label: "始终置顶",
      type: "checkbox",
      checked: alwaysOnTop,
      click: function () {
        alwaysOnTop = !alwaysOnTop;
        if (win !== null && !win.isDestroyed()) win.setAlwaysOnTop(alwaysOnTop, "floating");
        updateTrayMenu();
      }
    },
    {
      label: "开机自启",
      type: "checkbox",
      checked: hasLoginItem(),
      click: toggleLoginItem
    },
    { type: "separator" },
    { label: "退出", click: function () { app.quit(); } }
  ]));
}

function createTray() {
  tray = new Tray(trayImage());
  tray.setToolTip(APP_NAME);
  updateTrayMenu();
  tray.on("click", toggleWindow);
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", function () {
    if (win !== null && !win.isDestroyed()) {
      win.showInactive();
      sendState();
    }
  });

  ipcMain.handle("dock:get-state", function () { return currentState(); });
  ipcMain.handle("dock:refresh", function () {
    const state = currentState();
    if (win !== null && !win.isDestroyed()) win.webContents.send("dock:state", state);
    return state;
  });
  ipcMain.handle("dock:set-expanded", function (_event, expanded, height) {
    placeWindow(Boolean(expanded), height);
    return true;
  });
  ipcMain.on("dock:quit", function () { app.quit(); });

  app.whenReady().then(function () {
    if (process.platform === "darwin" && app.dock) app.dock.hide();
    createWindow();
    createTray();
    if (!hasLoginItem()) enableLoginItem();
    ticker = setInterval(sendState, 15000);
  });
}

app.on("window-all-closed", function () {});
app.on("activate", function () {
  if (win === null || win.isDestroyed()) createWindow();
  else { win.showInactive(); sendState(); }
});
app.on("before-quit", function () {
  if (ticker !== null) clearInterval(ticker);
});
