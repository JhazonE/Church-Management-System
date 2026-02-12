import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getDbStatus } from '@/lib/database';

export async function GET(request: NextRequest) {
  const dbStatus = getDbStatus();
  const userData = {
    cwd: process.cwd(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      ELECTRON: process.env.ELECTRON,
      FORCE_SQLITE: process.env.FORCE_SQLITE,
      FORCE_MYSQL: process.env.FORCE_MYSQL,
      DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set',
      SQLITE_DB_PATH: process.env.SQLITE_DB_PATH || 'not set'
    },
    dbStatus,
    files: {
      'data/database.sqlite': fs.existsSync(path.join(process.cwd(), 'data', 'database.sqlite')),
      '.env.local': fs.existsSync(path.join(process.cwd(), '.env.local'))
    },
    platform: process.platform,
    arch: process.arch,
    version: process.version
  };

  // Test loading better-sqlite3
  let sqliteLoadable = false;
  let sqliteError = null;
  try {
    // We use require to see if it even loads in this environment
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    require('better-sqlite3');
    sqliteLoadable = true;
  } catch (e: any) {
    sqliteError = {
      message: e.message,
      stack: e.stack,
      code: e.code
    };
  }

  return NextResponse.json({
    ...userData,
    sqliteLoadable,
    sqliteError
  });
}
