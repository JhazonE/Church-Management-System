const bcrypt = require('bcrypt');

async function testBcrypt() {
  try {
    const hash = '$2b$10$pEqyD3gsMWyuplAKw0UTO.opCNR3ApYVEkC5JzH.B5yaEGez2xAEO';
    const password = 'password';

    console.log('Testing bcrypt compare...');
    console.log('Hash:', hash);
    console.log('Password:', password);

    const isValid = await bcrypt.compare(password, hash);
    console.log('Is valid:', isValid);
  } catch (error) {
    console.error('Error:', error);
  }
}

testBcrypt();
