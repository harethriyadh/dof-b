const mongoose = require('mongoose');
require('dotenv').config();

// Import the LeaveRequest model
const LeaveRequest = require('./models/LeaveRequest');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://unicn12012:12341234@dof.uspodzr.mongodb.net/?retryWrites=true&w=majority&appName=dof');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample data for generating varied requests
const employeeNames = [
  'أحمد محمد العلي', 'فاطمة عبدالله السالم', 'خالد أحمد القحطاني',
  'نورا سعد المطيري', 'عبدالرحمن فهد الشمري', 'ريم عبدالعزيز النعيمي',
  'محمد سالم الغامدي', 'هند خالد الزهراني', 'سعد عبدالله العتيبي',
  'مريم أحمد الحربي', 'عبدالله محمد الدوسري', 'نورا فهد القحطاني',
  'فهد سعد المطيري', 'لينا عبدالعزيز الشمري', 'عبدالرحمن خالد النعيمي',
  'سارة أحمد الغامدي', 'محمد فهد الزهراني', 'نورا سالم العتيبي',
  'خالد عبدالله الحربي', 'فاطمة محمد الدوسري', 'أحمد سعد القحطاني',
  'ريم فهد المطيري', 'عبدالرحمن عبدالعزيز الشمري', 'هند خالد النعيمي',
  'محمد أحمد الغامدي', 'نورا فهد الزهراني', 'سعد سالم العتيبي',
  'لينا عبدالله الحربي', 'عبدالرحمن محمد الدوسري', 'فاطمة سعد القحطاني'
];

const departments = [
  'قسم تقنية المعلومات', 'قسم الموارد البشرية', 'قسم المحاسبة',
  'قسم التسويق', 'قسم المبيعات', 'قسم الإنتاج',
  'قسم الجودة', 'قسم الصيانة', 'قسم الأمن',
  'قسم النقل', 'قسم التخزين', 'قسم المالية'
];

const colleges = [
  'كلية الهندسة', 'كلية الطب', 'كلية العلوم',
  'كلية إدارة الأعمال', 'كلية التربية', 'كلية الآداب',
  'كلية الحقوق', 'كلية الصيدلة', 'كلية التمريض',
  'كلية الحاسبات', 'كلية الزراعة', 'كلية العمارة'
];

const leaveTypes = [
  'Sickness leave', 'Day off', 'Educational leave',
  'Mirage leave', 'Maternity leave', 'Giving Birth',
  'Hajj & Umrah'
];

const reasons = [
  'مرض مفاجئ يحتاج راحة', 'رحلة عائلية مهمة', 'دورة تدريبية خارجية',
  'حالة طوارئ شخصية', 'رعاية أحد أفراد العائلة', 'مؤتمر علمي',
  'فحص طبي دوري', 'عطلة سنوية', 'حضور مناسبة عائلية',
  'استكمال إجراءات رسمية', 'رحلة عمل', 'تطوير مهارات شخصية',
  'راحة نفسية', 'زيارة طبيب متخصص', 'حضور ورشة عمل',
  'رحلة دينية', 'استكمال دراسات عليا', 'رعاية طفل مريض',
  'حضور اجتماع مهم', 'رحلة سياحية', 'فحص دوري للسيارة',
  'حضور حفل زفاف', 'زيارة الأهل', 'رحلة علاجية',
  'حضور ندوة علمية', 'رعاية والد مريض', 'رحلة استجمام',
  'حضور مؤتمر دولي', 'رعاية طفل حديث الولادة', 'رحلة علاج في الخارج'
];

const rejectionReasons = [
  'عدم وجود توثيق كافي', 'تضارب مع مواعيد مهمة', 'عدم إشعار مسبق كافي',
  'عدم وجود موظف بديل', 'تضارب مع مواعيد العمل', 'عدم استيفاء الشروط',
  'عدم وجود سبب مقنع', 'تضارب مع مواعيد أخرى', 'عدم وجود إثباتات',
  'تضارب مع سياسة الشركة', 'عدم وجود موافقة مسبقة', 'تضارب مع الموازنة'
];

const processedBy = [
  'أحمد محمد المدير', 'فاطمة عبدالله المشرفة', 'خالد أحمد المدير العام',
  'نورا سعد مدير الموارد البشرية', 'عبدالرحمن فهد المدير التنفيذي',
  'ريم عبدالعزيز مدير القسم', 'محمد سالم المشرف العام'
];

// Function to generate random date within a range
const getRandomDate = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
  return new Date(randomTime);
};

// Function to generate random date in the future
const getRandomFutureDate = (daysFromNow) => {
  const today = new Date();
  const futureDate = new Date(today.getTime() + (daysFromNow * 24 * 60 * 60 * 1000));
  return futureDate;
};

// Function to generate random date in the past
const getRandomPastDate = (daysAgo) => {
  const today = new Date();
  const pastDate = new Date(today.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  return pastDate;
};

// Function to generate leave requests
const generateLeaveRequests = () => {
  const requests = [];
  const statuses = ['pending', 'approved', 'rejected'];
  
  for (let i = 0; i < 30; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const employeeName = employeeNames[Math.floor(Math.random() * employeeNames.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];
    const leaveType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    
    // Generate dates based on status
    let requestDate, startDate, endDate, processingDate;
    
    if (status === 'pending') {
      // Pending requests: request date in past, start/end dates in future
      requestDate = getRandomPastDate(Math.floor(Math.random() * 30) + 1); // 1-30 days ago
      startDate = getRandomFutureDate(Math.floor(Math.random() * 60) + 1); // 1-60 days from now
      endDate = new Date(startDate.getTime() + (Math.floor(Math.random() * 14) + 1) * 24 * 60 * 60 * 1000); // 1-15 days duration
    } else {
      // Processed requests: all dates in past
      requestDate = getRandomPastDate(Math.floor(Math.random() * 90) + 1); // 1-90 days ago
      startDate = getRandomPastDate(Math.floor(Math.random() * 60) + 1); // 1-60 days ago
      endDate = new Date(startDate.getTime() + (Math.floor(Math.random() * 14) + 1) * 24 * 60 * 60 * 1000); // 1-15 days duration
      processingDate = new Date(requestDate.getTime() + (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000); // 1-7 days after request
    }
    
    const request = {
      request_date: requestDate,
      employee_name: employeeName,
      department: department,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason: Math.random() > 0.1 ? reason : null, // 90% chance of having reason
      status: status,
      user_id: `user_${String(i + 1).padStart(3, '0')}`, // Generate unique user IDs
      spare_employee_id: Math.random() > 0.5 ? `spare_${String(i + 1).padStart(3, '0')}` : null, // 50% chance of having spare employee
    };
    
    // Add processing details for processed requests
    if (status !== 'pending') {
      request.processing_date = processingDate;
      request.processed_by = processedBy[Math.floor(Math.random() * processedBy.length)];
      
      if (status === 'rejected') {
        request.reason_for_rejection = rejectionReasons[Math.floor(Math.random() * rejectionReasons.length)];
      }
    }
    
    requests.push(request);
  }
  
  return requests;
};

// Main function to create and insert requests
const createDummyRequests = async () => {
  try {
    await connectDB();
    
    // Clear existing requests (optional)
    console.log('Clearing existing leave requests...');
    await LeaveRequest.deleteMany({});
    
    // Generate requests
    console.log('Generating 30 dummy leave requests...');
    const requests = generateLeaveRequests();
    
    // Insert requests
    console.log('Inserting requests into database...');
    const insertedRequests = await LeaveRequest.insertMany(requests);
    
    console.log(`✅ Successfully created ${insertedRequests.length} leave requests!`);
    
    // Display summary
    const statusCounts = {
      pending: insertedRequests.filter(req => req.status === 'pending').length,
      approved: insertedRequests.filter(req => req.status === 'approved').length,
      rejected: insertedRequests.filter(req => req.status === 'rejected').length
    };
    
    console.log('\n📊 Status Summary:');
    console.log(`- Pending: ${statusCounts.pending}`);
    console.log(`- Approved: ${statusCounts.approved}`);
    console.log(`- Rejected: ${statusCounts.rejected}`);
    
    console.log('\n📋 Sample Requests:');
    insertedRequests.slice(0, 5).forEach((req, index) => {
      console.log(`${index + 1}. ${req.employee_name} - ${req.leave_type} - ${req.status} - ${req.number_of_days} days`);
    });
    
  } catch (error) {
    console.error('Error creating dummy requests:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the script
createDummyRequests();
