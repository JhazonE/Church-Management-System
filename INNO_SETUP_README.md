# Inno Setup Deployment Guide for CLC Finance

This guide explains how to set up and use Inno Setup to create professional Windows installers for the CLC Finance application.

## Prerequisites

### 1. Install Inno Setup
Download and install Inno Setup from the official website:
- **Download**: https://jrsoftware.org/isinfo.php
- **Recommended Version**: Inno Setup 6.x (latest stable)
- **Installation Path**: `C:\Program Files (x86)\Inno Setup 6\` or `C:\Program Files\Inno Setup 6\`

### 2. Install Inno Setup Compiler (ISCC)
The Inno Setup Compiler (`ISCC.exe`) should be installed automatically with Inno Setup.

### 3. Verify Installation
After installation, verify that Inno Setup is accessible:
```bash
# Check if ISCC is in PATH
where ISCC

# Or check installation directory
dir "C:\Program Files (x86)\Inno Setup*"
```

If Inno Setup is not found, the build scripts will display an error message with installation instructions.

## Project Structure

```
project-root/
├── installer.iss          # Inno Setup script
├── package.json           # Updated with Inno Setup scripts
├── dist-electron-new/     # Built Electron app (created by electron-builder)
│   └── win-unpacked/      # Unpacked Windows executable
├── public/
│   └── icons/
│       └── icon.ico       # Application icon for installer
└── LICENSE                # License file (referenced in installer.iss)
```

## Inno Setup Script Configuration

The `installer.iss` file contains the complete Inno Setup configuration:

### Key Settings:
- **App Name**: CLC Finance
- **Version**: 1.0.0 (update as needed)
- **Publisher**: CLC
- **Output Directory**: `dist-installer/`
- **Source Files**: `dist-electron-new\win-unpacked\*`
- **Installation Directory**: `{autopf}\CLC Finance` (Program Files)

### Features:
- Modern installer UI
- Desktop shortcut option
- Start menu integration
- Automatic application launch after installation
- LZMA compression for smaller installer size

## Build Scripts

### Available NPM Scripts:

```bash
# Build Electron app + create Inno Setup installer
npm run build-inno

# Build Electron app + create portable Inno Setup installer
npm run build-inno-portable
```

### Manual Build Process:

1. **Build the Electron app**:
   ```bash
   npm run build-electron-win
   ```

2. **Create the installer**:
   ```bash
   "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" installer.iss
   ```

3. **For portable version**:
   ```bash
   "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" /DPORTABLE installer.iss
   ```

## Output Files

After successful build, you'll find:
- **Installer**: `dist-installer/CLC-Finance-Setup-1.0.0.exe`
- **Size**: Typically 150-200MB depending on app size
- **Type**: Standard Windows installer (.exe)

## Customization Options

### Version Updates
Update the version in `installer.iss`:
```iss
#define MyAppVersion "1.1.0"
```

### Icon Changes
Replace the icon file path:
```iss
SetupIconFile=public\icons\your-icon.ico
```

### Installation Directory
Modify the default installation path:
```iss
DefaultDirName={autopf}\YourAppName
```

### Additional Files
Add more files to include:
```iss
[Files]
Source: "dist-electron-new\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "README.txt"; DestDir: "{app}"; Flags: ignoreversion
Source: "changelog.txt"; DestDir: "{app}"; Flags: ignoreversion
```

## Advanced Configuration

### Pre/Post Install Scripts
Add custom Pascal scripts in the `[Code]` section for advanced functionality.

### Multiple Languages
Add language support by including additional `.isl` files.

### Silent Installation
The installer supports silent installation:
```bash
CLC-Finance-Setup-1.0.0.exe /SILENT
```

## Troubleshooting

### Common Issues:

1. **"ISCC.exe not found"**
   - Verify Inno Setup installation path
   - Update the path in package.json scripts

2. **"Source files not found"**
   - Ensure `npm run build-electron-win` completed successfully
   - Check that `dist-electron-new/win-unpacked/` exists

3. **Icon not showing**
   - Ensure `public/icons/icon.ico` exists
   - Verify the path in `installer.iss`

4. **Permission errors**
   - Run command prompt as Administrator
   - Check write permissions for output directories

### Build Verification:

1. Check that all files are included in the installer
2. Test installation on a clean Windows system
3. Verify application launches after installation
4. Test uninstallation process

## Alternative: Portable Version

For a portable version (no installation required), use:
```bash
npm run build-inno-portable
```

This creates a self-contained executable that can run from any location.

## Integration with CI/CD

For automated builds, ensure Inno Setup is installed on your build server and add the build scripts to your pipeline.

## Support

For Inno Setup documentation, visit: https://jrsoftware.org/ishelp/

For CLC Finance specific issues, check the main README.md file.
