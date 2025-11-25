const { app, BrowserWindow, ipcMain, Menu, screen } = require("electron");
const path = require("path");

/* =======================
   OTIMIZAÇÕES
======================= */
app.commandLine.appendSwitch("disable-logging");
app.commandLine.appendSwitch("disable-gpu-watchdog");
app.commandLine.appendSwitch("ignore-gpu-blacklist");
app.commandLine.appendSwitch("enable-zero-copy");
app.commandLine.appendSwitch("enable-gpu-rasterization");
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
app.commandLine.appendSwitch("disable-renderer-backgrounding");

/* =======================
   JANELA PRINCIPAL
======================= */
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "YouFinder.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  Menu.setApplicationMenu(null);
  win.loadFile("index.html");
}

/* =======================
   MODO CINEMA: PLAYER CENTRALIZADO EM 97%
======================= */
function applyCinemaMode(win) {
  const CINEMA_CSS = `
    /* ========== OCULTAR TUDO NÃO ESSENCIAL ========== */
    #masthead-container,
    #guide, #secondary, #related, #comments,
    ytd-reel-shelf-renderer, ytd-merch-shelf-renderer,
    ytd-banner-promo-renderer, #chat, #footer {
      display: none !important;
    }

    /* ========== FUNDO PRETO ========== */
    html, body {
      background: #000 !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    /* ========== PLAYER EM 97% DA TELA ========== */
    ytd-watch-flexy #primary {
      width: 97vw !important;
      min-width: 97vw !important;
      margin-left: 1.5vw !important;
      margin-right: 1.5vw !important;
    }

    ytd-watch-flexy #player {
      width: 100% !important;
      height: 97vh !important;
      min-height: 97vh !important;
    }
  `;
  win.webContents.insertCSS(CINEMA_CSS);
}

/* =======================
   ABRIR VÍDEO CLEAN
======================= */
ipcMain.handle("abrir-video-clean", (event, videoId, settings) => {
  const displays = screen.getAllDisplays();
  const target = displays.length > 1 ? displays[1] : displays[0];
  const modoProjetor = settings?.abrirNoProjetor || false;
  const adblockAtivo = settings?.adblockForte !== false;

  let win;
  if (modoProjetor) {
    win = new BrowserWindow({
      x: target.bounds.x,
      y: target.bounds.y,
      width: target.bounds.width,
      height: target.bounds.height,
      backgroundColor: "#000",
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        sandbox: false
      }
    });
    win.maximize();
  } else {
    const w = target.workAreaSize.width;
    const h = target.workAreaSize.height;
    win = new BrowserWindow({
      width: 1100,
      height: 680,
      x: (w - 1100) / 2,
      y: (h - 680) / 2,
      backgroundColor: "#000",
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        sandbox: false
      }
    });
  }

  win.webContents.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  win.loadURL(`https://www.youtube.com/watch?v=${videoId}`);

  win.webContents.on("did-finish-load", () => {
    applyCinemaMode(win); // ✅ Aplica o modo cinema com 97%

    if (adblockAtivo) {
      const adblock = `
        #player-ads,
        ytd-video-masthead-ad-v3-renderer,
        .ytp-ad-player-overlay {
          display: none !important;
        }
      `;
      win.webContents.insertCSS(adblock);

      win.webContents.executeJavaScript(`
        setInterval(() => {
          document.querySelector('.ytp-ad-skip-button')?.click();
        }, 1000);
      `);
    }
  });

  win.on("closed", () => {
    if (BrowserWindow.getAllWindows().length === 1) {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.focus();
    }
  });
});

/* =======================
   APP READY
======================= */
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});