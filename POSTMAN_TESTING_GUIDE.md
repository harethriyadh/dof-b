# 🧪 Postman Testing Guide - DOF Authentication API

## 📋 **Complete Test Data & Login Information**

### 🚀 **Quick Start**
1. **Import Collection**: `DOF_Auth_API.postman_collection.json`
2. **Server URL**: `http://localhost:3000`
3. **Start Server**: `npm run dev` or `npm start`

---

## 🔐 **User Registration Test Data**

### **1. Employee User**
```json
{
  "fullName": "John Doe",
  "username": "johndoe",
  "password": "password123",
  "role": "Employee",
  "departmentId": 1,
  "collegeId": 1
}
```

### **2. Admin User**
```json
{
  "fullName": "Admin User",
  "username": "adminuser",
  "password": "admin123",
  "role": "Admin",
  "departmentId": 1,
  "collegeId": 1
}
```

### **3. Manager User**
```json
{
  "fullName": "Manager User",
  "username": "manageruser",
  "password": "manager123",
  "role": "Manager",
  "departmentId": 2,
  "collegeId": 1
}
```

### **4. Super Admin User**
```json
{
  "fullName": "Super Admin User",
  "username": "superadmin",
  "password": "super123",
  "role": "Super Admin",
  "departmentId": 1,
  "collegeId": 1
}
```

---

## 🔑 **User Login Test Data**

### **1. Employee Login**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

### **2. Admin Login**
```json
{
  "username": "adminuser",
  "password": "admin123"
}
```

### **3. Manager Login**
```json
{
  "username": "manageruser",
  "password": "manager123"
}
```

### **4. Super Admin Login**
```json
{
  "username": "superadmin",
  "password": "super123"
}
```

---

## 📝 **Step-by-Step Testing Flow**

### **Phase 1: Basic Setup & Health Check**
1. **Health Check** → `GET /health`
   - Expected: `200 OK` with server status
   - Verify server is running

2. **API Documentation** → `GET /`
   - Expected: `200 OK` with endpoint list
   - Verify all endpoints are documented

### **Phase 2: User Registration**
1. **Register Employee** → `POST /api/auth/register`
   - Use Employee User data above
   - Expected: `201 Created` with user data + JWT token
   - **Save the JWT token** for later use

2. **Register Admin** → `POST /api/auth/register`
   - Use Admin User data above
   - Expected: `201 Created` with user data + JWT token

3. **Register Manager** → `POST /api/auth/register`
   - Use Manager User data above
   - Expected: `201 Created` with user data + JWT token

4. **Register Super Admin** → `POST /api/auth/register`
   - Use Super Admin User data above
   - Expected: `201 Created` with user data + JWT token

### **Phase 3: User Login**
1. **Login Employee** → `POST /api/auth/login`
   - Use Employee Login data above
   - Expected: `200 OK` with user data + JWT token
   - **Save the JWT token** for profile testing

2. **Login Admin** → `POST /api/auth/login`
   - Use Admin Login data above
   - Expected: `200 OK` with user data + JWT token

3. **Login Manager** → `POST /api/auth/login`
   - Use Manager Login data above
   - Expected: `200 OK` with user data + JWT token

4. **Login Super Admin** → `POST /api/auth/login`
   - Use Super Admin Login data above
   - Expected: `200 OK` with user data + JWT token

### **Phase 4: Profile Management (Protected Endpoints)**
1. **Get Employee Profile** → `GET /api/auth/profile`
   - Headers: `Authorization: Bearer <employee_token>`
   - Expected: `200 OK` with employee profile data

2. **Update Employee Profile** → `PUT /api/auth/profile`
   - Headers: `Authorization: Bearer <employee_token>`
   - Body: Update role to "Manager"
   - Expected: `200 OK` with updated profile

3. **Get Admin Profile** → `GET /api/auth/profile`
   - Headers: `Authorization: Bearer <admin_token>`
   - Expected: `200 OK` with admin profile data

4. **Update Admin Profile** → `PUT /api/auth/profile`
   - Headers: `Authorization: Bearer <admin_token>`
   - Body: Update departmentId to 2
   - Expected: `200 OK` with updated profile

### **Phase 5: Error Testing**
1. **Test Validation Errors** → `POST /api/auth/register`
   - Use invalid data (empty fields, short password, invalid role)
   - Expected: `400 Bad Request` with validation errors

2. **Test Duplicate Username** → `POST /api/auth/register`
   - Try to register with existing username
   - Expected: `409 Conflict` with "Username already exists"

3. **Test Invalid Login** → `POST /api/auth/login`
   - Use wrong password or non-existent username
   - Expected: `401 Unauthorized` with "Invalid credentials"

4. **Test Profile Without Token** → `GET /api/auth/profile`
   - No Authorization header
   - Expected: `401 Unauthorized` with "Access token required"

5. **Test Profile with Invalid Token** → `GET /api/auth/profile`
   - Headers: `Authorization: Bearer invalid_token`
   - Expected: `401 Unauthorized` with "Invalid token"

---

## 🔧 **Postman Environment Variables**

### **Automatic Variables (Set by Test Scripts)**
- `{{auth_token}}` - Automatically set after successful login
- `{{base_url}}` - Set to `http://localhost:3000`

### **Manual Variables (Optional)**
- `{{employee_token}}` - Employee JWT token
- `{{admin_token}}` - Admin JWT token
- `{{manager_token}}` - Manager JWT token
- `{{superadmin_token}}` - Super Admin JWT token

---

## 📊 **Expected Response Examples**

### **Successful Registration Response (201)**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "68b56bd36c975454474cb450",
      "fullName": "John Doe",
      "username": "johndoe",
      "role": "Employee",
      "departmentId": 1,
      "collegeId": 1,
      "createdAt": "2025-09-01T09:48:03.307Z",
      "updatedAt": "2025-09-01T09:48:03.307Z",
      "__v": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **Successful Login Response (200)**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "68b56bd36c975454474cb450",
      "fullName": "John Doe",
      "username": "johndoe",
      "role": "Employee",
      "departmentId": 1,
      "collegeId": 1,
      "createdAt": "2025-09-01T09:48:03.307Z",
      "updatedAt": "2025-09-01T09:48:03.307Z",
      "__v": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **Profile Response (200)**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "_id": "68b56bd36c975454474cb450",
      "fullName": "John Doe",
      "username": "johndoe",
      "role": "Employee",
      "departmentId": 1,
      "collegeId": 1,
      "createdAt": "2025-09-01T09:48:03.307Z",
      "updatedAt": "2025-09-01T09:48:03.307Z",
      "__v": 0
    }
  }
}
```

---

## 🚨 **Common Error Responses**

### **Validation Error (400)**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "fullName",
      "message": "Full name must be between 2 and 50 characters"
    },
    {
      "field": "username",
      "message": "Username must be between 3 and 30 characters"
    }
  ]
}
```

### **Authentication Error (401)**
```json
{
  "success": false,
  "message": "Access token required"
}
```

### **Duplicate Username (409)**
```json
{
  "success": false,
  "message": "Username already exists"
}
```

---

## 💡 **Testing Tips**

1. **Token Management**: Postman automatically saves JWT tokens after login
2. **Environment Variables**: Use `{{auth_token}}` for protected endpoints
3. **Response Validation**: Check both HTTP status codes and response body
4. **Error Testing**: Test both valid and invalid scenarios
5. **Token Expiry**: JWT tokens expire after 7 days
6. **Password Security**: All passwords are automatically hashed

---

## 🔍 **Troubleshooting**

### **Server Not Starting**
- Check if port 3000 is available
- Run `pkill -f "node server.js"` to kill existing processes
- Check MongoDB connection

### **Authentication Fails**
- Verify JWT token is valid and not expired
- Check Authorization header format: `Bearer <token>`
- Ensure token was saved after login

### **Validation Errors**
- Check field requirements (length, format, required fields)
- Verify role values match enum: ['Super Admin', 'Admin', 'Manager', 'Employee']
- Ensure departmentId and collegeId are positive integers

---

## 📱 **Mobile/API Client Testing**

### **cURL Examples**
```bash
# Register User
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe","username":"johndoe","password":"password123","role":"Employee","departmentId":1,"collegeId":1}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","password":"password123"}'

# Get Profile (with token)
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3000/api/auth/profile
```

### **JavaScript/Fetch Examples**
```javascript
// Login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'johndoe',
    password: 'password123'
  })
});

const loginData = await loginResponse.json();
const token = loginData.data.token;

// Get Profile
const profileResponse = await fetch('http://localhost:3000/api/auth/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Test: Get Profile
- Set method to GET
- URL: http://localhost:3000/api/auth/profile or http://localhost:3001/api/v1/profile (depending on server)
- Headers:
  - Authorization: Bearer <JWT from login>
- Expect 200 with body:
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "profile": {
      "name": "John Doe",
      "phone": "+15551234567",
      "specialist": "Computer Science",
      "department": "IT",
      "college": "Engineering College"
    }
  }
}



