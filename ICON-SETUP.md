# CLC Icon Configuration for Electron

## Current Setup

The Electron app has been configured to use the CLC logo as the application icon.

### Changes Made

1. **Window Icon (Development & Runtime)**
   - File: `electron/main.js`
   - Icon: `public/CLC logo2.png`
   - This icon appears in the taskbar and window title bar when the app is running

2. **Application Icon (Packaged Build)**
   - File: `package.json` (electron-builder configuration)
   - Icon: `public/CLC logo2.png`
   - This icon appears for the installed application

## Icon Format Notes

### Current Format

- **File**: `CLC logo2.png`
- **Format**: PNG
- **Size**: 58,378 bytes

### Recommended for Production

For best results on Windows, electron-builder recommends using `.ico` format with multiple sizes:

- 16x16
- 32x32
- 48x48
- 64x64
- 128x128
- 256x256

### Converting PNG to ICO (Optional)

If you want to create a proper .ico file for better quality:

**Option 1: Online Converter**

1. Visit https://convertio.co/png-ico/
2. Upload `public/CLC logo2.png`
3. Download the .ico file
4. Save as `public/icon.ico`
5. Update `package.json`: `"icon": "public/icon.ico"`

**Option 2: Using ImageMagick (if installed)**

```powershell
magick convert "public/CLC logo2.png" -define icon:auto-resize=256,128,64,48,32,16 "public/icon.ico"
```

**Option 3: Using Online Tools**

- https://icoconvert.com/
- https://www.favicon-generator.org/

## Current Configuration Works

The PNG format will work fine for now. Electron-builder will automatically convert it, though having a native .ico file gives you more control over how the icon looks at different sizes.

## Testing

To see the icon in action:

**Development Mode:**

```powershell
npm run electron-dev
```

The CLC logo should appear in the window title bar and taskbar.

**Production Build:**

```powershell
npm run build-electron-win
```

The installed application will have the CLC logo as its icon.
