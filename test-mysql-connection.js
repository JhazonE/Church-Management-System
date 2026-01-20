import { getAllUsers, getSettings } from './src/lib/database.ts';

async function testConnection() {
  try {
    console.log('Testing MySQL database connection...');

    // Test getting all users
    const users = await getAllUsers();
    console.log('Database connection successful!');
    console.log('Users in database:', users.length);

    // Test getting settings
    const settings = await getSettings();
    console.log('Settings retrieved successfully:', settings);

  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
