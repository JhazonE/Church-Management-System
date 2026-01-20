# PowerShell script to set up auto-start without admin rights
# Places shortcut in user's startup folder

$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:APPDATA\Microsoft\Windows\Start Menu\Programs\StartUp\CLC Finance Auto Start.lnk")
$Shortcut.TargetPath = "$PSScriptRoot\auto-start.bat"
$Shortcut.WorkingDirectory = "$PSScriptRoot"
$Shortcut.Save()

Write-Host "Auto-start shortcut created in startup folder."
Write-Host "CLC Finance will now start automatically when you log in to Windows."
Write-Host "Shortcut location: $env:APPDATA\Microsoft\Windows\Start Menu\Programs\StartUp\CLC Finance Auto Start.lnk"
Write-Host ""
Write-Host "To test, restart your computer or log out and back in."
