const members = [
  {
    id: 'm1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    joinDate: '2023-01-15',
    avatarUrl: '',
    address: '123 Main St, City, State',
    network: 'Main'
  },
  {
    id: 'm2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1234567891',
    joinDate: '2023-02-20',
    avatarUrl: '',
    address: '456 Oak Ave, City, State',
    network: 'Youth'
  },
  {
    id: 'm3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '+1234567892',
    joinDate: '2023-03-10',
    avatarUrl: '',
    address: '789 Pine Rd, City, State',
    network: 'Couples'
  }
];

const events = [
  {
    id: 'e1',
    title: 'Sunday Service',
    date: new Date('2024-01-07'),
    description: 'Weekly Sunday service',
    resource: 'Main Hall'
  },
  {
    id: 'e2',
    title: 'Youth Meeting',
    date: new Date('2024-01-10'),
    description: 'Weekly youth gathering',
    resource: 'Community Room'
  }
];

const donations = [
  {
    id: 'd1',
    donorName: 'John Doe',
    memberId: 'm1',
    amount: 100,
    date: '2024-01-07',
    category: 'Tithes',
    givingTypeId: 'gt1',
    serviceTime: 'st1',
    recordedById: 'u1',
    reference: 'REF001'
  },
  {
    id: 'd2',
    donorName: 'Jane Smith',
    memberId: 'm2',
    amount: 50,
    date: '2024-01-07',
    category: 'Offerings',
    givingTypeId: 'gt2',
    serviceTime: 'st1',
    recordedById: 'u1',
    reference: 'REF002'
  }
];

const expenses = [
  {
    id: 'ex1',
    description: 'Office Supplies',
    amount: 150,
    date: '2024-01-05',
    category: 'Office',
    recordedById: 'u1'
  },
  {
    id: 'ex2',
    description: 'Utility Bills',
    amount: 200,
    date: '2024-01-01',
    category: 'Utilities',
    recordedById: 'u1'
  }
];

const users = [
  {
    id: 'u1',
    name: 'Admin User',
    username: 'admin',
    role: 'Admin',
    password: 'admin123',
    permissions: {
      dashboard: true,
      members: true,
      donations: true,
      expenses: true,
      events: true,
      reports: true,
      users: true,
      settings: true
    }
  },
  {
    id: 'u2',
    name: 'Staff User',
    username: 'staff',
    role: 'Staff',
    password: 'staff123',
    permissions: {
      dashboard: true,
      members: true,
      donations: true,
      expenses: true,
      events: true,
      reports: false,
      users: false,
      settings: true
    }
  }
];

const donationCategories = [
  'Tithes',
  'Offerings',
  'Special Projects',
  'Missions'
];

const expenseCategories = [
  'Office',
  'Utilities',
  'Maintenance',
  'Events',
  'Missions'
];

const serviceTimes = [
  '9:00 AM',
  '11:00 AM',
  '6:00 PM'
];

const givingTypes = [
  'Cash',
  'Check',
  'Online',
  'Bank Transfer'
];

module.exports = {
  members,
  events,
  donations,
  expenses,
  users,
  donationCategories,
  expenseCategories,
  serviceTimes,
  givingTypes
};
