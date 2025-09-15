# DOF Authentication API - Complete Endpoint Documentation

## 🚀 Base URL
```
http://localhost:3000
```

## 📋 Available Endpoints

### 1. Health Check
**GET** `/health`
- **Description**: Check if the server is running and healthy
- **Authentication**: None required
- **Response**: Server status and timestamp

**Example Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-09-01T09:47:32.853Z"
}
```

---

### 2. API Documentation
**GET** `/`
- **Description**: Get API documentation and available endpoints
- **Authentication**: None required
- **Response**: API overview and endpoint list

**Example Response:**
```json
{
  "success": true,
  "message": "DOF Authentication API",
  "version": "1.0.0",
  "endpoints": {
    "auth": {
      "register": "POST /api/auth/register",
      "login": "POST /api/auth/login",
      "profile": "GET /api/auth/profile",
      "updateProfile": "PUT /api/auth/profile"
    },
    "health": "GET /health"
  }
}
```

---

### 3. User Registration
**POST** `/api/auth/register`
- **Description**: Register a new user account
- **Authentication**: None required
- **Content-Type**: `application/json`

**Request Body:**
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

**Field Requirements:**
- `fullName`: String (2-50 characters, required)
- `username`: String (3-30 characters, unique, lowercase, alphanumeric + underscore only)
- `password`: String (minimum 6 characters, required)
- `role`: String (optional, enum: ['Super Admin', 'Admin', 'Manager', 'Employee'], default: 'Employee')
- `departmentId`: Number (positive integer, required)
- `collegeId`: Number (positive integer, required)

**Success Response (201):**
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

**Error Responses:**
- `400`: Validation errors
- `409`: Username already exists
- `500`: Internal server error

---

### 4. User Login
**POST** `/api/auth/login`
- **Description**: Authenticate user and get JWT token
- **Authentication**: None required
- **Content-Type**: `application/json`

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Field Requirements:**
- `username`: String (required)
- `password`: String (required)

**Success Response (200):**
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

**Error Responses:**
- `400`: Validation errors
- `401`: Invalid credentials
- `500`: Internal server error

---

### 5. Get User Profile
**GET** `/api/auth/profile`
- **Description**: Get current user profile information
- **Authentication**: Required (JWT token)
- **Headers**: `Authorization: Bearer <token>`

**Success Response (200):**
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

**Error Responses:**
- `401`: Token missing, invalid, or expired
- `500`: Internal server error

---

### 6. Update User Profile
**PUT** `/api/auth/profile`
- **Description**: Update current user profile information
- **Authentication**: Required (JWT token)
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`

**Request Body (all fields optional):**
```json
{
  "fullName": "John Smith",
  "role": "Manager",
  "departmentId": 2,
  "collegeId": 1
}
```

**Field Requirements:**
- `fullName`: String (2-50 characters, optional)
- `role`: String (enum: ['Super Admin', 'Admin', 'Manager', 'Employee'], optional)
- `departmentId`: Number (positive integer, optional)
- `collegeId`: Number (positive integer, optional)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "68b56bd36c975454474cb450",
      "fullName": "John Smith",
      "username": "johndoe",
      "role": "Manager",
      "departmentId": 2,
      "collegeId": 1,
      "createdAt": "2025-09-01T09:48:03.307Z",
      "updatedAt": "2025-09-01T09:49:40.234Z",
      "__v": 0
    }
  }
}
```

**Error Responses:**
- `400`: Validation errors
- `401`: Token missing, invalid, or expired
- `404`: User not found
- `500`: Internal server error

---

## 🔐 Authentication

### JWT Token Format
- **Header**: `Authorization: Bearer <token>`
- **Token Expiry**: 7 days
- **Token Format**: JWT (JSON Web Token)

### Protected Endpoints
The following endpoints require valid JWT authentication:
- `GET /api/auth/profile`
- `PUT /api/auth/profile`

---

## 📝 Testing with Postman

### 1. Import Collection
1. Download the `DOF_Auth_API.postman_collection.json` file
2. Open Postman
3. Click "Import" and select the file
4. The collection will be imported with all endpoints

### 2. Set Environment Variables
The collection uses these variables:
- `{{base_url}}`: `http://localhost:3000`
- `{{auth_token}}`: Automatically set after login (managed by test script)

### 3. Testing Flow
1. **Start Server**: Run `npm run dev` in your project
2. **Health Check**: Test `/health` endpoint first
3. **Register User**: Use registration endpoint to create a test user
4. **Login**: Use login endpoint to get JWT token
5. **Test Protected Endpoints**: Use profile endpoints with the token

### 4. Test Data Examples

#### Employee Registration
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

#### Admin Registration
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

#### Manager Registration
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

---

## 🚨 Error Handling

### Common Error Responses

#### Validation Error (400)
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

#### Authentication Error (401)
```json
{
  "success": false,
  "message": "Access token required"
}
```

#### Duplicate Username (409)
```json
{
  "success": false,
  "message": "Username already exists"
}
```

#### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🔧 Development Notes

### Server Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

### Environment Variables
Create a `.env` file with:
```
MONGODB_URI=mongodb+srv://unicn12012:12341234@dof.uspodzr.mongodb.net/?retryWrites=true&w=majority&appName=dof
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
PORT=3000
NODE_ENV=development
```

### Database Schema
The API uses MongoDB with the exact user schema you provided, including:
- Automatic password hashing
- Timestamps (createdAt, updatedAt)
- Role-based access control
- Input validation and sanitization
