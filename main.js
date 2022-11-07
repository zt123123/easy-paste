// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, Tray, screen, globalShortcut, ipcMain } = require('electron')
const path = require('path')
const ClipboardObserver = require("./clipboard-observer")
// const panelHeight = 150
const panelHeight = 500

let mainWindow = null
let clipboardObserver = null

function createMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: "唤醒",
      accelerator: "cmd + shift + v",
      click() {
        console.log(11111);
      }
    },
    {
      type: "separator"
    },
    {
      label: "偏好设置",
      accelerator: "cmd + ,",
    },
    {
      label: "帮助",
    },
    {
      label: "赞助",
    },
    {
      type: "separator"
    },
    {
      label: "退出",
      accelerator: "cmd + q",
      click() {
        console.log('quit');
        closeApp()
      }
    },
  ])
  const tray = new Tray(path.join(__dirname, './logo.png'))
  tray.setToolTip("easy-paste")
  tray.setContextMenu(menu)
}

function createShortcut() {
  globalShortcut.register("cmd+shift+v", () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })
  globalShortcut.register("cmd+q", () => {
    console.log('global quit');
    closeApp()
  })
}

function createWindow() {
  // Create the browser window.
  const primaryDisplay = screen.getPrimaryDisplay()
  mainWindow = new BrowserWindow({
    x: primaryDisplay.workArea.x,
    y: primaryDisplay.bounds.height - panelHeight,
    width: primaryDisplay.bounds.width,
    height: panelHeight,
    resizable: false,
    movable: false,
    closable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    roundedCorners: false,
    alwaysOnTop: true,
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.addListener("blur", () => {
    !mainWindow.isAlwaysOnTop() && mainWindow.hide()
  })
  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

function readClipboard() {
  clipboardObserver = new ClipboardObserver({
    textChange: (text) => {
      //  处理文本变化的逻辑
      // ipcMain.emit('clipboard-change', text)
      mainWindow.webContents.send("clipboard-change", text)
    },
    imageChange: (image) => {
      //  处理图片变化的逻辑
      // ipcMain.emit('clipboard-change', image)
      mainWindow.webContents.send("clipboard-change", image)
    }
  });

  //  也可以再开始
  clipboardObserver.start();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  readClipboard()
  createMenu()
  createShortcut()
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

function closeApp() {
  console.log('quit');
  app.quit()
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  //  也可以暂停
  clipboardObserver.stop();
  if (process.platform !== 'darwin') {
    closeApp()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
