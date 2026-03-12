import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

// Simulate the logic in database.ts
const useSQLite = process.env.FORCE_SQLITE === 'true' || process.env.ELECTRON === 'true' || (!process.env.DATABASE_URL && process.env.FORCE_MYSQL !== 'true');
const useMySQL = !useSQLite && (!!process.env.DATABASE_URL || process.env.FORCE_MYSQL === 'true');
const isElectron = useSQLite;

console.log('--- Database Config Diagnostic (SIMULATED) ---');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'PRESENT' : 'MISSING');
console.log('FORCE_MYSQL:', process.env.FORCE_MYSQL);
console.log('FORCE_SQLITE:', process.env.FORCE_SQLITE);
console.log('ELECTRON:', process.env.ELECTRON);
console.log('----------------------------------');
console.log('useSQLite:', useSQLite);
console.log('useMySQL:', useMySQL);
console.log('isElectron:', isElectron);
console.log('----------------------------------');

if (isElectron) {
    console.log('Result: Using SQLite (SUCCESS)');
} else {
    console.log('Result: Using MySQL (FAILURE)');
}
