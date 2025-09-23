# Profile Endpoints - Complete Guide

## 🚀 Base URL
```
http://localhost:3000
```

## 📋 Profile-Related Endpoints

### 1. **GET User Profile**
**GET** `/api/auth/profile`

**Description**: Retrieve current user's complete profile information

**Authentication**: Required (JWT token)

**Headers**:
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "user_id": "68d1213568d5c6a122bf7047",
      "username": "johndoe",
      "full_name": "John Doe",
      "phone": "+1234567890",
      "college": "Engineering College",
      "department": "Computer Science",
      "specialist": "Software Development",
      "gender": "male",
      "role": "employee",
      "leave_balances": [
        {
          "leave_type_id": "sick_001",
          "available_days": 35,
          "one_time_used": false
        }
      ],
      "createdAt": "2025-01-23T09:16:15.155Z",
      "updatedAt": "2025-01-23T09:16:15.155Z"
    }
  }
}
```

**Error Responses**:
- `401`: Unauthorized (missing or invalid token)
- `500`: Internal server error

---

### 2. **UPDATE User Profile**
**PUT** `/api/auth/profile`

**Description**: Update current user's profile information

**Authentication**: Required (JWT token)

**Headers**:
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "full_name": "John Smith",
  "phone": "+1234567890",
  "specialist": "Data Science",
  "college": "Business College",
  "department": "Information Technology",
  "gender": "male",
  "role": "manager",
  "leave_balances": [
    {
      "leave_type_id": "sick_001",
      "available_days": 35,
      "one_time_used": false
    },
    {
      "leave_type_id": "dayoff_001",
      "available_days": 24,
      "one_time_used": false
    }
  ]
}
```

**Field Descriptions**:
- `full_name`: String (2-100 characters) - User's full name
- `phone`: String (7-20 characters) - Phone number
- `specialist`: String (1-100 characters) - Specialization field
- `college`: String (1-100 characters) - College name
- `department`: String (1-100 characters) - Department name
- `gender`: String (enum: "male", "female") - Gender
- `role`: String (enum: "employee", "manager", "admin") - User role
- `leave_balances`: Array - Leave balance information

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "user_id": "68d1213568d5c6a122bf7047",
      "username": "johndoe",
      "full_name": "John Smith",
      "phone": "+1234567890",
      "college": "Business College",
      "department": "Information Technology",
      "specialist": "Data Science",
      "gender": "male",
      "role": "manager",
      "leave_balances": [
        {
          "leave_type_id": "sick_001",
          "available_days": 35,
          "one_time_used": false
        }
      ],
      "createdAt": "2025-01-23T09:16:15.155Z",
      "updatedAt": "2025-01-23T10:30:45.123Z"
    }
  }
}
```

**Error Responses**:
- `400`: Validation errors
- `401`: Unauthorized (missing or invalid token)
- `404`: User not found
- `500`: Internal server error

---

## 🔐 Authentication Details

### JWT Token Requirements
- **Format**: `Authorization: Bearer <token>`
- **Expiry**: 7 days
- **Required for**: Both profile endpoints

### Getting a Token
1. **Register**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login`
3. **Use token**: Include in Authorization header

---

## 📝 Testing Examples

### 1. Get Profile (cURL)
```bash
curl -X GET "http://localhost:3000/api/auth/profile" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### 2. Update Profile (cURL)
```bash
curl -X PUT "http://localhost:3000/api/auth/profile" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Smith",
    "phone": "+1234567890",
    "department": "IT Department"
  }'
```

### 3. JavaScript/Fetch Example
```javascript
// Get Profile
const getProfile = async (token) => {
  const response = await fetch('http://localhost:3000/api/auth/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

// Update Profile
const updateProfile = async (token, profileData) => {
  const response = await fetch('http://localhost:3000/api/auth/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  });
  return await response.json();
};
```

---

## 🚨 Common Error Scenarios

### 1. Missing Token
```json
{
  "success": false,
  "message": "Access token required"
}
```

### 2. Invalid Token
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 3. Expired Token
```json
{
  "success": false,
  "message": "Token expired"
}
```

### 4. Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "full_name",
      "message": "full_name must be between 2 and 100 characters"
    }
  ]
}
```

### 5. User Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## 📊 Response Schema

### User Object Structure
```typescript
interface User {
  user_id: string;
  username: string;
  full_name: string;
  phone: string | null;
  college: string | null;
  department: string | null;
  specialist: string | null;
  gender: "male" | "female" | null;
  role: "employee" | "manager" | "admin";
  leave_balances: LeaveBalance[];
  createdAt: string;
  updatedAt: string;
}

interface LeaveBalance {
  leave_type_id: string;
  available_days: number;
  one_time_used: boolean;
}
```

---

## 🔧 Frontend Integration

### React Example
```jsx
import React, { useState, useEffect } from 'react';

const ProfileComponent = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:3000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        setProfile(data.data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>No profile data</div>;

  return (
    <div>
      <h2>Profile</h2>
      <p>Name: {profile.full_name}</p>
      <p>Username: {profile.username}</p>
      <p>Department: {profile.department}</p>
      <p>Role: {profile.role}</p>
      {/* Add more fields as needed */}
    </div>
  );
};
```

---

## 📋 Summary

### Available Profile Endpoints:
1. **GET** `/api/auth/profile` - Retrieve user profile
2. **PUT** `/api/auth/profile` - Update user profile

### Key Features:
- ✅ JWT Authentication required
- ✅ Complete user schema support
- ✅ Partial updates allowed
- ✅ Validation and error handling
- ✅ Leave balances management
- ✅ Role-based access control

### Use Cases:
- User profile display
- Profile editing
- Account management
- Leave balance tracking
- User information updates
