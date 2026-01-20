'use client';

import React, { useState, useEffect } from 'react';
import { Minus, Square, X, Maximize2, Minimize2, Monitor, MonitorOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/context/settings-context';

export function TitleBar() {
  const { settings } = useSettings();
  const [isMaximized, setIsMaximized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if we're running in Electron
    const isElectronEnv = typeof window !== 'undefined' &&
      (window.electronAPI ||
       (typeof navigator !== 'undefined' && navigator.userAgent.includes('Electron')));

    if (isElectronEnv) {
      setIsElectron(true);

      // Check initial states
      if (window.electronAPI) {
        Promise.all([
          window.electronAPI.isMaximized(),
          window.electronAPI.isFullscreen()
        ]).then(([maximized, fullscreen]) => {
          setIsMaximized(maximized);
          setIsFullscreen(fullscreen);
        });

        // Listen for maximize/unmaximize events
        const handleMaximized = () => setIsMaximized(true);
        const handleUnmaximized = () => setIsMaximized(false);

        window.electronAPI.on('window-maximized', handleMaximized);
        window.electronAPI.on('window-unmaximized', handleUnmaximized);

        return () => {
          window.electronAPI?.removeAllListeners('window-maximized');
          window.electronAPI?.removeAllListeners('window-unmaximized');
        };
      }
    }
  }, []);

  const handleMinimize = () => {
    console.log('Minimize button clicked');
    if (window.electronAPI) {
      console.log('Calling electronAPI.minimize()');
      window.electronAPI.minimize();
    } else {
      console.log('electronAPI not available');
    }
  };

  const handleMaximize = () => {
    if (isMaximized) {
      window.electronAPI?.unmaximize();
    } else {
      window.electronAPI?.maximize();
    }
  };

  const handleClose = () => {
    window.electronAPI?.close();
  };

  const handleToggleFullscreen = () => {
    window.electronAPI?.toggleFullscreen();
  };

  // Show the custom title bar for frameless windows
  // For framed windows, this provides additional branding and controls

  return (
    <div className="flex items-center justify-between h-8 bg-background border-b border-border px-4 select-none drag-region">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-muted-foreground">
          {settings.appName} Management System
        </span>
      </div>

      {/* No buttons - just branding */}
    </div>
  );
}
