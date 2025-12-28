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
  } catch { }

  return {
    abrirNoProjetor: false,
    adblockForte: true,
    modoClaro: true
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


const historyPath = path.join(process.resourcesPath, "history.json");
const historyPathDev = path.join(__dirname, "history.json");

function loadHistory() {
  try {
    if (fs.existsSync(historyPath)) {
      return JSON.parse(fs.readFileSync(historyPath, "utf8"));
    }
    if (fs.existsSync(historyPathDev)) {
      return JSON.parse(fs.readFileSync(historyPathDev, "utf8"));
    }
  } catch { }
  return [];
}

function saveHistory(data) {
  try {
    fs.writeFileSync(historyPath, JSON.stringify(data, null, 2));
  } catch {
    fs.writeFileSync(historyPathDev, JSON.stringify(data, null, 2));
  }
}

function addToHistory(video) {
  const history = loadHistory();
  // Remove duplicates
  const newHistory = history.filter(item => item.id.videoId !== video.id.videoId);
  // Add to top
  newHistory.unshift(video);
  // Limit to 50
  if (newHistory.length > 50) newHistory.pop();
  saveHistory(newHistory);
}

contextBridge.exposeInMainWorld("config", {
  get: loadSettings,
  set: saveSettings,
  openExternal: (url) => require("electron").shell.openExternal(url),
  getHistory: loadHistory,
  addToHistory: addToHistory
});

contextBridge.exposeInMainWorld("api", {
  abrirVideoClean: (id) => ipcRenderer.invoke("abrir-video-clean", id, loadSettings()),
  openHistory: () => ipcRenderer.invoke("open-history")
});
