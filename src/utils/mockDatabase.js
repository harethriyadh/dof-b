// Simple in-memory database for development/testing
const bcrypt = require('bcryptjs');

class MockDatabase {
  constructor() {
    this.users = new Map();
    this.initializeTestUsers();
  }

  async initializeTestUsers() {
    // Create a test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    this.users.set('testuser', {
      _id: '507f1f77bcf86cd799439011',
      fullName: 'Test User',
      username: 'testuser',
      password: hashedPassword,
      role: 'Employee',
      departmentId: null,
      collegeId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create another test user
    const hashedPassword2 = await bcrypt.hash('admin123', 10);
    this.users.set('admin', {
      _id: '507f1f77bcf86cd799439012',
      fullName: 'Admin User',
      username: 'admin',
      password: hashedPassword2,
      role: 'Super Admin',
      departmentId: null,
      collegeId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  async findOne(query) {
    if (query.username) {
      return this.users.get(query.username) || null;
    }
    if (query._id) {
      for (let user of this.users.values()) {
        if (user._id === query._id) {
          return user;
        }
      }
    }
    return null;
  }

  async save(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = {
      _id: this.generateId(),
      fullName: userData.fullName,
      username: userData.username,
      password: hashedPassword,
      role: userData.role || 'Employee',
      departmentId: userData.departmentId || null,
      collegeId: userData.collegeId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.users.set(user.username, user);
    return user;
  }

  generateId() {
    return Math.random().toString(16).substr(2, 24);
  }

  // Method to compare password (similar to mongoose schema method)
  async comparePassword(username, candidatePassword) {
    const user = this.users.get(username);
    if (!user) return false;
    return bcrypt.compare(candidatePassword, user.password);
  }
}

// Create singleton instance
const mockDB = new MockDatabase();

module.exports = mockDB;
