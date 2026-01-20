# IIS Deployment Guide for CLC Finance

## Overview

This guide provides instructions for deploying the CLC Finance Next.js application to Internet Information Services (IIS) on Windows Server using IISNode.

## Prerequisites

### Required Software
- **Windows Server** (2016 or later) or **Windows 10/11 Pro**
- **Node.js** 18+ (https://nodejs.org/)
- **IIS** (Internet Information Services)
- **IISNode** (runs Node.js in IIS)

### System Requirements
- Administrator privileges
- At least 4GB RAM
- 2GB free disk space

## Automated Deployment

### Option 1: PowerShell Script (Recommended)

1. **Open PowerShell as Administrator**
   ```
   Right-click PowerShell → Run as Administrator
   ```

2. **Navigate to your project directory**
   ```powershell
   cd "C:\path\to\your\clc-finance\project"
   ```

3. **Run the deployment script**
   ```powershell
   .\iis-deployment.ps1
   ```

4. **Wait for completion**
   - The script will automatically:
     - Check/install IIS
     - Install IISNode
     - Copy application files
     - Configure IIS site
     - Build and deploy the application

## Manual Deployment

If the automated script fails, follow these manual steps:

### Step 1: Install IIS and IISNode

#### Install IIS
```powershell
# Run PowerShell as Administrator
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-ApplicationInit, IIS-ISAPIExtensions, IIS-ISAPIFilter, IIS-ASP, IIS-ASPNET, IIS-ASPNET45, IIS-NetFxExtensibility, IIS-NetFxExtensibility45, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpLogging, IIS-RequestFiltering, IIS-StaticContent, IIS-DefaultDocument, IIS-DirectoryBrowsing, IIS-WebSockets, IIS-ApplicationDevelopment
```

#### Install IISNode
1. Download IISNode: https://github.com/Azure/iisnode/releases
2. Run the MSI installer as Administrator
3. Verify installation: `C:\Program Files\iisnode\iisnode.dll` should exist

### Step 2: Prepare Application

1. **Create IIS directory**
   ```cmd
   mkdir C:\inetpub\wwwroot\clc-finance
   ```

2. **Copy application files**
   ```cmd
   xcopy /E /I /Y "C:\path\to\your\project\*" "C:\inetpub\wwwroot\clc-finance\"
   ```

3. **Set permissions**
   ```cmd
   icacls "C:\inetpub\wwwroot\clc-finance" /grant "IIS_IUSRS:(OI)(CI)F" /T
   icacls "C:\inetpub\wwwroot\clc-finance" /grant "IUSR:(OI)(CI)R" /T
   ```

4. **Install dependencies**
   ```cmd
   cd C:\inetpub\wwwroot\clc-finance
   npm install --production
   ```

5. **Build application**
   ```cmd
   npm run build
   ```

6. **Setup database**
   ```cmd
   npm run populate-db
   ```

### Step 3: Create IIS Configuration Files

#### Create `web.config`
```xml
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
```

#### Create `server.js`
```javascript
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
```

### Step 4: Configure IIS

1. **Open IIS Manager** (inetmgr)

2. **Create Application Pool**
   - Application Pools → Add Application Pool
   - Name: `CLC-Finance-AppPool`
   - .NET CLR Version: `No Managed Code`
   - Process Model → Identity: `ApplicationPoolIdentity`

3. **Create Website**
   - Sites → Add Website
   - Site name: `CLC-Finance`
   - Application pool: `CLC-Finance-AppPool`
   - Physical path: `C:\inetpub\wwwroot\clc-finance`
   - Binding: `*:80` (leave hostname empty)

4. **Start the website**
   - Right-click CLC-Finance → Manage Website → Start

## Access Your Application

- **URL**: `http://localhost/` or `http://your-server-ip/`
- **Admin Login**: `admin` / `password`
- **Staff Login**: `staff` / `password`

## Troubleshooting

### Common Issues

#### 1. IISNode Not Working
```powershell
# Check IISNode installation
Get-Item "C:\Program Files\iisnode\iisnode.dll"

# Restart IIS
iisreset
```

#### 2. Application Pool Errors
- Check Event Viewer → Windows Logs → Application
- Ensure Application Pool identity has proper permissions

#### 3. Database Connection Issues
```cmd
cd C:\inetpub\wwwroot\clc-finance
npm run populate-db
```

#### 4. Port Conflicts
- IIS default site might conflict with port 80
- Either stop default site or change CLC-Finance binding

#### 5. Node.js Permissions
```cmd
icacls "C:\inetpub\wwwroot\clc-finance" /grant "IIS_IUSRS:(OI)(CI)F" /T
```

### Logs Location

- **IIS Logs**: `C:\inetpub\logs\LogFiles\`
- **Application Logs**: Check Windows Event Viewer
- **Node.js Logs**: `C:\inetpub\wwwroot\clc-finance\` (if configured)

### Performance Tuning

#### Application Pool Settings
- Queue Length: 1000
- Idle Time-out: 0
- Recycling: Disable regular recycling

#### IISNode Settings (web.config)
```xml
<configuration>
  <system.webServer>
    <iisnode
      nodeProcessCountPerApplication="1"
      maxConcurrentRequestsPerProcess="1024"
      maxNamedPipeConnectionRetry="100"
      namedPipeConnectionRetryDelay="250"
      maxNamedPipeConnectionPoolSize="512"
      maxNamedPipePooledConnectionAge="30000"
      asyncCompletionThreadCount="0"
      initialRequestBufferSize="4096"
      maxRequestBufferSize="65536"
      watchedFiles="*.js;*.json;*.coffee;*.less"
      uncFileChangesPollingInterval="5000"
      gracefulShutdownTimeout="60000"
      loggingEnabled="true"
      logDirectory="..\..\logs\iisnode"
      debuggingEnabled="false"
      debuggerPortRange="5058-6058"
      debuggerPathSegment="debug"
      maxLogFileSizeInKB="128"
      maxTotalLogFileSizeInKB="1024"
      maxLogFiles="20"
      devErrorsEnabled="false"
      flushResponse="false"
      enableXFF="false"
      promoteServerVars=""
    />
  </system.webServer>
</configuration>
```

## Security Considerations

1. **SSL Certificate**: Configure HTTPS in production
2. **Firewall**: Restrict access to necessary ports
3. **File Permissions**: Limit IIS_IUSRS permissions
4. **Database**: Use strong passwords for production
5. **Updates**: Keep Node.js, IIS, and Windows updated

## Backup and Recovery

### Database Backup
```cmd
# Copy SQLite database file
copy C:\inetpub\wwwroot\clc-finance\database.sqlite C:\backup\
```

### Application Backup
```cmd
# Backup entire application directory
xcopy C:\inetpub\wwwroot\clc-finance C:\backup\clc-finance\ /E /I /Y
```

### Restore
```cmd
# Stop IIS site
appcmd stop site "CLC-Finance"

# Restore files
xcopy C:\backup\clc-finance C:\inetpub\wwwroot\clc-finance /E /I /Y

# Start IIS site
appcmd start site "CLC-Finance"
```

## Monitoring

### Health Check
- Visit: `http://localhost/api/health`
- Should return JSON with status information

### Performance Monitoring
- IIS Manager → Worker Processes
- Windows Performance Monitor
- Application logs

---

**🎉 Your CLC Finance application is now deployed to IIS!**

For support or issues, check the troubleshooting section above or consult the IIS and IISNode documentation.
