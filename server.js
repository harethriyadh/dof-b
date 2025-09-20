require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const holidayRoutes = require('./routes/holidays');
const leaveRequestRoutes = require('./routes/leaveRequests');
const leaveTypeRoutes = require('./routes/leaveTypes');
const leaveConsumptionRoutes = require('./routes/leaveConsumption');
const notificationRoutes = require('./routes/notifications');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/leave-requests', leaveRequestRoutes);
app.use('/api/leave-types', leaveTypeRoutes);
app.use('/api/leave-consumption', leaveConsumptionRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DOF Authentication API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
        updateProfile: 'PUT /api/auth/profile',
      },
      holidays: {
        getAll: 'GET /api/holidays',
        getById: 'GET /api/holidays/:id',
        create: 'POST /api/holidays (Admin)',
        update: 'PUT /api/holidays/:id (Admin)',
        delete: 'DELETE /api/holidays/:id (Admin)',
        check: 'GET /api/holidays/check/date?date=YYYY-MM-DD',
      },
      leaveRequests: {
        getAll: 'GET /api/leave-requests',
        getById: 'GET /api/leave-requests/:id',
        create: 'POST /api/leave-requests',
        update: 'PUT /api/leave-requests/:id',
        process: 'PATCH /api/leave-requests/:id/process (Admin/Manager)',
        delete: 'DELETE /api/leave-requests/:id',
      },
      leaveTypes: {
        getAll: 'GET /api/leave-types',
        getById: 'GET /api/leave-types/:id',
        create: 'POST /api/leave-types (Admin)',
        update: 'PUT /api/leave-types/:id (Admin)',
        delete: 'DELETE /api/leave-types/:id (Admin)',
      },
      leaveConsumption: {
        getAll: 'GET /api/leave-consumption',
        getById: 'GET /api/leave-consumption/:id',
        create: 'POST /api/leave-consumption (Admin/Manager)',
        update: 'PUT /api/leave-consumption/:id (Admin/Manager)',
        delete: 'DELETE /api/leave-consumption/:id (Admin/Manager)',
      },
      notifications: {
        getByUser: 'GET /api/notifications/user/:user_id',
        getById: 'GET /api/notifications/:id',
        create: 'POST /api/notifications (Admin/Manager)',
        markRead: 'PATCH /api/notifications/:id/read',
        markAllRead: 'PATCH /api/notifications/user/:user_id/read-all',
        update: 'PUT /api/notifications/:id (Admin/Manager)',
        delete: 'DELETE /api/notifications/:id (Admin/Manager)',
      },
      health: 'GET /health',
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API documentation: http://localhost:${PORT}/`);
});
