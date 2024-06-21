// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain,dialog,Menu } = require('electron/main');
const path = require('node:path');
const ytdl = require('ytdl-core');
const fs = require('fs');
const { log } = require('node:console');
const Swal = require('sweetalert2');

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    /*titleBarStyle: 'hidden',
  titleBarOverlay: {
    color: '#2f3241',
    symbolColor: '#74b1be',
    height: 1
  }*/
  })
  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });

    if (result.canceled || result.filePaths.length === 0) {
        return null;
    }

    selectedDirectory = result.filePaths[0];
    return selectedDirectory;
});
ipcMain.handle('download-audio', async (event, url) => {
  if (!selectedDirectory) {
      selectedDirectory = app.getPath('music');
  }

  const info = await ytdl.getInfo(url);
  const audioTitle = info.videoDetails.title;
  const sanitizedTitle = audioTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const audioPath = path.join(selectedDirectory, `${sanitizedTitle}.mp3`);
  const audioStream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });

  audioStream.pipe(fs.createWriteStream(audioPath));

  return new Promise((resolve, reject) => {
      audioStream.on('end', () => {
          resolve(audioPath);
      });
      audioStream.on('error', reject);
  });
});

  ipcMain.handle('download-video', async (event, url) => {
    if (!selectedDirectory) {
        selectedDirectory = app.getPath('videos');
        
    }
 
    const info = await ytdl.getInfo(url);
    const videoTitle = info.videoDetails.title;
    const sanitizedTitle = videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const videoPath = path.join(selectedDirectory, `${sanitizedTitle}.mp4`);
    const videoStream = ytdl(url, { quality: 'highest', filter: (format) => format.container === 'mp4' });

    videoStream.pipe(fs.createWriteStream(videoPath));

    return new Promise((resolve, reject) => {
        videoStream.on('end', () => {
            resolve(videoPath);
        });
        videoStream.on('error', reject);
    });
});
//Menu.setApplicationMenu(null);
  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  
  createWindow()
  
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
