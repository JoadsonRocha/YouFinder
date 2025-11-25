const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");

const settingsPath = path.join(process.resourcesPath, "settings.json");

// fallback para dev
const settingsPathDev = path.join(__dirname, "settings.json");

function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      return JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    }
    if (fs.existsSync(settingsPathDev)) {
      return JSON.parse(fs.readFileSync(settingsPathDev, "utf8"));
    }
  } catch {}

  return {
    abrirNoProjetor: false,
    adblockForte: true,
    modoClaro: false
  };
}

function saveSettings(data) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2));
  } catch {
    // fallback dev
    fs.writeFileSync(settingsPathDev, JSON.stringify(data, null, 2));
  }
}

contextBridge.exposeInMainWorld("config", {
  get: loadSettings,
  set: saveSettings
});

contextBridge.exposeInMainWorld("api", {
  abrirVideoClean: (id) => ipcRenderer.invoke("abrir-video-clean", id, loadSettings())
});
