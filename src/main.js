const { app } = require('electron');
const path = require('node:path');
const express = require('express');
const open = require('open');
const portfinder = require('portfinder');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let server; // To hold the server instance

const startWebServer = async () => {
  const expressApp = express();

  // Serve static files from the 'src' directory (where index.html, renderer.js, index.css are)
  // __dirname in main.js is C:\Users\8304018\Documents\GitHub\Electron\my-app\src
  expressApp.use(express.static(path.join(__dirname)));

  // Find an available port, starting from 3000
  const port = await portfinder.getPortPromise({
    port: 3000,
    stopPort: 4000
  });

  const url = `http://localhost:${port}`;

  server = expressApp.listen(port, () => {
    console.log(`Web server running at ${url}`);
    // Handle CommonJS/ESM module interoperability for 'open' package
    if (typeof open === 'function') {
      open(url);
    } else {
      open.default(url);
    }
  });
};

const initializeApp = () => {
  startWebServer();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  initializeApp();

  app.on('activate', () => {
    // On macOS, if the app is activated (e.g., dock icon clicked)
    // and the server is running, re-open the browser to the URL.
    if (server) {
      const url = `http://localhost:${server.address().port}`;
      if (typeof open === 'function') {
        open(url);
      } else {
        open.default(url);
      }
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // In our web server model, the app runs in the background.
  // It shouldn't quit just because there are no "windows".
  // On macOS, it stays active by default. On other platforms, we prevent quitting.
  if (process.platform !== 'darwin') {
    // If you want the app to genuinely quit when not in use, you'd implement a tray icon
    // or other UI to allow the user to explicitly quit.
    // For now, we'll keep it running in background.
  }
});

app.on('before-quit', () => {
  if (server) {
    server.close();
    console.log('Web server is shutting down.');
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
