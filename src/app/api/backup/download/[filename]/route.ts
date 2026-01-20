import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BACKUP_DIR = path.join(process.cwd(), 'backups');

// GET /api/backup/download/[filename] - Download backup files
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (!filename) {
    return NextResponse.json(
      { success: false, message: 'Filename is required' },
      { status: 400 }
    );
  }

  try {
    // Validate filename (prevent directory traversal)
    const sanitizedFilename = path.basename(filename);
    if (sanitizedFilename !== filename || !filename.startsWith('backup-')) {
      return NextResponse.json(
        { success: false, message: 'Invalid filename' },
        { status: 400 }
      );
    }

    const filePath = path.join(BACKUP_DIR, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: 'Backup file not found' },
        { status: 404 }
      );
    }

    // Read and serve the file
    const fileBuffer = fs.readFileSync(filePath);
    const fileStats = fs.statSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': filename.endsWith('.sql')
          ? 'application/sql'
          : filename.endsWith('.db')
          ? 'application/octet-stream'
          : 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileStats.size.toString(),
      },
    });
  } catch (error) {
    console.error('Error downloading backup file:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to download backup file' },
      { status: 500 }
    );
  }
}
