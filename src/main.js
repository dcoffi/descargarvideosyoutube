// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain,dialog,Menu,Tray, nativeImage,Notification  } = require('electron/main');
const path = require('node:path');
const ytdl = require('ytdl-core');
const fs = require('fs');
const { log } = require('node:console');
const Swal = require('sweetalert2');
const axios = require('axios');
const { parseStringPromise } = require('xml2js');
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 720,
    icon: path.join(__dirname, '../src/assets', 'youtube.ico'), // Ruta al ícono
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    /*titleBarStyle: 'hidden',
  titleBarOverlay: {
    color: '#2f3241',
    symbolColor: '#74b1be',
    height: 0
  }*/
  })
  async function convertXmlToSrt(xml) {
    const result = await parseStringPromise(xml);
    const transcript = result.transcript.text;
    const srtLines = transcript.map((text, index) => {
        const start = parseFloat(text.$.start);
        const duration = parseFloat(text.$.dur);
        const end = start + duration;

        const startTime = formatTime(start);
        const endTime = formatTime(end);

        return `${index + 1}\n${startTime} --> ${endTime}\n${text._}\n`;
    });

    return srtLines.join('\n');
}

function formatTime(seconds) {
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 12).replace('.', ',');
}
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
        const NOTIFICATION_BODY = '✅ Audio Descargado exitosamente.'

new Notification({
 // title: NOTIFICATION_TITLE,
  body: NOTIFICATION_BODY
}).show()
        resolve(audioPath);
      });
      audioStream.on('error', reject);
  });
});
ipcMain.handle('download-subs', async (event, url) => {
  if (!selectedDirectory) {
      selectedDirectory = app.getPath('documents');
  }

  const info = await ytdl.getInfo(url);
  const subtitles = info.player_response.captions?.playerCaptionsTracklistRenderer?.captionTracks;

  if (!subtitles) {
    const NOTIFICATION_BODY = '🔴 No hay Subtitulo(s) Disponibles.'

    new Notification({
     // title: NOTIFICATION_TITLE,
      body: NOTIFICATION_BODY
    }).show()
      //throw new Error('No subtitles available');
  }

  const tracks = subtitles.filter(track => ['en', 'es'].includes(track.languageCode));
  if (tracks.length === 0) {
    const NOTIFICATION_BODY = '🔴 No hay Subtitulo(s) Disponibles en Inglés o en Español.'

    new Notification({
     // title: NOTIFICATION_TITLE,
      body: NOTIFICATION_BODY
    }).show()
      //throw new Error('No subtitles available in English or Spanish');
  }

  const downloadPromises = tracks.map(async track => {
      const sanitizedTitle = info.videoDetails.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filePath = path.join(selectedDirectory, `${sanitizedTitle}_${track.languageCode}.srt`);

      const response = await axios.get(track.baseUrl, { responseType: 'text' });
      const srtContent = await convertXmlToSrt(response.data);
      fs.writeFileSync(filePath, srtContent);
      const NOTIFICATION_BODY = '✅ Subtitulo(s) Descargado(s) exitosamente.'

      new Notification({
       // title: NOTIFICATION_TITLE,
        body: NOTIFICATION_BODY
      }).show()
      return filePath;
  });

  return Promise.all(downloadPromises);
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
          //const NOTIFICATION_TITLE = 'Video Descargado'
const NOTIFICATION_BODY = '✅ Video Descargado exitosamente.'

new Notification({
 // title: NOTIFICATION_TITLE,
  body: NOTIFICATION_BODY
}).show()
            resolve(videoPath);
        });
        videoStream.on('error', reject);
    }
  
  
  );
    
});


Menu.setApplicationMenu(null);
  // and load the index.html of the app.
  mainWindow.loadFile('src/index.html')
  
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.whenReady().then(() => {
  
  const icon = nativeImage.createFromPath('./src/assets/youtube.png')
  bandeja = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
  
    { label: '🚪Salir', type: 'normal', click: () => { app.quit(); } }
]);

bandeja.setContextMenu(contextMenu);
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
