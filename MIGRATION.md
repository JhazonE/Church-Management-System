# MySQL to SQLite Migration Guide

This guide explains how to migrate your Church Management System data from MySQL to SQLite for use with the Electron desktop application.

## Prerequisites

- Node.js installed
- MySQL database running with your data
- MySQL credentials configured in `.env.local`

## Migration Steps

### 1. Verify MySQL Connection

Ensure your `.env.local` file has the correct MySQL connection string:

```env
DATABASE_URL=mysql://clc_finance:123700@localhost:3306/clc_finance
```

### 2. Run the Migration Script

Execute the migration script from the project root:

```powershell
npm run migrate-to-sqlite
```

The script will:

- ✅ Connect to your MySQL database
- ✅ Create a backup of any existing SQLite database
- ✅ Initialize the SQLite schema
- ✅ Export all data from MySQL
- ✅ Convert data types (DATETIME → ISO strings, DECIMAL → numbers)
- ✅ Import data into SQLite
- ✅ Display a summary of migrated records

### 3. Verify Migration

After migration completes, check:

- SQLite database created at: `data/database.sqlite`
- Backup created at: `data/database.backup.[timestamp].sqlite`
- Migration summary shows all tables migrated successfully

## Tables Migrated

The following tables are migrated in order:

1. users
2. members
3. giving_types
4. donation_categories
5. expense_categories
6. service_times
7. networks
8. resources
9. events
10. donations
11. expenses
12. settings

## Testing the Electron App

### Development Mode

```powershell
npm run electron-dev
```

This will:

- Start Next.js dev server on port 9003
- Launch Electron app using SQLite database
- Enable hot reload for development

### Production Build

```powershell
npm run build-electron-win
```

This will:

- Build Next.js app for production
- Package Electron app with SQLite database
- Create installer in `dist-electron-new` directory

## Switching Between MySQL and SQLite

### Use MySQL (Web Deployment)

```env
FORCE_MYSQL=true
FORCE_SQLITE=false
```

### Use SQLite (Electron App)

```env
FORCE_MYSQL=false
FORCE_SQLITE=true
```

## Troubleshooting

### Migration Fails

1. **Connection Error**: Verify MySQL is running and credentials are correct
2. **Permission Error**: Ensure you have write permissions to the `data` directory
3. **Table Not Found**: Run the MySQL initialization script first

### Electron App Issues

1. **Database Not Found**: Run migration script first
2. **Data Not Persisting**: Check that `data` directory is not in `.gitignore` for packaged builds
3. **Schema Errors**: Delete `data/database.sqlite` and run migration again

## Database Location

- **Development**: `[project-root]/data/database.sqlite`
- **Production (Packaged)**: `[app-install-dir]/data/database.sqlite`

## Backup Strategy

The migration script automatically creates backups before overwriting. Manual backups can be created by copying the SQLite file:

```powershell
copy data\database.sqlite data\database.backup.sqlite
```

## Notes

- SQLite database is portable and can be copied between machines
- The `data` directory is excluded from git by default
- Migration can be run multiple times (creates backups each time)
- All foreign key relationships are preserved
