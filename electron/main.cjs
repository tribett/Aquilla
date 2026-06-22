const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

const isDev = process.env.ELECTRON_DEV === "1";
const iconPath = path.join(__dirname, "../build/icon.png");

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

app.setName("Aquilla");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    title: "Aquilla",
    autoHideMenuBar: true,
    icon: iconPath,
    backgroundColor: "#14110c",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (isDev && url.startsWith("http://127.0.0.1")) return;
    if (!url.startsWith("file://")) {
      event.preventDefault();
    }
  });

  if (isDev) {
    mainWindow.loadURL("http://127.0.0.1:5173/?desktop=1");
    return;
  }

  mainWindow.loadFile(path.join(__dirname, "../dist/index.html"), {
    query: { desktop: "1" },
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("second-instance", () => {
    const [window] = BrowserWindow.getAllWindows();
    if (window) {
      if (window.isMinimized()) window.restore();
      window.focus();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
