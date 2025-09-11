const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const moment = require('moment');

// Import models
const User = require('./src/models/User');
const Department = require('./src/models/Department');
const LeaveType = require('./src/models/LeaveType');
const LeaveRequest = require('./src/models/LeaveRequest');
const UserLeaveBalance = require('./src/models/UserLeaveBalance');
const Holiday = require('./src/models/Holiday');
const Notification = require('./src/models/Notification');
const FAQ = require('./src/models/FAQ');
const SupportRequest = require('./src/models/SupportRequest');

require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createDummyData = async () => {
  try {
    console.log('🚀 Starting to create dummy data...\n');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Department.deleteMany({});
    await LeaveType.deleteMany({});
    await LeaveRequest.deleteMany({});
    await UserLeaveBalance.deleteMany({});
    await Holiday.deleteMany({});
    await Notification.deleteMany({});
    await FAQ.deleteMany({});
    await SupportRequest.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // 1. Create Departments
    console.log('🏢 Creating departments...');
    const departments = [
      {
        name: 'Information Technology',
        nameAr: 'تقنية المعلومات',
        description: 'IT Department handling all technical operations',
        isActive: true,
        employeeCount: 0
      },
      {
        name: 'Human Resources',
        nameAr: 'الموارد البشرية',
        description: 'HR Department managing personnel',
        isActive: true,
        employeeCount: 0
      },
      {
        name: 'Marketing',
        nameAr: 'التسويق',
        description: 'Marketing and sales operations',
        isActive: true,
        employeeCount: 0
      },
      {
        name: 'Finance',
        nameAr: 'المالية',
        description: 'Financial operations and accounting',
        isActive: true,
        employeeCount: 0
      },
      {
        name: 'Operations',
        nameAr: 'العمليات',
        description: 'General operations and management',
        isActive: true,
        employeeCount: 0
      }
    ];

    const createdDepartments = await Department.insertMany(departments);
    console.log(`✅ Created ${createdDepartments.length} departments\n`);

    // 2. Create Leave Types
    console.log('📋 Creating leave types...');
    const leaveTypes = [
      {
        name: 'Annual Leave',
        nameAr: 'إجازة سنوية',
        description: 'Regular annual leave for employees',
        color: '#28a745',
        category: 'annual',
        requiresApproval: true,
        maxDays: 30,
        minDays: 1,
        isActive: true,
        isPaid: true,
        canBePartial: false,
        requiresDocumentation: false,
        advanceNoticeDays: 7,
        maxConsecutiveDays: 30,
        allowedRoles: ['employee', 'head_of_department', 'manager', 'admin', 'superadmin'],
        priority: 1,
        icon: 'calendar'
      },
      {
        name: 'Sick Leave',
        nameAr: 'إجازة مرضية',
        description: 'Medical leave for health reasons',
        color: '#dc3545',
        category: 'sick',
        requiresApproval: false,
        maxDays: 15,
        minDays: 1,
        isActive: true,
        isPaid: true,
        canBePartial: false,
        requiresDocumentation: true,
        advanceNoticeDays: 0,
        maxConsecutiveDays: 15,
        allowedRoles: ['employee', 'head_of_department', 'manager', 'admin', 'superadmin'],
        priority: 2,
        icon: 'medical'
      },
      {
        name: 'Emergency Leave',
        nameAr: 'إجازة طارئة',
        description: 'Emergency leave for urgent situations',
        color: '#ffc107',
        category: 'emergency',
        requiresApproval: false,
        maxDays: 5,
        minDays: 1,
        isActive: true,
        isPaid: true,
        canBePartial: false,
        requiresDocumentation: false,
        advanceNoticeDays: 0,
        maxConsecutiveDays: 5,
        allowedRoles: ['employee', 'head_of_department', 'manager', 'admin', 'superadmin'],
        priority: 3,
        icon: 'emergency'
      },
      {
        name: 'Unpaid Leave',
        nameAr: 'إجازة بدون راتب',
        description: 'Leave without pay',
        color: '#6c757d',
        category: 'unpaid',
        requiresApproval: true,
        maxDays: 90,
        minDays: 1,
        isActive: true,
        isPaid: false,
        canBePartial: false,
        requiresDocumentation: false,
        advanceNoticeDays: 14,
        maxConsecutiveDays: 90,
        allowedRoles: ['employee', 'head_of_department', 'manager', 'admin', 'superadmin'],
        priority: 4,
        icon: 'unpaid'
      }
    ];

    const createdLeaveTypes = await LeaveType.insertMany(leaveTypes);
    console.log(`✅ Created ${createdLeaveTypes.length} leave types\n`);

    // 3. Create Users
    console.log('👥 Creating users...');
    const users = [
      // SuperAdmin
      {
        employeeNumber: 'SA001',
        username: 'superadmin',
        email: 'superadmin@company.com',
        password: 'admin123',
        fullName: 'Super Administrator',
        department: 'Information Technology',
        phone: '+1234567890',
        role: 'superadmin',
        joinDate: new Date('2020-01-01'),
        isActive: true
      },
      // Admin
      {
        employeeNumber: 'AD001',
        username: 'admin',
        email: 'admin@company.com',
        password: 'admin123',
        fullName: 'System Administrator',
        department: 'Information Technology',
        phone: '+1234567891',
        role: 'admin',
        joinDate: new Date('2021-01-01'),
        isActive: true
      },
      // Head of Departments
      {
        employeeNumber: 'HD001',
        username: 'it_head',
        email: 'it.head@company.com',
        password: 'password123',
        fullName: 'IT Department Head',
        department: 'Information Technology',
        phone: '+1234567892',
        role: 'head_of_department',
        joinDate: new Date('2021-03-01'),
        isActive: true
      },
      {
        employeeNumber: 'HD002',
        username: 'hr_head',
        email: 'hr.head@company.com',
        password: 'password123',
        fullName: 'HR Department Head',
        department: 'Human Resources',
        phone: '+1234567893',
        role: 'head_of_department',
        joinDate: new Date('2021-02-01'),
        isActive: true
      },
      {
        employeeNumber: 'HD003',
        username: 'marketing_head',
        email: 'marketing.head@company.com',
        password: 'password123',
        fullName: 'Marketing Department Head',
        department: 'Marketing',
        phone: '+1234567894',
        role: 'head_of_department',
        joinDate: new Date('2021-04-01'),
        isActive: true
      },
      // Managers
      {
        employeeNumber: 'MG001',
        username: 'it_manager',
        email: 'it.manager@company.com',
        password: 'password123',
        fullName: 'IT Manager',
        department: 'Information Technology',
        phone: '+1234567895',
        role: 'manager',
        joinDate: new Date('2021-06-01'),
        isActive: true
      },
      {
        employeeNumber: 'MG002',
        username: 'hr_manager',
        email: 'hr.manager@company.com',
        password: 'password123',
        fullName: 'HR Manager',
        department: 'Human Resources',
        phone: '+1234567896',
        role: 'manager',
        joinDate: new Date('2021-05-01'),
        isActive: true
      },
      // Employees
      {
        employeeNumber: 'EMP001',
        username: 'john_doe',
        email: 'john.doe@company.com',
        password: 'password123',
        fullName: 'John Doe',
        department: 'Information Technology',
        phone: '+1234567897',
        role: 'employee',
        joinDate: new Date('2022-01-01'),
        isActive: true
      },
      {
        employeeNumber: 'EMP002',
        username: 'jane_smith',
        email: 'jane.smith@company.com',
        password: 'password123',
        fullName: 'Jane Smith',
        department: 'Human Resources',
        phone: '+1234567898',
        role: 'employee',
        joinDate: new Date('2022-02-01'),
        isActive: true
      },
      {
        employeeNumber: 'EMP003',
        username: 'mike_johnson',
        email: 'mike.johnson@company.com',
        password: 'password123',
        fullName: 'Mike Johnson',
        department: 'Marketing',
        phone: '+1234567899',
        role: 'employee',
        joinDate: new Date('2022-03-01'),
        isActive: true
      },
      {
        employeeNumber: 'EMP004',
        username: 'sarah_wilson',
        email: 'sarah.wilson@company.com',
        password: 'password123',
        fullName: 'Sarah Wilson',
        department: 'Finance',
        phone: '+1234567900',
        role: 'employee',
        joinDate: new Date('2022-04-01'),
        isActive: true
      },
      {
        employeeNumber: 'EMP005',
        username: 'david_brown',
        email: 'david.brown@company.com',
        password: 'password123',
        fullName: 'David Brown',
        department: 'Operations',
        phone: '+1234567901',
        role: 'employee',
        joinDate: new Date('2022-05-01'),
        isActive: true
      },
      {
        employeeNumber: 'EMP006',
        username: 'lisa_davis',
        email: 'lisa.davis@company.com',
        password: 'password123',
        fullName: 'Lisa Davis',
        department: 'Information Technology',
        phone: '+1234567902',
        role: 'employee',
        joinDate: new Date('2022-06-01'),
        isActive: true
      },
      {
        employeeNumber: 'EMP007',
        username: 'robert_miller',
        email: 'robert.miller@company.com',
        password: 'password123',
        fullName: 'Robert Miller',
        department: 'Marketing',
        phone: '+1234567903',
        role: 'employee',
        joinDate: new Date('2022-07-01'),
        isActive: true
      },
      {
        employeeNumber: 'EMP008',
        username: 'emma_garcia',
        email: 'emma.garcia@company.com',
        password: 'password123',
        fullName: 'Emma Garcia',
        department: 'Human Resources',
        phone: '+1234567904',
        role: 'employee',
        joinDate: new Date('2022-08-01'),
        isActive: true
      }
    ];

    // Hash passwords and create users
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12)
      }))
    );

    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✅ Created ${createdUsers.length} users\n`);

    // 4. Create User Leave Balances
    console.log('💰 Creating user leave balances...');
    const currentYear = new Date().getFullYear();
    const leaveBalances = [];

    for (const user of createdUsers) {
      if (user.role === 'employee') {
        leaveBalances.push({
          userId: user._id,
          year: currentYear,
          annualLeaveDays: 30,
          sickLeaveDays: 15,
          emergencyLeaveDays: 5,
          usedAnnualLeave: Math.floor(Math.random() * 10),
          usedSickLeave: Math.floor(Math.random() * 5),
          usedEmergencyLeave: Math.floor(Math.random() * 2)
        });
      }
    }

    await UserLeaveBalance.insertMany(leaveBalances);
    console.log(`✅ Created ${leaveBalances.length} leave balances\n`);

    // 5. Create Leave Requests
    console.log('📝 Creating leave requests...');
    const leaveRequests = [
      {
        userId: createdUsers.find(u => u.username === 'john_doe')._id,
        leaveTypeId: createdLeaveTypes.find(lt => lt.category === 'annual')._id,
        startDate: new Date('2025-09-15'),
        endDate: new Date('2025-09-17'),
        reason: 'Family vacation to Dubai',
        status: 'pending',
        submittedAt: new Date('2025-08-15')
      },
      {
        userId: createdUsers.find(u => u.username === 'jane_smith')._id,
        leaveTypeId: createdLeaveTypes.find(lt => lt.category === 'sick')._id,
        startDate: new Date('2025-08-20'),
        endDate: new Date('2025-08-20'),
        reason: 'Medical appointment for annual checkup',
        status: 'approved',
        submittedAt: new Date('2025-08-18'),
        processedAt: new Date('2025-08-19'),
        processedBy: createdUsers.find(u => u.username === 'hr_head')._id
      },
      {
        userId: createdUsers.find(u => u.username === 'mike_johnson')._id,
        leaveTypeId: createdLeaveTypes.find(lt => lt.category === 'annual')._id,
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-10-05'),
        reason: 'Summer vacation with family',
        status: 'pending',
        submittedAt: new Date('2025-08-10')
      },
      {
        userId: createdUsers.find(u => u.username === 'sarah_wilson')._id,
        leaveTypeId: createdLeaveTypes.find(lt => lt.category === 'emergency')._id,
        startDate: new Date('2025-08-25'),
        endDate: new Date('2025-08-25'),
        reason: 'Emergency family situation',
        status: 'approved',
        submittedAt: new Date('2025-08-24'),
        processedAt: new Date('2025-08-24'),
        processedBy: createdUsers.find(u => u.username === 'hr_head')._id
      },
      {
        userId: createdUsers.find(u => u.username === 'david_brown')._id,
        leaveTypeId: createdLeaveTypes.find(lt => lt.category === 'unpaid')._id,
        startDate: new Date('2025-11-01'),
        endDate: new Date('2025-11-10'),
        reason: 'Personal development course',
        status: 'pending',
        submittedAt: new Date('2025-08-20')
      }
    ];

    await LeaveRequest.insertMany(leaveRequests);
    console.log(`✅ Created ${leaveRequests.length} leave requests\n`);

    // 6. Create Holidays
    console.log('🎉 Creating holidays...');
    const holidays = [
      {
        name: 'New Year',
        nameAr: 'رأس السنة',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-01'),
        isRecurring: true,
        category: 'national',
        isActive: true
      },
      {
        name: 'Eid Al-Fitr',
        nameAr: 'عيد الفطر',
        startDate: new Date('2025-03-30'),
        endDate: new Date('2025-04-02'),
        isRecurring: false,
        category: 'religious',
        isActive: true
      },
      {
        name: 'Eid Al-Adha',
        nameAr: 'عيد الأضحى',
        startDate: new Date('2025-06-07'),
        endDate: new Date('2025-06-10'),
        isRecurring: false,
        category: 'religious',
        isActive: true
      },
      {
        name: 'National Day',
        nameAr: 'اليوم الوطني',
        startDate: new Date('2025-09-23'),
        endDate: new Date('2025-09-23'),
        isRecurring: true,
        category: 'national',
        isActive: true
      },
      {
        name: 'Company Anniversary',
        nameAr: 'ذكرى تأسيس الشركة',
        startDate: new Date('2025-12-15'),
        endDate: new Date('2025-12-15'),
        isRecurring: true,
        category: 'company',
        isActive: true
      }
    ];

    await Holiday.insertMany(holidays);
    console.log(`✅ Created ${holidays.length} holidays\n`);

    // 7. Create Notifications
    console.log('🔔 Creating notifications...');
    const notifications = [
      {
        userId: createdUsers.find(u => u.username === 'john_doe')._id,
        title: 'Leave Request Submitted',
        message: 'Your leave request for September 15-17 has been submitted successfully.',
        type: 'leave_request',
        isRead: false,
        priority: 'medium'
      },
      {
        userId: createdUsers.find(u => u.username === 'jane_smith')._id,
        title: 'Leave Request Approved',
        message: 'Your sick leave request for August 20 has been approved.',
        type: 'leave_approval',
        isRead: false,
        priority: 'high'
      },
      {
        userId: createdUsers.find(u => u.username === 'it_head')._id,
        title: 'New Leave Request',
        message: 'John Doe has submitted a leave request that requires your approval.',
        type: 'approval_required',
        isRead: false,
        priority: 'high'
      }
    ];

    await Notification.insertMany(notifications);
    console.log(`✅ Created ${notifications.length} notifications\n`);

    // 8. Create FAQs
    console.log('❓ Creating FAQs...');
    const faqs = [
      {
        question: 'How do I submit a leave request?',
        questionAr: 'كيف أقدم طلب إجازة؟',
        answer: 'You can submit a leave request through the leave management system by filling out the leave request form.',
        answerAr: 'يمكنك تقديم طلب إجازة من خلال نظام إدارة الإجازات عن طريق ملء نموذج طلب الإجازة.',
        category: 'leave_requests',
        isActive: true
      },
      {
        question: 'How many annual leave days do I have?',
        questionAr: 'كم يوم إجازة سنوية لدي؟',
        answer: 'Full-time employees are entitled to 30 days of annual leave per year.',
        answerAr: 'الموظفون بدوام كامل يحق لهم 30 يوم إجازة سنوية في السنة.',
        category: 'leave_balance',
        isActive: true
      },
      {
        question: 'How long does leave approval take?',
        questionAr: 'كم من الوقت يستغرق موافقة الإجازة؟',
        answer: 'Leave requests are typically processed within 2-3 business days.',
        answerAr: 'يتم معالجة طلبات الإجازة عادة خلال 2-3 أيام عمل.',
        category: 'leave_approval',
        isActive: true
      }
    ];

    await FAQ.insertMany(faqs);
    console.log(`✅ Created ${faqs.length} FAQs\n`);

    // 9. Create Support Requests
    console.log('🆘 Creating support requests...');
    const supportRequests = [
      {
        userId: createdUsers.find(u => u.username === 'john_doe')._id,
        subject: 'Cannot submit leave request',
        subjectAr: 'لا يمكن تقديم طلب إجازة',
        description: 'I am unable to submit my leave request through the system. Getting an error message.',
        descriptionAr: 'لا أستطيع تقديم طلب إجازتي من خلال النظام. أحصل على رسالة خطأ.',
        category: 'technical_issue',
        status: 'open',
        priority: 'medium'
      },
      {
        userId: createdUsers.find(u => u.username === 'jane_smith')._id,
        subject: 'Leave balance incorrect',
        subjectAr: 'رصيد الإجازة غير صحيح',
        description: 'My leave balance shows incorrect number of days remaining.',
        descriptionAr: 'رصيد إجازتي يظهر عدد أيام غير صحيح متبقي.',
        category: 'leave_balance',
        status: 'in_progress',
        priority: 'high'
      }
    ];

    await SupportRequest.insertMany(supportRequests);
    console.log(`✅ Created ${supportRequests.length} support requests\n`);

    // Update department employee counts
    console.log('📊 Updating department employee counts...');
    for (const dept of createdDepartments) {
      const count = await User.countDocuments({ 
        department: dept.name, 
        isActive: true 
      });
      await Department.findByIdAndUpdate(dept._id, { employeeCount: count });
    }
    console.log('✅ Department employee counts updated\n');

    console.log('🎉 All dummy data created successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • ${createdDepartments.length} departments`);
    console.log(`   • ${createdLeaveTypes.length} leave types`);
    console.log(`   • ${createdUsers.length} users`);
    console.log(`   • ${leaveBalances.length} leave balances`);
    console.log(`   • ${leaveRequests.length} leave requests`);
    console.log(`   • ${holidays.length} holidays`);
    console.log(`   • ${notifications.length} notifications`);
    console.log(`   • ${faqs.length} FAQs`);
    console.log(`   • ${supportRequests.length} support requests`);

    console.log('\n🔑 Test Credentials:');
    console.log('   • SuperAdmin: superadmin / admin123');
    console.log('   • Admin: admin / admin123');
    console.log('   • IT Head: it_head / password123');
    console.log('   • Employee: john_doe / password123');

  } catch (error) {
    console.error('❌ Error creating dummy data:', error);
  }
};

const main = async () => {
  await connectDB();
  await createDummyData();
  mongoose.connection.close();
  console.log('\n🔌 Database connection closed.');
};

main();

