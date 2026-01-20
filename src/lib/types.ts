export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  network: string;
  joinDate: string;
  avatarUrl: string;
}

export interface RawMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  network: string;
  join_date: string;
  avatar_url: string;
}

export interface RawDonation {
  id: string;
  donor_name: string;
  member_id: string;
  amount: string | number; // MySQL DECIMAL returns as string
  date: string;
  category: string;
  giving_type_id?: string;
  service_time?: string;
  recorded_by_id?: string;
  reference?: string;
}

export interface Donation {
  id: string;
  donorName: string;
  memberId: string;
  amount: number;
  date: string;
  category: string;
  serviceTime?: string;
  givingTypeId?: string;
  recordedById?: string;
  reference?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  recordedById: string;
}

export interface RawExpense {
  id: string;
  description: string;
  amount: string | number; // MySQL DECIMAL returns as string
  date: string;
  category: string;
  recorded_by_id: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: string[];
  resource: string;
}

export interface Resource {
  id: string;
  name: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'Admin' | 'Staff';
  permissions: {
    dashboard: boolean;
    members: boolean;
    donations: boolean;
    expenses: boolean;
    events: boolean;
    reports: boolean;
    users: boolean;
    settings: boolean;
  };
  createdAt: string;
  lastLogin?: string;
}

export type PagePermission = keyof User['permissions'] | 'settings';

// Database function types
export interface DatabaseAPI {
  // Members
  getAllMembers: () => Member[];
  // Events
  getAllEvents: () => Event[];
  // Donations
  getAllDonations: () => Donation[];
  // Expenses
  getAllExpenses: () => Expense[];
  // Users
  getAllUsers: () => User[];
  getUserById: (id: string) => User | undefined;
  createUser: (user: Partial<User>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  // Donation categories
  getAllDonationCategories: () => Array<{ id: string; name: string; created_at: string }>;
  createDonationCategory: (category: { id: string; name: string }) => void;
  updateDonationCategory: (id: string, name: string) => void;
  deleteDonationCategory: (id: string) => void;
  // Expense categories
  getAllExpenseCategories: () => Array<{ id: string; name: string; created_at: string }>;
  createExpenseCategory: (category: { id: string; name: string }) => void;
  updateExpenseCategory: (id: string, name: string) => void;
  deleteExpenseCategory: (id: string) => void;
  // Service times
  getAllServiceTimes: () => Array<{ id: string; time: string; created_at: string }>;
  createServiceTime: (serviceTime: { id: string; time: string }) => void;
  updateServiceTime: (id: string, time: string) => void;
  deleteServiceTime: (id: string) => void;
  // Giving types
  getAllGivingTypes: () => Array<{ id: string; name: string; created_at: string }>;
  createGivingType: (givingType: { id: string; name: string }) => void;
  updateGivingType: (id: string, name: string) => void;
  deleteGivingType: (id: string) => void;
  // Networks
  getAllNetworks: () => Array<{ id: string; name: string; created_at: string }>;
  createNetwork: (network: { id: string; name: string }) => void;
  updateNetwork: (id: string, name: string) => void;
  deleteNetwork: (id: string) => void;
  // Resources
  getAllResources: () => Array<Resource>;
  createResource: (resource: Resource) => void;
  deleteResource: (id: string) => void;
  // Utility
  closeDatabase: () => void;
}

// Electron API types
export interface ElectronAPI {
  platform: string;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  unmaximize: () => Promise<void>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  toggleFullscreen: () => Promise<void>;
  isFullscreen: () => Promise<boolean>;
  printPage: (options?: PrintOptions) => Promise<boolean>;
  printToPDF: (options?: PDFOptions) => Promise<Uint8Array>;
  showPrintPreview: (options?: PrintPreviewOptions) => Promise<{ success: boolean }>;
  getPrinters: () => Promise<PrinterInfo[]>;
  showPrintDialog: (options?: PrintDialogOptions) => Promise<PrintDialogResult>;
  database: DatabaseAPI;
  on: (channel: string, callback: (...args: any[]) => void) => void;
  removeAllListeners: (channel: string) => void;
}

export interface PrintOptions {
  silent?: boolean;
  printBackground?: boolean;
  color?: boolean;
  margins?: 'default' | 'none' | 'minimal' | 'custom';
  landscape?: boolean;
  pagesPerSheet?: number;
  collate?: boolean;
  copies?: number;
  pageSize?: 'A3' | 'A4' | 'A5' | 'Legal' | 'Letter' | 'Tabloid';
  scaleFactor?: number;
}

export interface PDFOptions {
  marginsType?: number;
  printBackground?: boolean;
  printSelectionOnly?: boolean;
  landscape?: boolean;
  pageSize?: 'A3' | 'A4' | 'A5' | 'Legal' | 'Letter' | 'Tabloid';
  scaleFactor?: number;
}

export interface PrintPreviewOptions {
  landscape?: boolean;
  pageSize?: 'A3' | 'A4' | 'A5' | 'Legal' | 'Letter' | 'Tabloid';
}

export interface PrinterInfo {
  name: string;
  displayName: string;
  description: string;
  status: number;
  isDefault: boolean;
  options: Record<string, any>;
}

export interface PrintDialogOptions {
  title?: string;
  message?: string;
  detail?: string;
}

export interface PrintDialogResult {
  action: 'print' | 'preview' | 'cancel';
  buttonIndex: number;
}

// Extend the global Window interface
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
