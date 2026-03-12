const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
const db = new Database(dbPath);

console.log('SQLite Database Verification\n');
console.log('='.repeat(50));
console.log(`Database: ${dbPath}\n`);

const tables = [
    'users',
    'members',
    'events',
    'donations',
    'expenses',
    'donation_categories',
    'expense_categories',
    'service_times',
    'giving_types',
    'networks',
    'settings'
];

let totalRows = 0;

tables.forEach(table => {
    try {
        const result = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
        console.log(`${table.padEnd(25)} - ${result.count} rows`);
        totalRows += result.count;
    } catch (error) {
        console.log(`${table.padEnd(25)} - ERROR: ${error.message}`);
    }
});

console.log('='.repeat(50));
console.log(`Total rows: ${totalRows}\n`);

// Show sample data from key tables
console.log('\nSample Data:\n');

console.log('Users:');
const users = db.prepare('SELECT id, name, username, role FROM users').all();
users.forEach(user => {
    console.log(`  - ${user.name} (${user.username}) - ${user.role}`);
});

console.log('\nMembers:');
const members = db.prepare('SELECT id, name, email, network FROM members LIMIT 5').all();
members.forEach(member => {
    console.log(`  - ${member.name} (${member.email}) - ${member.network}`);
});

console.log('\nDonations:');
const donations = db.prepare('SELECT donor_name, amount, date, category FROM donations').all();
donations.forEach(donation => {
    console.log(`  - ${donation.donor_name}: $${donation.amount} - ${donation.category} (${donation.date})`);
});

console.log('\n✓ Verification complete!');

db.close();
