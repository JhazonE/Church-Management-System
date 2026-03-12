'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if running in Electron
    const isElectron = typeof window !== 'undefined' && window.electronAPI;

    if (isElectron) {
      // Auto-login as Admin for Electron
      const adminUser: User = {
        id: 'admin-1',
        username: 'admin',
        name: 'Administrator',
        email: 'admin@clc.com',
        role: 'Admin',
        permissions: {
          dashboard: true,
          members: true,
          donations: true,
          expenses: true,
          events: true,
          reports: true,
          users: true,
          settings: true
        },
        createdAt: new Date().toISOString()
      };
      setUser(adminUser);
      localStorage.setItem('clc-user', JSON.stringify(adminUser));
    } else {
      // Web behavior: load from local storage
      const storedUser = localStorage.getItem('clc-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  const login = (loggedInUser: User) => {
    localStorage.setItem('clc-user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const logout = () => {
    localStorage.removeItem('clc-user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
