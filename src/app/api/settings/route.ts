import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/database';

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appName, logoUrl, theme, backupTime, backupEnabled } = body;

    // Validate required fields
    if (!appName || !logoUrl || !theme) {
      return NextResponse.json(
        { error: 'Missing required fields: appName, logoUrl, theme' },
        { status: 400 }
      );
    }

    // Validate theme
    if (!['light', 'dark'].includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme. Must be "light" or "dark"' },
        { status: 400 }
      );
    }

    // Validate backupTime format (HH:MM)
    if (backupTime && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(backupTime)) {
      return NextResponse.json(
        { error: 'Invalid backup time format. Must be HH:MM (e.g., 02:00)' },
        { status: 400 }
      );
    }

    // Validate backupEnabled
    if (backupEnabled !== undefined && typeof backupEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid backupEnabled. Must be a boolean' },
        { status: 400 }
      );
    }

    await updateSettings({ appName, logoUrl, theme, backupTime, backupEnabled });

    return NextResponse.json({ message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
