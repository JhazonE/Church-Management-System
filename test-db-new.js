const { getSettings, getDbStatus } = require('./src/lib/database');

async function test() {
  console.log('Testing database initialization...');
  console.log('Initial Status:', getDbStatus());
  
  try {
    const settings = await getSettings();
    console.log('Successfully fetched settings:', settings);
    console.log('Final Status:', getDbStatus());
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
