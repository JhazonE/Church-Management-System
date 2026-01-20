# CLC Finance Management System

A comprehensive church finance management system built with Next.js, React, and SQLite. Now available as both a web application and a desktop application using Electron.

## Features

- **User Management**: Admin and staff user roles with granular permissions
- **Member Management**: Track church members with detailed profiles
- **Event Management**: Schedule and manage church events
- **Donation Tracking**: Record and categorize donations with detailed reporting
- **Expense Management**: Track church expenses with categorization
- **Financial Reports**: Comprehensive reporting and analytics
- **System Administration**: Admin tools including system reset functionality
- **Data Backup**: Export data in various formats

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **Database**: SQLite with better-sqlite3
- **Authentication**: Custom authentication with bcrypt
- **Charts**: Recharts
- **PDF Generation**: jsPDF
- **Desktop**: Electron (optional)

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd clc-finance
```

2. Install dependencies:
```bash
npm install
```

3. Populate the database with sample data:
```bash
npm run populate-db
```

## Development

### Web Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:9002`

### Desktop Application (Electron)

#### Development Mode
Run the Electron app in development mode:
```bash
npm run electron-dev
```

This will start both the Next.js dev server and Electron concurrently.

#### Production Build
Build the Electron app for your platform:

```bash
# Build for current platform
npm run build-electron

# Build for Windows
npm run build-electron-win

# Build for macOS
npm run build-electron-mac

# Build for Linux
npm run build-electron-linux
```

The built application will be in the `dist-electron` directory.

#### Direct Electron Run
After building the web app, you can run Electron directly:
```bash
npm run electron
```

## Usage

### Default Login Credentials

- **Admin User**: username: `admin`, password: `password`
- **Staff User**: username: `staff`, password: `password`

### System Reset Feature

Administrators can reset all system data through the Users page. This feature:
- Requires admin authentication
- Provides a confirmation dialog with clear warnings
- Permanently deletes all member, event, donation, and expense data
- Preserves user accounts and system settings
- Includes proper error handling and user feedback

## Project Structure

```
├── electron/              # Electron main process and preload scripts
│   ├── main.js           # Main Electron process
│   └── preload.js        # Preload script for secure IPC
├── public/               # Static assets
├── scripts/              # Database setup and utility scripts
├── src/
│   ├── app/              # Next.js app router pages and API routes
│   │   ├── api/          # API endpoints
│   │   └── ...           # Page components
│   ├── components/       # Reusable UI components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and database
│   └── types.ts          # TypeScript type definitions
├── next.config.ts        # Next.js configuration
├── package.json          # Dependencies and scripts
└── tailwind.config.ts    # Tailwind CSS configuration
```

## API Endpoints

- `GET/POST/PUT/DELETE /api/users` - User management
- `GET/POST/PUT/DELETE /api/members` - Member management
- `GET/POST/PUT/DELETE /api/events` - Event management
- `GET/POST/PUT/DELETE /api/donations` - Donation management
- `GET/POST/PUT/DELETE /api/expenses` - Expense management
- `GET/POST /api/reports` - Report generation
- `POST /api/auth` - Authentication
- `GET/POST /api/backup` - Data backup and export
- `POST /api/reset` - System reset (admin only)

## Database Schema

The application uses SQLite with the following tables:
- `users` - User accounts and permissions
- `members` - Church member information
- `events` - Church events
- `donations` - Donation records
- `expenses` - Expense records

## Security Features

- Password hashing with bcrypt
- Role-based access control (Admin/Staff)
- Granular page-level permissions
- Secure API authentication
- Electron security best practices (context isolation, no node integration)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue on the GitHub repository.
