# CLC Finance - Electron Desktop Application

This guide explains how to run, build, and distribute the CLC Finance application as a standalone desktop application using Electron.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Windows OS (for building Windows installers)

## Development Mode

### Option 1: Using the Combined Script (Recommended)

This will start both the Next.js dev server and Electron simultaneously:

```bash
npm run electron-dev
```

This command:
1. Starts Next.js dev server on port 9003
2. Waits for the server to be ready
3. Launches Electron in development mode with DevTools open

### Option 2: Manual Start (Two Terminals)

**Terminal 1 - Start Next.js dev server:**
```bash
npm run dev-electron
```

**Terminal 2 - Start Electron:**
```bash
npm run electron
```

## Building for Production

### Step 1: Build Next.js Application

First, build the Next.js application for production:

```bash
npm run build
```

This creates an optimized production build in the `.next` directory.

### Step 2: Build Electron Application

#### Build for Windows

```bash
npm run build-electron-win
```

This will:
- Build the Next.js app (if not already built)
- Package the Electron app
- Create a Windows installer (NSIS)
- Output files to `dist-electron-new` directory

#### Build for macOS (on macOS only)

```bash
npm run build-electron-mac
```

#### Build for Linux

```bash
npm run build-electron-linux
```

## Build Output

After building, you'll find the following in the `dist-electron-new` directory:

- **Windows**: `CLC Finance Setup X.X.X.exe` - NSIS installer
- **macOS**: `CLC Finance-X.X.X.dmg` - DMG installer
- **Linux**: `CLC Finance-X.X.X.AppImage` - AppImage executable

## Installation

### Windows

1. Run the `CLC Finance Setup.exe` installer
2. Follow the installation wizard
3. Choose installation directory (default: `C:\Program Files\CLC Finance`)
4. Launch the application from the Start Menu or Desktop shortcut

### Uninstallation

Use Windows "Add or Remove Programs" to uninstall the application.

## Features in Electron

The Electron version includes all web features plus:

- **Native Window Controls**: Minimize, maximize, close buttons
- **Native Printing**: Direct access to system printers
- **Print Preview**: Built-in print preview functionality
- **Offline Support**: Works without internet connection (after initial setup)
- **Auto-updates**: (Can be configured for future versions)
- **System Tray**: (Can be added if needed)

## Configuration

### Application Settings

Edit `package.json` to modify Electron builder settings:

```json
{
  "build": {
    "appId": "com.clcfinance.app",
    "productName": "CLC Finance",
    "directories": {
      "output": "dist-electron-new"
    },
    "win": {
      "target": "nsis"
    }
  }
}
```

### Window Settings

Edit `electron/main.js` to modify window properties:

```javascript
mainWindow = new BrowserWindow({
  width: 1400,        // Default width
  height: 900,        // Default height
  minWidth: 1000,     // Minimum width
  minHeight: 700,     // Minimum height
  // ... other settings
});
```

## Troubleshooting

### Build Issues

**Problem**: Build fails with "Cannot find module"
- **Solution**: Run `npm install` to ensure all dependencies are installed

**Problem**: Icon not showing
- **Solution**: Ensure `build/icon.png` and `build/icon.ico` exist

**Problem**: Application won't start
- **Solution**: Check that Next.js build completed successfully (`npm run build`)

### Development Issues

**Problem**: Electron window is blank
- **Solution**: Ensure Next.js dev server is running on port 9003

**Problem**: Hot reload not working
- **Solution**: This is expected in Electron. Restart the Electron app to see changes

### Database Issues

**Problem**: Database not found in production
- **Solution**: The app uses SQLite. Ensure the database file path is correctly configured in production

## Distribution

### Code Signing (Optional but Recommended)

For production distribution, you should sign your application:

1. Obtain a code signing certificate
2. Configure in `package.json`:

```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.pfx",
      "certificatePassword": "your-password"
    }
  }
}
```

### Auto-Updates (Optional)

To enable auto-updates, configure electron-updater:

1. Set up a release server
2. Configure update settings in `electron/main.js`
3. Publish releases to the server

## File Structure

```
CLC_finance/
├── electron/
│   ├── main.js          # Main Electron process
│   └── preload.js       # Preload script for IPC
├── build/
│   ├── icon.png         # App icon (Linux/macOS)
│   └── icon.ico         # App icon (Windows)
├── public/
│   └── icons/           # PWA icons
├── src/                 # Next.js application
└── package.json         # Dependencies and build config
```

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run electron` | Run Electron (requires dev server running) |
| `npm run electron-dev` | Run Electron + Next.js dev server together |
| `npm run dev-electron` | Start Next.js dev server on port 9003 |
| `npm run build` | Build Next.js for production |
| `npm run build-electron-win` | Build Windows installer |
| `npm run build-electron-mac` | Build macOS installer |
| `npm run build-electron-linux` | Build Linux AppImage |

## Support

For issues or questions:
- Check the troubleshooting section above
- Review Electron documentation: https://www.electronjs.org/docs
- Review electron-builder documentation: https://www.electron.build/

## Version Information

- Electron: v32.0.0
- Next.js: v16.1.4
- Node.js: v18+ required
