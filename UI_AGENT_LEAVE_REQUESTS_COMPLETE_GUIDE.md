# Complete Leave Requests Guide for UI Agent

## 🎯 **Overview**

This guide provides everything the UI agent needs to implement leave request functionality in the DOF (Department of Finance) system.

## 🔐 **Authentication**

**All leave request endpoints require authentication via JWT token.**

### **Required Header:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### **Getting JWT Token:**
1. **Login first:** `POST /api/auth/login`
2. **Extract token** from response: `response.data.token`
3. **Include token** in all leave request API calls

---

## 📋 **Available Endpoints**

### **Base URL:** `http://localhost:3000/api/leave-requests`

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/` | Get all leave requests | ✅ | Any |
| GET | `/:id` | Get specific leave request | ✅ | Any |
| POST | `/` | Create new leave request | ✅ | Any |
| PUT | `/:id` | Update leave request | ✅ | Any |
| PATCH | `/:id/process` | Approve/Reject request | ✅ | Admin/Manager |
| DELETE | `/:id` | Delete leave request | ✅ | Any |

---

## 🏷️ **Available Leave Types**

The system supports these 7 core leave types:

| Leave Type | Description | Max Days | Proof Required | Payment |
|------------|-------------|----------|----------------|---------|
| **Sickness leave** | Medical leave for illness/injury | 35/year | ✅ Yes | Paid |
| **Day off** | Monthly day off (accumulates) | 24/year | ❌ No | Paid |
| **Educational leave** | Courses, training, conferences | 15 paid, 16+ unpaid | ✅ Yes | Mixed |
| **Mirage leave** | 14 days, consumed at once | 14 | ✅ Yes | Paid |
| **Maternity leave** | 51 days, consumed at once | 51 | ✅ Yes | Paid |
| **Giving Birth** | 21 days, consumed at once | 21 | ✅ Yes | Paid |
| **Hajj & Umrah** | 20 days, consumed at once | 20 | ✅ Yes | Paid |

---

## 📝 **1. CREATE Leave Request**

### **Endpoint:** `POST /api/leave-requests`

### **Request Body:**
```json
{
  "employee_name": "John Doe",
  "department": "IT Department",
  "leave_type": "Sickness leave",
  "start_date": "2025-01-23",
  "end_date": "2025-01-25",
  "reason": "Medical appointment"
}
```

### **Field Details:**
- **employee_name** (string, required): Employee's full name
- **department** (string, required): Employee's department
- **leave_type** (string, required): One of the 7 leave types above
- **start_date** (string, required): Start date in YYYY-MM-DD format
- **end_date** (string, required): End date in YYYY-MM-DD format
- **reason** (string, optional): Reason for leave request

### **Important Notes:**
- ✅ **user_id** is automatically extracted from JWT token
- ✅ **number_of_days** is automatically calculated
- ✅ **request_no** is automatically generated
- ✅ **reason** field is optional (can be omitted)

### **Success Response (201):**
```json
{
  "success": true,
  "message": "Leave request created successfully",
  "data": {
    "request_no": "LR-1737624123456-abc123def",
    "request_date": "2025-01-23T10:42:12.120Z",
    "employee_name": "John Doe",
    "department": "IT Department",
    "leave_type": "Sickness leave",
    "start_date": "2025-01-23T00:00:00.000Z",
    "end_date": "2025-01-25T00:00:00.000Z",
    "number_of_days": 3,
    "reason": "Medical appointment",
    "status": "pending",
    "user_id": "68d1213568d5c6a122bf7047",
    "createdAt": "2025-01-23T10:42:12.120Z",
    "updatedAt": "2025-01-23T10:42:12.120Z"
  }
}
```

### **Error Responses:**

#### **Missing Required Fields (400):**
```json
{
  "success": false,
  "message": "Missing required fields",
  "required": ["employee_name", "department", "leave_type", "start_date", "end_date"]
}
```

#### **Invalid Date Format (400):**
```json
{
  "success": false,
  "message": "Invalid date format. Use ISO format (YYYY-MM-DD)",
  "example": "2025-01-23"
}
```

#### **End Date Before Start Date (400):**
```json
{
  "success": false,
  "message": "End date must be after start date"
}
```

---

## 📋 **2. GET All Leave Requests**

### **Endpoint:** `GET /api/leave-requests`

### **Query Parameters (Optional):**
- `status`: Filter by status (`pending`, `approved`, `rejected`)
- `user_id`: Filter by specific user
- `department`: Filter by department

### **Example Requests:**
```
GET /api/leave-requests
GET /api/leave-requests?status=pending
GET /api/leave-requests?department=IT Department
GET /api/leave-requests?status=approved&department=HR
```

### **Success Response (200):**
```json
{
  "success": true,
  "message": "Leave requests retrieved successfully",
  "data": [
    {
      "request_no": "LR-1737624123456-abc123def",
      "request_date": "2025-01-23T10:42:12.120Z",
      "employee_name": "John Doe",
      "department": "IT Department",
      "leave_type": "Sickness leave",
      "start_date": "2025-01-23T00:00:00.000Z",
      "end_date": "2025-01-25T00:00:00.000Z",
      "number_of_days": 3,
      "reason": "Medical appointment",
      "status": "pending",
      "user_id": "68d1213568d5c6a122bf7047",
      "createdAt": "2025-01-23T10:42:12.120Z",
      "updatedAt": "2025-01-23T10:42:12.120Z"
    }
  ],
  "meta": {
    "count": 1,
    "filter": {
      "status": "pending"
    },
    "query": {
      "status": "pending"
    }
  }
}
```

### **Enhanced Error Responses:**

#### **Invalid Status Value (400):**
```json
{
  "success": false,
  "message": "Invalid status value",
  "error": "Status must be one of: pending, approved, rejected",
  "received": "invalid_status",
  "validValues": ["pending", "approved", "rejected"]
}
```

#### **Invalid Query Parameter Format (400):**
```json
{
  "success": false,
  "message": "Invalid query parameter format",
  "error": "Cast to ObjectId failed for value \"invalid_id\" at path \"_id\"",
  "timestamp": "2025-01-23T10:42:12.120Z",
  "query": {
    "user_id": "invalid_id"
  },
  "user": "68d1213568d5c6a122bf7047",
  "details": {
    "field": "_id",
    "value": "invalid_id",
    "expectedType": "ObjectId"
  }
}
```

#### **Query Validation Failed (400):**
```json
{
  "success": false,
  "message": "Query validation failed",
  "error": "ValidationError",
  "timestamp": "2025-01-23T10:42:12.120Z",
  "query": {
    "status": "invalid"
  },
  "user": "68d1213568d5c6a122bf7047",
  "details": [
    {
      "field": "status",
      "message": "Status must be one of: pending, approved, rejected",
      "value": "invalid"
    }
  ]
}
```

#### **Database Connection Error (503):**
```json
{
  "success": false,
  "message": "Database connection error",
  "error": "MongoNetworkError: failed to connect to server",
  "timestamp": "2025-01-23T10:42:12.120Z",
  "query": {},
  "user": "68d1213568d5c6a122bf7047",
  "details": {
    "type": "MongoNetworkError",
    "message": "Unable to connect to database"
  }
}
```

#### **General Server Error (500):**
```json
{
  "success": false,
  "message": "Failed to retrieve leave requests",
  "error": "Unexpected error occurred",
  "timestamp": "2025-01-23T10:42:12.120Z",
  "query": {
    "status": "pending"
  },
  "user": "68d1213568d5c6a122bf7047",
  "stack": "Error: Unexpected error occurred\n    at getAllLeaveRequests (/path/to/controller.js:45:11)\n    ..."
}
```

---

## 🔍 **3. GET Specific Leave Request**

### **Endpoint:** `GET /api/leave-requests/:id`

### **Parameters:**
- `id`: The request_no of the leave request

### **Example:**
```
GET /api/leave-requests/LR-1737624123456-abc123def
```

### **Success Response (200):**
```json
{
  "success": true,
  "message": "Leave request retrieved successfully",
  "data": {
    "request_no": "LR-1737624123456-abc123def",
    "request_date": "2025-01-23T10:42:12.120Z",
    "employee_name": "John Doe",
    "department": "IT Department",
    "leave_type": "Sickness leave",
    "start_date": "2025-01-23T00:00:00.000Z",
    "end_date": "2025-01-25T00:00:00.000Z",
    "number_of_days": 3,
    "reason": "Medical appointment",
    "status": "pending",
    "user_id": "68d1213568d5c6a122bf7047",
    "createdAt": "2025-01-23T10:42:12.120Z",
    "updatedAt": "2025-01-23T10:42:12.120Z"
  }
}
```

### **Not Found Response (404):**
```json
{
  "success": false,
  "message": "Leave request not found"
}
```

---

## ✏️ **4. UPDATE Leave Request**

### **Endpoint:** `PUT /api/leave-requests/:id`

### **Request Body (All fields optional):**
```json
{
  "employee_name": "John Smith",
  "department": "HR Department",
  "leave_type": "Day off",
  "start_date": "2025-01-24",
  "end_date": "2025-01-26",
  "reason": "Updated reason"
}
```

### **Success Response (200):**
```json
{
  "success": true,
  "message": "Leave request updated successfully",
  "data": {
    "request_no": "LR-1737624123456-abc123def",
    "request_date": "2025-01-23T10:42:12.120Z",
    "employee_name": "John Smith",
    "department": "HR Department",
    "leave_type": "Day off",
    "start_date": "2025-01-24T00:00:00.000Z",
    "end_date": "2025-01-26T00:00:00.000Z",
    "number_of_days": 3,
    "reason": "Updated reason",
    "status": "pending",
    "user_id": "68d1213568d5c6a122bf7047",
    "createdAt": "2025-01-23T10:42:12.120Z",
    "updatedAt": "2025-01-23T10:42:12.120Z"
  }
}
```

---

## ✅ **5. PROCESS Leave Request (Approve/Reject)**

### **Endpoint:** `PATCH /api/leave-requests/:id/process`

### **Required Role:** Admin or Manager

### **Request Body:**
```json
{
  "status": "approved",
  "processed_by": "Manager Name",
  "reason_for_rejection": "Optional rejection reason"
}
```

### **Field Details:**
- **status** (string, required): `"approved"` or `"rejected"`
- **processed_by** (string, optional): Name of the person processing
- **reason_for_rejection** (string, optional): Required if status is "rejected"

### **Success Response (200):**
```json
{
  "success": true,
  "message": "Leave request approved successfully",
  "data": {
    "request_no": "LR-1737624123456-abc123def",
    "request_date": "2025-01-23T10:42:12.120Z",
    "employee_name": "John Doe",
    "department": "IT Department",
    "leave_type": "Sickness leave",
    "start_date": "2025-01-23T00:00:00.000Z",
    "end_date": "2025-01-25T00:00:00.000Z",
    "number_of_days": 3,
    "reason": "Medical appointment",
    "status": "approved",
    "processing_date": "2025-01-23T11:00:00.000Z",
    "processed_by": "Manager Name",
    "user_id": "68d1213568d5c6a122bf7047",
    "createdAt": "2025-01-23T10:42:12.120Z",
    "updatedAt": "2025-01-23T11:00:00.000Z"
  }
}
```

---

## 🗑️ **6. DELETE Leave Request**

### **Endpoint:** `DELETE /api/leave-requests/:id`

### **Success Response (200):**
```json
{
  "success": true,
  "message": "Leave request deleted successfully"
}
```

---

## 🎨 **UI Implementation Examples**

### **1. Create Leave Request Form**

```javascript
// Form submission handler
const submitLeaveRequest = async (formData) => {
  try {
    const response = await fetch('http://localhost:3000/api/leave-requests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        employee_name: formData.employeeName,
        department: formData.department,
        leave_type: formData.leaveType,
        start_date: formData.startDate,
        end_date: formData.endDate,
        reason: formData.reason || '' // Optional
      })
    });

    const result = await response.json();
    
    if (result.success) {
      // Show success message
      console.log('Leave request created:', result.data);
    } else {
      // Show error message
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

### **2. Fetch Leave Requests with Enhanced Error Handling**

```javascript
// Fetch all leave requests with detailed error handling
const fetchLeaveRequests = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`http://localhost:3000/api/leave-requests?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    const result = await response.json();
    
    if (result.success) {
      // Success response includes meta information
      console.log(`Found ${result.meta.count} leave requests`);
      console.log('Applied filter:', result.meta.filter);
      return {
        data: result.data,
        meta: result.meta
      };
    } else {
      // Enhanced error handling
      const errorInfo = {
        message: result.message,
        status: response.status,
        timestamp: result.timestamp,
        query: result.query,
        user: result.user
      };
      
      // Handle specific error types
      if (response.status === 400) {
        if (result.details) {
          errorInfo.details = result.details;
          errorInfo.type = 'Validation Error';
        } else if (result.validValues) {
          errorInfo.validValues = result.validValues;
          errorInfo.received = result.received;
          errorInfo.type = 'Invalid Parameter';
        }
      } else if (response.status === 503) {
        errorInfo.type = 'Database Connection Error';
        errorInfo.details = result.details;
      } else if (response.status === 500) {
        errorInfo.type = 'Server Error';
        if (result.stack) {
          errorInfo.stack = result.stack;
        }
      }
      
      console.error('API Error:', errorInfo);
      throw new Error(JSON.stringify(errorInfo));
    }
  } catch (error) {
    console.error('Network or parsing error:', error);
    throw error;
  }
};

// Usage examples with error handling:
try {
  const allRequests = await fetchLeaveRequests();
  console.log('All requests:', allRequests.data);
  console.log('Total count:', allRequests.meta.count);
} catch (error) {
  const errorInfo = JSON.parse(error.message);
  console.error('Failed to fetch requests:', errorInfo.message);
  
  // Handle specific error types
  if (errorInfo.type === 'Invalid Parameter') {
    console.error('Valid values:', errorInfo.validValues);
    console.error('Received:', errorInfo.received);
  } else if (errorInfo.type === 'Database Connection Error') {
    console.error('Database is unavailable, please try again later');
  }
}

// Filter examples with error handling:
try {
  const pendingRequests = await fetchLeaveRequests({ status: 'pending' });
  console.log('Pending requests:', pendingRequests.data);
} catch (error) {
  console.error('Error fetching pending requests:', error);
}

try {
  const departmentRequests = await fetchLeaveRequests({ department: 'IT Department' });
  console.log('IT Department requests:', departmentRequests.data);
} catch (error) {
  console.error('Error fetching department requests:', error);
}
```

### **3. Process Leave Request**

```javascript
// Approve or reject leave request
const processLeaveRequest = async (requestId, status, processedBy, rejectionReason = '') => {
  try {
    const response = await fetch(`http://localhost:3000/api/leave-requests/${requestId}/process`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: status,
        processed_by: processedBy,
        reason_for_rejection: rejectionReason
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`Leave request ${status}:`, result.data);
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Usage:
await processLeaveRequest('LR-123', 'approved', 'Manager Name');
await processLeaveRequest('LR-124', 'rejected', 'Manager Name', 'Insufficient documentation');
```

---

## 🚨 **Error Handling**

### **Common Error Scenarios:**

1. **Authentication Errors (401):**
   - Token missing or invalid
   - Solution: Re-login and get new token

2. **Authorization Errors (403):**
   - Insufficient permissions for process endpoint
   - Solution: Check user role (Admin/Manager required)

3. **Validation Errors (400):**
   - Missing required fields
   - Invalid date format
   - End date before start date
   - Solution: Validate input before sending

4. **Not Found Errors (404):**
   - Leave request doesn't exist
   - Solution: Check request_no is correct

5. **Server Errors (500):**
   - Internal server issues
   - Solution: Retry or contact support

---

## 📊 **Status Values**

| Status | Description | Color Suggestion |
|--------|-------------|------------------|
| `pending` | Awaiting approval | 🟡 Yellow/Orange |
| `approved` | Request approved | 🟢 Green |
| `rejected` | Request rejected | 🔴 Red |

---

## 🎯 **Best Practices**

1. **Always include Authorization header** with JWT token
2. **Validate dates** before sending (end_date > start_date)
3. **Handle all error responses** gracefully
4. **Show loading states** during API calls
5. **Refresh data** after create/update/delete operations
6. **Use proper date format** (YYYY-MM-DD)
7. **Make reason field optional** in UI forms
8. **Check user permissions** before showing process buttons

---

## 🔧 **Testing**

### **Test with cURL:**

```bash
# Create leave request
curl -X POST "http://localhost:3000/api/leave-requests" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_name": "John Doe",
    "department": "IT Department",
    "leave_type": "Sickness leave",
    "start_date": "2025-01-23",
    "end_date": "2025-01-25",
    "reason": "Medical appointment"
  }'

# Get all leave requests
curl -X GET "http://localhost:3000/api/leave-requests" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Process leave request
curl -X PATCH "http://localhost:3000/api/leave-requests/LR-123/process" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "processed_by": "Manager Name"
  }'
```

This guide provides everything needed to implement complete leave request functionality in the UI! 🎉
