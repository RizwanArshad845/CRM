import { app, BrowserWindow, utilityProcess } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let backendProcess;
let mainWindow;

function startBackend() {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  // Use the direct project path. Electron's utilityProcess understands ASAR automatically.
  const backendPath = path.join(__dirname, '../backend/index.js');

  console.log('--- BACKEND STARTUP (utilityProcess) ---');
  console.log('App isPackaged:', app.isPackaged);
  console.log('Backend Path:', backendPath);
  
  // utilityProcess.fork requires the env object to contain ONLY strings.
  // Sometimes process.env contains non-string values which causes TypeErrors in Electron.
  const forkEnv = {};
  for (const key in process.env) {
    const val = process.env[key];
    if (typeof val === 'string') {
      forkEnv[key] = val;
    }
  }

  // Set our specific vars as strings
  forkEnv.PORT = '5000';
  forkEnv.NODE_ENV = isDev ? 'development' : 'production';

  backendProcess = utilityProcess.fork(backendPath, [], {
    env: forkEnv,
    stdio: 'inherit'
  });

  backendProcess.on('spawn', () => {
    console.log('Backend utility process spawned successfully.');
  });

  backendProcess.on('exit', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: "CRM Application",
    autoHideMenuBar: true, // cleaner look for a desktop app
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // Determines whether we are in "dev" script mode or running a packaged EXE
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    // Wait for vite to start on 5173
    mainWindow.loadURL('http://localhost:5173').catch(() => {
        setTimeout(() => mainWindow.loadURL('http://localhost:5173'), 1000);
    });
    // Open the DevTools by default in dev mode
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the bundled React app
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  // 1. Boot up the Express Server
  startBackend();
  
  // 2. Boot up the Frontend Window
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  // Ensure the Express backend process is killed when the user closes the desktop app
  if (backendProcess) {
    backendProcess.kill();
  }
});
