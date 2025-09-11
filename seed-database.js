const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./src/models/User');
const LeaveType = require('./src/models/LeaveType');
const Department = require('./src/models/Department');
const College = require('./src/models/College');
const UserLeaveBalance = require('./src/models/UserLeaveBalance');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await LeaveType.deleteMany({});
    await Department.deleteMany({});
    await College.deleteMany({});
    await UserLeaveBalance.deleteMany({});

    console.log('Cleared existing data');

    // Create colleges
    const colleges = await College.insertMany([
      { id: 1, name: 'Dentist' },
      { id: 2, name: 'Economic' }
    ]);
    console.log('Created colleges');

    // Create departments
    const departments = await Department.insertMany([
      { id: 1, name: 'Management', collegeId: 1 },
      { id: 2, name: 'Law', collegeId: 1 },
      { id: 3, name: 'IT', collegeId: 2 }
    ]);
    console.log('Created departments');

    // Create leave types
    const leaveTypes = await LeaveType.insertMany([
      { 
        id: 1, 
        name: 'Study', 
        description: 'From two weeks to two years, paid up to three weeks' 
      },
      { 
        id: 2, 
        name: 'Marriage', 
        description: 'Marriage leave with specific conditions' 
      },
      { 
        id: 3, 
        name: 'Sickness', 
        description: 'Sick leave with medical documentation required' 
      },
      { 
        id: 4, 
        name: 'Hajj/Umrah', 
        description: 'Religious pilgrimage leave' 
      },
      { 
        id: 5, 
        name: 'Day Off', 
        description: 'Personal day off with manager approval' 
      }
    ]);
    console.log('Created leave types');

    // Create users
    const users = await User.insertMany([
      {
        fullName: 'Super Admin User',
        username: 'admin',
        password: 'admin123',
        role: 'Super Admin',
        departmentId: 1,
        collegeId: 1
      },
      {
        fullName: 'Manager User',
        username: 'manager',
        password: 'manager123',
        role: 'Manager',
        departmentId: 1,
        collegeId: 1
      },
      {
        fullName: 'Head of Department User',
        username: 'head',
        password: 'head123',
        role: 'Head of Department',
        departmentId: 2,
        collegeId: 1
      },
      {
        fullName: 'Employee User',
        username: 'employee',
        password: 'employee123',
        role: 'Employee',
        departmentId: 3,
        collegeId: 2
      }
    ]);
    console.log('Created users');

    // Create leave balances for users
    const balances = [];
    for (const user of users) {
      for (const leaveType of leaveTypes) {
        balances.push({
          userId: user._id,
          leaveTypeId: leaveType.id,
          balance: Math.floor(Math.random() * 30) + 10, // Random balance between 10-40 days
          lastUpdated: new Date()
        });
      }
    }
    await UserLeaveBalance.insertMany(balances);
    console.log('Created leave balances');

    console.log('Database seeding completed successfully!');
    console.log('\nSample login credentials:');
    console.log('Super Admin: admin / admin123');
    console.log('Manager: manager / manager123');
    console.log('Head of Department: head / head123');
    console.log('Employee: employee / employee123');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
};

// Run seeding
connectDB().then(() => {
  seedData();
});
