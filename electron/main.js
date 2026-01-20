const { app, BrowserWindow, Menu, shell, dialog, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const { spawn } = require('child_process');

let mainWindow;
let nextServer = null;

// IPC handlers for window controls (frameless window) - register immediately
ipcMain.handle('minimize-window', () => {
  console.log('IPC: minimize-window called');
  if (mainWindow) {
    console.log('Minimizing window...');
    mainWindow.minimize();
    console.log('Window minimized');
  } else {
    console.log('Main window not available for minimize');
  }
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) mainWindow.maximize();
});

ipcMain.handle('unmaximize-window', () => {
  if (mainWindow) mainWindow.unmaximize();
});

ipcMain.handle('close-window', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

ipcMain.handle('toggle-fullscreen', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }
});

ipcMain.handle('is-fullscreen', () => {
  return mainWindow ? mainWindow.isFullScreen() : false;
});

// Printing functionality
ipcMain.handle('print-page', async (event, options = {}) => {
  try {
    if (!mainWindow) {
      throw new Error('Main window not available');
    }

    const defaultOptions = {
      silent: false,
      printBackground: true,
      color: true,
      margins: 'default',
      landscape: false,
      pagesPerSheet: 1,
      collate: false,
      copies: 1,
      pageSize: 'A4'
    };

    const printOptions = { ...defaultOptions, ...options };

    const result = await mainWindow.webContents.print(printOptions);
    return result;
  } catch (error) {
    console.error('Print error:', error);
    throw error;
  }
});

ipcMain.handle('print-to-pdf', async (event, options = {}) => {
  try {
    if (!mainWindow) {
      throw new Error('Main window not available');
    }

    const defaultOptions = {
      marginsType: 0, // default
      printBackground: true,
      printSelectionOnly: false,
      landscape: false,
      pageSize: 'A4',
      scaleFactor: 100
    };

    const pdfOptions = { ...defaultOptions, ...options };

    const pdfData = await mainWindow.webContents.printToPDF(pdfOptions);
    return pdfData;
  } catch (error) {
    console.error('Print to PDF error:', error);
    throw error;
  }
});

// Print preview functionality
ipcMain.handle('show-print-preview', async (event, options = {}) => {
  try {
    if (!mainWindow) {
      throw new Error('Main window not available');
    }

    // Generate PDF for preview
    const pdfData = await mainWindow.webContents.printToPDF({
      marginsType: 0,
      printBackground: true,
      printSelectionOnly: false,
      landscape: options.landscape || false,
      pageSize: options.pageSize || 'A4',
      scaleFactor: 100
    });

    // Create preview window
    const previewWindow = new BrowserWindow({
      width: 800,
      height: 600,
      minWidth: 600,
      minHeight: 400,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false
      },
      title: 'Print Preview',
      show: false,
      parent: mainWindow,
      modal: true
    });

    // Load preview HTML
    const previewHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Preview</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f5f5f5;
            }
            .toolbar {
              background: white;
              padding: 10px;
              border-radius: 8px;
              margin-bottom: 20px;
              display: flex;
              gap: 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            button {
              padding: 8px 16px;
              border: 1px solid #ccc;
              border-radius: 4px;
              background: white;
              cursor: pointer;
              font-size: 14px;
            }
            button:hover {
              background: #f0f0f0;
            }
            button.primary {
              background: #007bff;
              color: white;
              border-color: #007bff;
            }
            button.primary:hover {
              background: #0056b3;
            }
            .preview-container {
              background: white;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              max-height: calc(100vh - 140px);
              overflow: auto;
            }
            iframe {
              width: 100%;
              height: 500px;
              border: none;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="toolbar">
            <button onclick="printDocument()">Print</button>
            <button onclick="saveAsPDF()">Save as PDF</button>
            <button onclick="closePreview()">Close</button>
          </div>
          <div class="preview-container">
            <iframe id="pdfViewer" src="data:application/pdf;base64,${pdfData.toString('base64')}"></iframe>
          </div>
          <script>
            function printDocument() {
              window.print();
            }

            function saveAsPDF() {
              const link = document.createElement('a');
              link.href = document.getElementById('pdfViewer').src;
              link.download = 'print-preview.pdf';
              link.click();
            }

            function closePreview() {
              window.close();
            }
          </script>
        </body>
      </html>
    `;

    previewWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(previewHtml)}`);

    previewWindow.once('ready-to-show', () => {
      previewWindow.show();
    });

    // Handle preview window close
    previewWindow.on('closed', () => {
      // Cleanup
    });

    return { success: true };
  } catch (error) {
    console.error('Print preview error:', error);
    throw error;
  }
});

// Get printer list
ipcMain.handle('get-printers', async () => {
  try {
    if (!mainWindow) {
      throw new Error('Main window not available');
    }

    const printers = await mainWindow.webContents.getPrinters();
    return printers;
  } catch (error) {
    console.error('Get printers error:', error);
    throw error;
  }
});

// Show print dialog
ipcMain.handle('show-print-dialog', async (event, options = {}) => {
  try {
    if (!mainWindow) {
      throw new Error('Main window not available');
    }

    const result = await dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['Print', 'Preview', 'Cancel'],
      defaultId: 0,
      cancelId: 2,
      title: options.title || 'Print Options',
      message: options.message || 'Choose print action:',
      detail: options.detail || 'Select Print to print directly, or Preview to see how the document will look before printing.'
    });

    return {
      action: result.response === 0 ? 'print' : result.response === 1 ? 'preview' : 'cancel',
      buttonIndex: result.response
    };
  } catch (error) {
    console.error('Print dialog error:', error);
    throw error;
  }
});

// Static file serving - no server needed

function startNextServer() {
  return new Promise((resolve, reject) => {
    // In packaged app, we need to use the unpacked app directory
    const isPackaged = app.isPackaged;
    const appPath = isPackaged ? path.dirname(app.getAppPath()) : path.join(__dirname, '..');

    console.log('App path:', appPath);
    console.log('Is packaged:', isPackaged);
    console.log('__dirname:', __dirname);
    console.log('process.execPath:', process.execPath);

    // Try to start Next.js server - use .cmd on Windows, .sh on Unix
    const nextServerPath = process.platform === 'win32'
      ? path.join(appPath, 'node_modules', '.bin', 'next.cmd')
      : path.join(appPath, 'node_modules', '.bin', 'next');

    console.log('Trying to start Next.js server...');
    console.log('Next bin path:', nextServerPath);

    // Start the server - spawn directly on Windows, use node on Unix
    if (process.platform === 'win32') {
      nextServer = spawn(nextServerPath, ['start'], {
        cwd: appPath,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          NODE_ENV: 'production',
          PORT: '3000'
        }
      });
    } else {
      nextServer = spawn(process.execPath, [nextServerPath, 'start'], {
        cwd: appPath,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          NODE_ENV: 'production',
          PORT: '3000'
        }
      });
    }

    let serverReady = false;
    let startupTimeout;

    // Listen for server output
    nextServer.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Next.js server stdout:', output);

      // Check for ready signals
      if (output.includes('Ready') ||
          output.includes('started server') ||
          output.includes('listening on') ||
          output.includes('Local:') ||
          output.includes('ready') ||
          output.includes('listening') ||
          output.includes('server running') ||
          output.includes('3000')) {
        console.log('Server ready signal detected!');
        serverReady = true;
        if (startupTimeout) clearTimeout(startupTimeout);
        resolve();
      }
    });

    nextServer.stderr.on('data', (data) => {
      const output = data.toString();
      console.error('Next.js server stderr:', output);
    });

    nextServer.on('error', (error) => {
      console.error('Next.js server spawn error:', error);
      reject(new Error(`Failed to spawn Next.js server: ${error.message}`));
    });

    nextServer.on('close', (code) => {
      console.log(`Next.js server exited with code ${code}`);
      if (!serverReady) {
        reject(new Error(`Next.js server exited with code ${code}`));
      }
    });

    // Alternative: Try to connect to the server after a delay
    setTimeout(async () => {
      if (!serverReady) {
        console.log('Checking if server is running by attempting connection...');
        try {
          // Try to make a simple HTTP request to check if server is running
          const http = require('http');
          const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/',
            method: 'HEAD',
            timeout: 2000
          }, (res) => {
            console.log('Server connection successful, status:', res.statusCode);
            serverReady = true;
            if (startupTimeout) clearTimeout(startupTimeout);
            resolve();
          });

          req.on('error', (err) => {
            console.log('Server connection failed:', err.message);
            // Server not ready yet, continue waiting
          });

          req.on('timeout', () => {
            console.log('Server connection timeout');
            req.destroy();
          });

          req.end();
        } catch (error) {
          console.log('Connection check failed:', error.message);
        }
      }
    }, 10000); // Check after 10 seconds

    // Final timeout
    startupTimeout = setTimeout(() => {
      if (!serverReady) {
        reject(new Error('Next.js server startup timeout - server did not respond'));
      }
    }, 60000); // 60 second total timeout
  });
}

async function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false // Allow loading local resources in development
    },
    icon: path.join(__dirname, '../public/icons/icon-512x512.png'),
    show: false, // Don't show until ready
    frame: true, // Use standard window frame
    titleBarStyle: 'default'
  });

  console.log('BrowserWindow created');

  // Load the app
  let startUrl;
  if (isDev) {
    // In development, load from Next.js dev server
    startUrl = 'http://localhost:9003';
    console.log('Loading development URL:', startUrl);
  } else {
    // In production, load from built Next.js app
    startUrl = 'http://localhost:3000';
    console.log('Loading production URL:', startUrl);
  }

  console.log('isDev:', isDev);
  console.log('__dirname:', __dirname);

  mainWindow.loadURL(startUrl);

  // Add error handling for page loading
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load URL:', validatedURL, 'Error:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('crashed', (event) => {
    console.error('Renderer process crashed');
  });

  mainWindow.webContents.on('unresponsive', () => {
    console.error('Renderer process became unresponsive');
  });

  // Handle loading errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load URL:', startUrl, 'Error:', errorCode, errorDescription);
    dialog.showErrorBox(
      'CLC Finance - Loading Error',
      `Failed to load the application.\n\nURL: ${startUrl}\nError: ${errorDescription} (${errorCode})`
    );
  });

  // Handle crashes
  mainWindow.webContents.on('crashed', (event) => {
    console.error('Renderer process crashed');
    dialog.showErrorBox(
      'CLC Finance - Crash Error',
      'The application has crashed. Please restart the application.'
    );
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show, displaying...');
    mainWindow.show();
    console.log('Window should now be visible');

    // Open DevTools in development to help debug UI issues
    if (isDev) {
      mainWindow.webContents.openDevTools();
      console.log('DevTools opened for debugging');
    }
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
    // Stop Next.js server when window is closed
    if (nextServer) {
      nextServer.kill();
      nextServer = null;
    }
  });

  // Handle window being closed
  mainWindow.on('close', (event) => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

async function startApp() {
  try {
    // Start Next.js server first (only in production)
    if (!isDev) {
      await startNextServer();
      console.log('Next.js server started successfully');
    } else {
      console.log('Development mode: using existing Next.js dev server');
    }

    // Then create the window
    await createWindow();

    // Set up application menu
    const template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Quit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectall' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forcereload' },
          { role: 'toggledevtools' },
          { type: 'separator' },
          { role: 'resetzoom' },
          { role: 'zoomin' },
          { role: 'zoomout' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About CLC Finance',
            click: () => {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'About CLC Finance',
                message: 'CLC Finance Management System',
                detail: `Version: ${app.getVersion()}\nBuilt with Electron and Next.js`
              });
            }
          }
        ]
      }
    ];

    // macOS specific menu adjustments
    if (process.platform === 'darwin') {
      template.unshift({
        label: app.getName(),
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services', submenu: [] },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      });

      // Window menu
      template[4].submenu = [
        { role: 'close' },
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' }
      ];
    }

    // Remove the application menu bar
    Menu.setApplicationMenu(null);

    // Register global shortcuts
    globalShortcut.register('F5', () => {
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.reload();
      }
    });

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to start app:', error);
    dialog.showErrorBox('CLC Finance - Startup Error', `Failed to start the application: ${error.message}`);
    app.quit();
  }
}

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Handle app being opened from finder/dock on macOS
app.on('open-file', (event, path) => {
  event.preventDefault();
});

app.on('open-url', (event, url) => {
  event.preventDefault();
});

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  await startApp();
});
