const { getUserByUsername } = require('./src/lib/database.js');
const bcrypt = require('bcrypt');

async function testAuth() {
  try {
    console.log('Testing getUserByUsername...');
    const user = await getUserByUsername('admin');
    console.log('User found:', user ? { ...user, password: user.password ? '[HIDDEN]' : null } : 'null');

    if (user && user.password) {
      console.log('Password starts with $2:', user.password.startsWith('$2'));
      console.log('Password length:', user.password.length);
      const isValidPassword = user.password.startsWith('$2') ? await bcrypt.compare('admin123', user.password) : user.password === 'admin123';
      console.log('Password matches admin123:', isValidPassword);

      // Test wrong password
      const isValidWrong = user.password.startsWith('$2') ? await bcrypt.compare('wrong', user.password) : user.password === 'wrong';
      console.log('Wrong password test:', isValidWrong);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testAuth();
