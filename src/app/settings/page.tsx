'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/context/settings-context';
import { Settings, Palette, FileImage, Upload, Database, Clock, Download } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [appName, setAppName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backupInfo, setBackupInfo] = useState<any>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [triggeringBackup, setTriggeringBackup] = useState(false);
  const [backupTime, setBackupTime] = useState('02:00');
  const [backupEnabled, setBackupEnabled] = useState(true);

  // Load settings from database on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const dbSettings = await response.json();
          setAppName(dbSettings.appName);
          setLogoUrl(dbSettings.logoUrl);
          setBackupTime(dbSettings.backupTime || '02:00');
          setBackupEnabled(dbSettings.backupEnabled !== undefined ? dbSettings.backupEnabled : true);
          // Update context with database settings (theme will be handled separately)
          updateSettings({
            appName: dbSettings.appName,
            logoUrl: dbSettings.logoUrl,
            theme: dbSettings.theme
          });
        } else {
          // If no settings in database, use defaults
          setAppName(settings.appName);
          setLogoUrl(settings.logoUrl);
          setBackupTime('02:00');
          setBackupEnabled(true);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        // Fallback to context settings
        setAppName(settings.appName);
        setLogoUrl(settings.logoUrl);
        setBackupTime('02:00');
        setBackupEnabled(true);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []); // Empty dependency array to run only once on mount

  // Load backup information
  const loadBackupInfo = async () => {
    setBackupLoading(true);
    try {
      const response = await fetch('/api/backup');
      if (response.ok) {
        const data = await response.json();
        setBackupInfo(data.data);
      }
    } catch (error) {
      console.error('Error loading backup info:', error);
    } finally {
      setBackupLoading(false);
    }
  };

  // Load backup info on component mount
  useEffect(() => {
    loadBackupInfo();
  }, []);

  // Function to trigger manual backup
  const handleManualBackup = async () => {
    setTriggeringBackup(true);
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
      });

      if (response.ok) {
        alert('Backup completed successfully!');
        await loadBackupInfo(); // Refresh backup info
      } else {
        const error = await response.json();
        alert(error.message || 'Backup failed');
      }
    } catch (error) {
      console.error('Manual backup error:', error);
      alert('Backup failed');
    } finally {
      setTriggeringBackup(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appName,
          logoUrl,
          theme: settings.theme,
          backupTime,
          backupEnabled,
        }),
      });

      if (response.ok) {
        // Update context with saved settings
        updateSettings({
          appName,
          logoUrl,
          theme: settings.theme,
        });
        alert('Settings saved successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleThemeToggle = (checked: boolean) => {
    updateSettings({
      theme: checked ? 'dark' : 'light',
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setLogoUrl(result.url);
        updateSettings({ logoUrl: result.url });
      } else {
        alert(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Customize your application appearance and branding.
            </p>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading settings...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Customize your application appearance and branding.
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Application Settings
              </CardTitle>
              <CardDescription>
                Configure the basic settings for your application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">Application Name</Label>
                <Input
                  id="app-name"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Enter application name"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="h-5 w-5" />
                Branding
              </CardTitle>
              <CardDescription>
                Customize the logo and visual identity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo-url">Logo URL</Label>
                <Input
                  id="logo-url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="Enter logo image URL"
                />
                <p className="text-sm text-muted-foreground">
                  Enter a URL to an image file (PNG, JPG, etc.) or upload a file below.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo-upload">Upload Logo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    className="shrink-0"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload a new logo image (PNG, JPG, GIF, WebP). Max size: 5MB.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the visual appearance of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark themes.
                  </p>
                </div>
                <Switch
                  checked={settings.theme === 'dark'}
                  onCheckedChange={handleThemeToggle}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                MySQL Backup Scheduler
              </CardTitle>
              <CardDescription>
                Configure automatic database backups and manage backup files.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Backup Status Section */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Backup Status
                </Label>
                {backupLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Loading backup information...</p>
                  </div>
                ) : backupInfo ? (
                  <div className="text-sm space-y-1">
                    <p><strong>Total backups:</strong> {backupInfo.totalBackups}</p>
                    {backupInfo.lastBackup && (
                      <p><strong>Last backup:</strong> {new Date(backupInfo.lastBackup.createdAt).toLocaleString()}</p>
                    )}
                    <p><strong>Backup directory:</strong> {backupInfo.backupDirectory}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Unable to load backup information</p>
                )}
              </div>

              {/* Scheduled Backup Settings */}
              <div className="space-y-3">
                <Label>Scheduler Settings</Label>

                {/* Backup Enabled Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="backup-enabled">Enable Automatic Backups</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle automatic daily backups on or off
                    </p>
                  </div>
                  <Switch
                    id="backup-enabled"
                    checked={backupEnabled}
                    onCheckedChange={setBackupEnabled}
                  />
                </div>

                {/* Backup Time Setting */}
                <div className="space-y-2">
                  <Label htmlFor="backup-time">Backup Time</Label>
                  <Input
                    id="backup-time"
                    type="time"
                    value={backupTime}
                    onChange={(e) => setBackupTime(e.target.value)}
                    disabled={!backupEnabled}
                    placeholder="02:00"
                  />
                  <p className="text-sm text-muted-foreground">
                    Time to run automatic daily backups (HH:MM format)
                  </p>
                </div>

                {/* Scheduler Info */}
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">
                    <strong>Automatic backups:</strong> {backupEnabled ? `Daily at ${backupTime || '02:00'}` : 'Disabled'}
                  </p>
                  <p className="text-sm">
                    <strong>Retention:</strong> Keeps 7 most recent backups
                  </p>
                  <p className="text-sm">
                    <strong>Databases:</strong> SQLite and MySQL
                  </p>
                </div>
              </div>

              {/* Manual Backup Button */}
              <div className="space-y-2">
                <Label>MySQL Manual Backup</Label>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleManualBackup}
                    disabled={triggeringBackup}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4" />
                    {triggeringBackup ? 'Creating Backup...' : 'Run Backup Now'}
                  </Button>
                  {triggeringBackup && (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <p className="text-sm text-blue-600">Backing up MySQL data...</p>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Immediately backup all MySQL data including tables, donations, expenses, members, and settings
                </p>
              </div>

              {/* Available Backup Files */}
              {backupInfo?.backupFiles && backupInfo.backupFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Available Backup Files</Label>
                  <div className="bg-muted p-3 rounded-md space-y-2">
                    {backupInfo.backupFiles.map((file: any) => (
                      <div key={file.name} className="flex items-center justify-between p-2 bg-background rounded border">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {file.type} • {(file.size / 1024).toFixed(1)} KB • {new Date(file.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = `/api/backup/download/${file.name}`;
                            link.download = file.name;
                            link.click();
                          }}
                          className="ml-2"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Download backup files for offline storage or restoration purposes
                  </p>
                </div>
              )}

              {/* Recent Logs */}
              {backupInfo?.recentLogs && (
                <div className="space-y-2">
                  <Label>Recent Backup Logs</Label>
                  <div className="bg-muted p-3 rounded-md max-h-32 overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap font-mono">
                      {backupInfo.recentLogs}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
