# DOF Authentication API

A Node.js API for user authentication with login and registration endpoints using MongoDB and JWT.

## Features

- User registration with validation
- User login with JWT authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation
- Error handling
- MongoDB integration

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=mongodb+srv://unicn12012:12341234@dof.uspodzr.mongodb.net/?retryWrites=true&w=majority&appName=dof
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
PORT=3000
NODE_ENV=development
```

3. Start the server:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Body:**
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

#### Login User
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

#### Get User Profile
- **GET** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`

#### Update User Profile
- **PUT** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "fullName": "John Smith",
  "role": "Manager",
  "departmentId": 2,
  "collegeId": 1
}
```

### Other Endpoints

#### Health Check
- **GET** `/health`

#### API Documentation
- **GET** `/`

## User Schema

```javascript
{
  fullName: String (required, 2-50 characters),
  username: String (required, unique, 3-30 characters, lowercase),
  password: String (required, min 6 characters),
  role: String (enum: ['Super Admin', 'Admin', 'Manager', 'Employee'], default: 'Employee'),
  departmentId: Number (required, positive integer),
  collegeId: Number (required, positive integer),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens expire after 7 days.

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Only for validation errors
}
```

## Success Responses

All success responses follow this format:

```json
{
  "success": true,
  "message": "Success description",
  "data": {} // Response data
}
```

## Development

- The server runs on port 3000 by default
- MongoDB connection is configured to use the provided connection string
- JWT secret should be changed in production
- All passwords are automatically hashed before saving to the database