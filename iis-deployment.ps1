# IIS Deployment Script for CLC Finance
# Run this as Administrator in PowerShell

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  CLC Finance - IIS Deployment Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found! Please install from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check IIS
try {
    $iisFeatures = Get-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer
    if ($iisFeatures.State -contains "Enabled") {
        Write-Host "✓ IIS is installed and enabled" -ForegroundColor Green
    } else {
        Write-Host "✗ IIS is not installed! Installing IIS..." -ForegroundColor Yellow

        # Install IIS
        Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-ApplicationInit, IIS-ISAPIExtensions, IIS-ISAPIFilter, IIS-ASP, IIS-ASPNET, IIS-ASPNET45, IIS-NetFxExtensibility, IIS-NetFxExtensibility45, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpLogging, IIS-RequestFiltering, IIS-StaticContent, IIS-DefaultDocument, IIS-DirectoryBrowsing, IIS-WebSockets, IIS-ApplicationDevelopment

        Write-Host "✓ IIS installed successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Failed to check/install IIS" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check IISNode
$iisNodePath = "$env:ProgramFiles\iisnode"
if (Test-Path $iisNodePath) {
    Write-Host "✓ IISNode is installed" -ForegroundColor Green
} else {
    Write-Host "⚠ IISNode not found. Installing IISNode..." -ForegroundColor Yellow

    # Download and install IISNode
    try {
        $iisNodeUrl = "https://github.com/Azure/iisnode/releases/download/v0.2.26/iisnode-full-v0.2.26-x64.msi"
        $installerPath = "$env:TEMP\iisnode.msi"

        Write-Host "Downloading IISNode..."
        Invoke-WebRequest -Uri $iisNodeUrl -OutFile $installerPath

        Write-Host "Installing IISNode..."
        Start-Process msiexec.exe -Wait -ArgumentList "/i $installerPath /quiet"

        Remove-Item $installerPath -Force
        Write-Host "✓ IISNode installed successfully" -ForegroundColor Green
    } catch {
    Write-Host "✗ Failed to install IISNode. You may need to install it manually." -ForegroundColor Red
    Write-Host "Download from: https://github.com/Azure/iisnode/releases" -ForegroundColor Yellow
  }
}
}

# Create application directory
$appDir = "C:\inetpub\wwwroot\clc-finance"
Write-Host "Setting up application directory: $appDir" -ForegroundColor Yellow

if (-not (Test-Path $appDir)) {
    New-Item -ItemType Directory -Path $appDir -Force | Out-Null
    Write-Host "✓ Created application directory" -ForegroundColor Green
} else {
    Write-Host "✓ Application directory already exists" -ForegroundColor Green
}

# Copy application files
Write-Host "Copying application files..." -ForegroundColor Yellow
$currentDir = Get-Location
Copy-Item -Path "$currentDir\*" -Destination $appDir -Recurse -Force
Write-Host "✓ Application files copied" -ForegroundColor Green

# Set permissions
Write-Host "Setting permissions..." -ForegroundColor Yellow
icacls $appDir /grant "IIS_IUSRS:(OI)(CI)F" /T | Out-Null
icacls $appDir /grant "IUSR:(OI)(CI)R" /T | Out-Null
Write-Host "✓ Permissions set" -ForegroundColor Green

# Create web.config for IISNode
$webConfig = @"
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode" />
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^server.js\/debug[\/]?" />
        </rule>
        <rule name="StaticContent" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^.*\.(css|js|jpg|png|gif|ico|svg|woff|woff2|ttf|eot)$" />
        </rule>
        <rule name="MainRule" patternSyntax="ECMAScript" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll" trackAllCaptures="false">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
          </conditions>
          <action type="Rewrite" url="server.js" />
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <requestLimits maxAllowedContentLength="104857600" />
      </requestFiltering>
    </security>
    <defaultDocument>
      <files>
        <clear />
        <add value="server.js" />
      </files>
    </defaultDocument>
  </system.webServer>
</configuration>
"@

$webConfig | Out-File -FilePath "$appDir\web.config" -Encoding UTF8
Write-Host "✓ Created web.config for IISNode" -ForegroundColor Green

# Create server.js entry point for IISNode
$serverJs = @"
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:' + (process.env.PORT || 3000));
  });
});
"@

$serverJs | Out-File -FilePath "$appDir\server.js" -Encoding UTF8
Write-Host "✓ Created server.js entry point" -ForegroundColor Green

# Install dependencies in deployment directory
Write-Host "Installing dependencies in deployment directory..." -ForegroundColor Yellow
Set-Location $appDir
npm install --production
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Build the application
Write-Host "Building application..." -ForegroundColor Yellow
npm run build
Write-Host "✓ Application built" -ForegroundColor Green

# Populate database
Write-Host "Setting up database..." -ForegroundColor Yellow
npm run populate-db
Write-Host "✓ Database populated" -ForegroundColor Green

# Create IIS site
Write-Host "Creating IIS website..." -ForegroundColor Yellow

Import-Module WebAdministration

# Check if site already exists
$siteExists = Get-IISSite -Name "CLC-Finance" -ErrorAction SilentlyContinue

if ($siteExists) {
    Write-Host "✓ IIS site 'CLC-Finance' already exists" -ForegroundColor Green
} else {
    # Create new site
    New-IISSite -Name "CLC-Finance" -BindingInformation "*:80:" -PhysicalPath $appDir
    Write-Host "✓ Created IIS site 'CLC-Finance'" -ForegroundColor Green
}

# Set application pool
$appPoolName = "CLC-Finance-AppPool"
$appPoolExists = Get-IISAppPool -Name $appPoolName -ErrorAction SilentlyContinue

if (-not $appPoolExists) {
    New-IISAppPool -Name $appPoolName
    Set-IISAppPool -Name $appPoolName -ProcessModelIdentityType ApplicationPoolIdentity
    Write-Host "✓ Created application pool '$appPoolName'" -ForegroundColor Green
}

# Assign application pool to site
Set-IISSite -Name "CLC-Finance" -ApplicationPool $appPoolName
Write-Host "✓ Assigned application pool to site" -ForegroundColor Green

# Start the site
Start-IISSite -Name "CLC-Finance"
Write-Host "✓ Started IIS site" -ForegroundColor Green

# Return to original directory
Set-Location $currentDir

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your CLC Finance application is now deployed to IIS!" -ForegroundColor White
Write-Host ""
Write-Host "Access your application at:" -ForegroundColor Cyan
Write-Host "  http://localhost/" -ForegroundColor Yellow
Write-Host ""
Write-Host "Login Credentials:" -ForegroundColor Cyan
Write-Host "  Admin: admin / password" -ForegroundColor Yellow
Write-Host "  Staff: staff / password" -ForegroundColor Yellow
Write-Host ""
Write-Host "IIS Site Name: CLC-Finance" -ForegroundColor Cyan
Write-Host "Application Pool: CLC-Finance-AppPool" -ForegroundColor Cyan
Write-Host "Physical Path: $appDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "To restart the application:" -ForegroundColor White
Write-Host "  IIS Manager -> Sites -> CLC-Finance -> Restart" -ForegroundColor Gray
Write-Host ""
Write-Host "To view logs:" -ForegroundColor White
Write-Host "  Check Windows Event Viewer or IIS logs" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to finish"
