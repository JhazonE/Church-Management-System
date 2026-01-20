const {
  getAllUsers,
  getUserByUsername,
  createUser,
  createMember,
  createEvent,
  createDonation,
  createExpense,
  createDonationCategory,
  createExpenseCategory,
  createServiceTime,
  createGivingType,
  createNetwork,
  closeDatabase
} = require('../src/lib/database.js');

const {
  members,
  events,
  donations,
  expenses,
  users,
  donationCategories,
  expenseCategories,
  serviceTimes,
  givingTypes
} = require('../src/lib/placeholder-data.js');

// Define networks data
const networks = ['Main', 'Youth', 'Couples', 'Singles', 'Kids'];

const insertEvents = async () => {
  for (const event of events) {
    // Format date to YYYY-MM-DD for MySQL DATETIME
    const eventDate = event.date.toISOString().slice(0, 10);
    try {
      await createEvent({
        id: event.id,
        title: event.title,
        date: eventDate,
        description: event.description,
        resource: event.resource
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log(`Event ${event.title} already exists, skipping...`);
        continue;
      }
      throw error;
    }
  }
};

const insertUsers = async () => {
  const bcrypt = await import('bcrypt');

  for (const user of users) {
    try {
      // Check if user already exists
      const existingUser = await getUserByUsername(user.username);
      if (existingUser) {
        console.log(`User ${user.username} already exists, skipping...`);
        continue;
      }

      // Hash password if it's plain text
      let hashedPassword = user.password;
      if (hashedPassword && !hashedPassword.startsWith('$2')) {
        hashedPassword = await bcrypt.hash(user.password, 10);
      }

      await createUser({
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        password: hashedPassword,
        permissions: user.permissions
      });
    } catch (error) {
      console.log(`Error creating user ${user.username}:`, error.message);
    }
  }
};

const insertMembers = async () => {
  for (const member of members) {
    // Check if member already exists (simple approach: try to create and catch duplicate)
    try {
      await createMember({
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        join_date: member.joinDate,
        avatar_url: member.avatarUrl,
        address: member.address,
        network: member.network
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log(`Member ${member.name} already exists, skipping...`);
        continue;
      }
      throw error;
    }
  }
};

const insertDonations = async () => {
  const today = new Date();
  const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM

  for (const donation of donations) {
    // If date is in current month, use current month, else keep original
    const donationDate = donation.date.startsWith(currentMonth) ? donation.date : currentMonth + donation.date.slice(7);
    await createDonation({
      id: donation.id,
      donor_name: donation.donorName,
      member_id: donation.memberId,
      amount: donation.amount,
      date: donationDate,
      category: donation.category,
      giving_type_id: donation.givingTypeId || null,
      service_time: donation.serviceTime,
      recorded_by_id: donation.recordedById,
      reference: donation.reference || null
    });
  }
};

const insertExpenses = async () => {
  for (const expense of expenses) {
    await createExpense({
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      category: expense.category,
      recorded_by_id: expense.recordedById
    });
  }
};

const insertDonationCategories = async () => {
  for (let index = 0; index < donationCategories.length; index++) {
    const id = `dc${index + 1}`;
    await createDonationCategory({
      id: id,
      name: donationCategories[index]
    });
  }
};

const insertExpenseCategories = async () => {
  for (let index = 0; index < expenseCategories.length; index++) {
    const id = `ec${index + 1}`;
    await createExpenseCategory({
      id: id,
      name: expenseCategories[index]
    });
  }
};

const insertServiceTimes = async () => {
  for (let index = 0; index < serviceTimes.length; index++) {
    const id = `st${index + 1}`;
    await createServiceTime({
      id: id,
      time: serviceTimes[index]
    });
  }
};

const insertGivingTypes = async () => {
  for (let index = 0; index < givingTypes.length; index++) {
    const id = `gt${index + 1}`;
    await createGivingType({
      id: id,
      name: givingTypes[index]
    });
  }
};

const insertNetworks = async () => {
  for (let index = 0; index < networks.length; index++) {
    const id = `n${index + 1}`;
    await createNetwork({
      id: id,
      name: networks[index]
    });
  }
};

const populateDatabase = async () => {
  console.log('Populating database with sample data...');

  await insertUsers();
  console.log('Users inserted.');

  await insertMembers();
  console.log('Members inserted.');

  await insertEvents();
  console.log('Events inserted.');

  await insertDonationCategories();
  console.log('Donation categories inserted.');

  await insertExpenseCategories();
  console.log('Expense categories inserted.');

  await insertServiceTimes();
  console.log('Service times inserted.');

  await insertGivingTypes();
  console.log('Giving types inserted.');

  await insertNetworks();
  console.log('Networks inserted.');

  await insertDonations();
  console.log('Donations inserted.');

  await insertExpenses();
  console.log('Expenses inserted.');

  console.log('Database populated successfully!');
};

// Run the population
populateDatabase().then(() => {
  // Close database
  closeDatabase();
});
