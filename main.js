const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");

/* ===========================================
   🔧 OTIMIZAÇÕES DO ELECTRON
=========================================== */

// Remove quase todos os logs internos
app.commandLine.appendSwitch("disable-logging");

// Evita travamentos do watchdog da GPU
app.commandLine.appendSwitch("disable-gpu-watchdog");

// Ignora blacklist da GPU (melhora vídeo)
app.commandLine.appendSwitch("ignore-gpu-blacklist");

// Mantém aceleração eficiente
app.commandLine.appendSwitch("enable-zero-copy");
app.commandLine.appendSwitch("enable-gpu-rasterization");

// Evita erros de política de autoplay
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

// Evita erros de compositor HTML
app.commandLine.appendSwitch("disable-renderer-backgrounding");


/* ===========================================
   🔧 FUNÇÃO DA JANELA PRINCIPAL
=========================================== */

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "YouFinder.ico"),  // ✅ ICONE AQUI
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  // Remove menu superior
  Menu.setApplicationMenu(null);

  win.loadFile("index.html");
}


/* ===========================================
   🔧 ABRIR VÍDEO SEM DISTRAÇÕES (PLAYER 95%)
=========================================== */

ipcMain.handle("abrir-video-clean", (event, videoId) => {
  const videoWindow = new BrowserWindow({
    width: 1100,
    height: 680,
    backgroundColor: "#000",
    autoHideMenuBar: true,

    webPreferences: {
      contextIsolation: true,
      sandbox: false
    }
  });

  // User-Agent de Chrome para evitar bloqueios
  videoWindow.webContents.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/120.0.0.0 Safari/537.36"
  );

  const url = `https://www.youtube.com/watch?v=${videoId}`;
  videoWindow.loadURL(url);

  // Ao carregar, injeta modo sem distrações + player 95%
  videoWindow.webContents.on("did-finish-load", async () => {

    const CLEAN_CSS = `
/* Remove elementos de distração */
#masthead-container, #guide, #secondary, #related, #comments,
ytd-mini-guide-renderer, ytd-merch-shelf-renderer,
ytd-reel-shelf-renderer, ytd-banner-promo-renderer,
ytd-rich-metadata-renderer, #footer, #chat {
  display: none !important;
}

/* Fundo preto */
html, body {
  background: #000 !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
}

/* ✅ PLAYER OCUPANDO 95% DA JANELA */
#player, .html5-video-player, ytd-player, video {
  position: fixed !important;
  top: 2.5% !important;
  left: 2.5% !important;
  width: 95% !important;
  height: 95% !important;
  background: #000 !important;
  border-radius: 12px !important; /* deixa mais bonito */
  margin: 0 !important;
  padding: 0 !important;
}

/* Remove elementos do player */
.ytp-ce-element,
.ytp-endscreen-content,
.ytp-pause-overlay {
  display: none !important;
}

/* Remove gradientes */
.ytp-gradient-bottom,
.ytp-gradient-top {
  display: none !important;
}
`.trim();

    await videoWindow.webContents.insertCSS(CLEAN_CSS);
  });
});


/* ===========================================
   🔧 EVENTOS DO APP
=========================================== */

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
