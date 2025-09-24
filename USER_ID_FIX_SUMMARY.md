# User ID Fix - Leave Request Controller

## ✅ **Problem Fixed**

**Issue**: `user_id` was required in request body but was `undefined`
**Root Cause**: Controller was trying to get `user_id` from `req.body` instead of JWT token

## 🔧 **Changes Made**

### **1. Updated Controller Logic**
- **Before**: `const { user_id } = req.body;` ❌
- **After**: `const user_id = req.user.user_id;` ✅

### **2. Added Input Validation**
- Validates required fields before processing
- Validates date format before creating LeaveRequest
- Provides clear error messages

### **3. Enhanced Error Handling**
- Better error messages for missing fields
- Date format validation with examples
- Proper HTTP status codes

## 📋 **Updated Request Format**

### **✅ Correct Request Body (No user_id needed):**
```json
{
  "employee_name": "John Doe",
  "department": "IT Department",
  "leave_type": "Sickness leave",
  "start_date": "2025-01-23",
  "end_date": "2025-01-25",
  "reason": "Medical appointment"  // Optional
}
```

### **❌ Old Incorrect Format (user_id in body):**
```json
{
  "employee_name": "John Doe",
  "department": "IT Department",
  "leave_type": "Sickness leave",
  "start_date": "2025-01-23",
  "end_date": "2025-01-25",
  "reason": "Medical appointment",
  "user_id": "some-id"  // ❌ Don't include this
}
```

## 🧪 **Testing**

### **Test Case 1: Valid Request**
```bash
curl -X POST "http://localhost:3000/api/leave-requests" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_name": "John Doe",
    "department": "IT Department",
    "leave_type": "Sickness leave",
    "start_date": "2025-01-23",
    "end_date": "2025-01-25",
    "reason": "Medical appointment"
  }'
```

### **Test Case 2: Missing Required Fields**
```bash
curl -X POST "http://localhost:3000/api/leave-requests" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_name": "John Doe",
    "start_date": "2025-01-23",
    "end_date": "2025-01-25"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Missing required fields",
  "required": ["employee_name", "department", "leave_type", "start_date", "end_date"]
}
```

### **Test Case 3: Invalid Date Format**
```bash
curl -X POST "http://localhost:3000/api/leave-requests" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_name": "John Doe",
    "department": "IT Department",
    "leave_type": "Sickness leave",
    "start_date": "invalid-date",
    "end_date": "2025-01-25"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid date format. Use ISO format (YYYY-MM-DD)",
  "example": "2025-01-23"
}
```

## ✅ **Expected Success Response**

```json
{
  "success": true,
  "message": "Leave request created successfully",
  "data": {
    "request_no": "LR-1737624123456-abc123def",
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

## 🎯 **Key Points**

1. **✅ user_id is automatically extracted from JWT token**
2. **✅ No need to include user_id in request body**
3. **✅ reason field is optional**
4. **✅ Better validation and error messages**
5. **✅ Proper date format validation**

## 🔐 **Authentication Required**

The endpoint requires a valid JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

The `user_id` will be automatically extracted from this token.
