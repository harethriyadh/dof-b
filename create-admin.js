const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import the User model
const User = require('./src/models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leave-management');
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('admin', salt);

    // Create admin user
    const adminUser = await User.create({
      employeeNumber: 'ADMIN001',
      username: 'admin',
      email: 'admin@company.com',
      password: hashedPassword,
      fullName: 'System Administrator',
      department: 'IT',
      phone: '+1234567890',
      role: 'superadmin',
      joinDate: new Date('2024-01-01'),
      isActive: true
    });

    console.log('Admin user created successfully:');
    console.log('Username: admin');
    console.log('Password: admin');
    console.log('Role: superadmin');
    console.log('User ID:', adminUser._id);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

createAdminUser();
