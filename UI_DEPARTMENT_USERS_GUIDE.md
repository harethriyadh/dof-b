# UI Guide: Get Users by Department

## 🎯 **Overview**
This guide provides the UI agent with all the necessary endpoints and examples to retrieve users filtered by specific departments and other criteria.

## 🔗 **Available Endpoints**

### **Base URL**
```
http://localhost:3000/api/auth
```

---

## **1. Get All Departments**
**Endpoint:** `GET /api/auth/departments`

**Purpose:** Get a list of all departments with user counts

**Headers Required:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response Example:**
```json
{
  "success": true,
  "message": "All departments retrieved successfully",
  "data": {
    "total_departments": 3,
    "departments": [
      {
        "department": "قسم تقنية المعلومات",
        "user_count": 5
      },
      {
        "department": "قسم الموارد البشرية", 
        "user_count": 3
      },
      {
        "department": "قسم المحاسبة",
        "user_count": 2
      }
    ]
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/auth/departments" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## **2. Get Users by Specific Department**
**Endpoint:** `GET /api/auth/departments/{department_name}/users`

**Purpose:** Get all users from a specific department

**Headers Required:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters:**
- `department_name` - The exact department name (case-insensitive)

**Response Example:**
```json
{
  "success": true,
  "message": "Users from قسم تقنية المعلومات department retrieved successfully",
  "data": {
    "department": "قسم تقنية المعلومات",
    "count": 5,
    "users": [
      {
        "user_id": "user_001",
        "username": "ahmed_ali",
        "full_name": "أحمد محمد العلي",
        "phone": "1234567890",
        "college": "كلية الهندسة",
        "department": "قسم تقنية المعلومات",
        "administrative_position": "مطور أول",
        "degree": "بكالوريوس",
        "gender": "male",
        "role": "employee",
        "leave_balances": [],
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

**cURL Examples:**
```bash
# Get users from IT department
curl -X GET "http://localhost:3000/api/auth/departments/قسم تقنية المعلومات/users" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Get users from HR department  
curl -X GET "http://localhost:3000/api/auth/departments/قسم الموارد البشرية/users" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# URL encoding for special characters (if needed)
curl -X GET "http://localhost:3000/api/auth/departments/%D9%82%D8%B3%D9%85%20%D8%AA%D9%82%D9%86%D9%8A%D8%A9%20%D8%A7%D9%84%D9%85%D8%B9%D9%84%D9%88%D9%85%D8%A7%D8%AA/users" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## **3. Get Users with Advanced Filters**
**Endpoint:** `GET /api/auth/users`

**Purpose:** Get users with multiple filter options and pagination

**Headers Required:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Query Parameters:**
- `department` - Filter by department name (optional)
- `role` - Filter by role: employee, manager, admin (optional)
- `college` - Filter by college name (optional)
- `gender` - Filter by gender: male, female (optional)
- `page` - Page number for pagination (default: 1)
- `limit` - Number of users per page (default: 10)

**Response Example:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "user_id": "user_001",
        "username": "ahmed_ali",
        "full_name": "أحمد محمد العلي",
        "department": "قسم تقنية المعلومات",
        "role": "employee",
        "gender": "male"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_users": 25,
      "users_per_page": 10,
      "has_next_page": true,
      "has_prev_page": false
    },
    "filters_applied": {
      "department": "قسم تقنية المعلومات",
      "role": "employee"
    }
  }
}
```

**cURL Examples:**
```bash
# Get all users from IT department
curl -X GET "http://localhost:3000/api/auth/users?department=قسم تقنية المعلومات" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get managers from HR department
curl -X GET "http://localhost:3000/api/auth/users?department=قسم الموارد البشرية&role=manager" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get female employees with pagination
curl -X GET "http://localhost:3000/api/auth/users?gender=female&role=employee&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get users from Engineering college, IT department
curl -X GET "http://localhost:3000/api/auth/users?college=كلية الهندسة&department=قسم تقنية المعلومات" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## **🔧 JavaScript/Frontend Examples**

### **React/JavaScript Implementation**

```javascript
// Get all departments
const fetchDepartments = async (token) => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/departments', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.success) {
      return data.data.departments;
    }
    throw new Error(data.message);
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

// Get users by department
const fetchUsersByDepartment = async (token, departmentName) => {
  try {
    const encodedDept = encodeURIComponent(departmentName);
    const response = await fetch(`http://localhost:3000/api/auth/departments/${encodedDept}/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.success) {
      return data.data.users;
    }
    throw new Error(data.message);
  } catch (error) {
    console.error('Error fetching users by department:', error);
    throw error;
  }
};

// Get users with filters
const fetchUsersWithFilters = async (token, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });
    
    const response = await fetch(`http://localhost:3000/api/auth/users?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.success) {
      return data.data;
    }
    throw new Error(data.message);
  } catch (error) {
    console.error('Error fetching users with filters:', error);
    throw error;
  }
};

// Usage Examples
const token = localStorage.getItem('authToken');

// Example 1: Load departments for dropdown
fetchDepartments(token)
  .then(departments => {
    console.log('Available departments:', departments);
    // Populate dropdown with departments
  });

// Example 2: Get users from specific department
fetchUsersByDepartment(token, 'قسم تقنية المعلومات')
  .then(users => {
    console.log('IT Department users:', users);
    // Display users in UI
  });

// Example 3: Advanced filtering
fetchUsersWithFilters(token, {
  department: 'قسم تقنية المعلومات',
  role: 'employee',
  page: 1,
  limit: 10
}).then(result => {
  console.log('Filtered users:', result.users);
  console.log('Pagination info:', result.pagination);
});
```

---

## **🎨 UI Implementation Examples**

### **Department Selector Component**
```jsx
import React, { useState, useEffect } from 'react';

const DepartmentUserSelector = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const token = localStorage.getItem('authToken');

  // Load departments on component mount
  useEffect(() => {
    fetchDepartments(token)
      .then(setDepartments)
      .catch(console.error);
  }, []);

  // Load users when department changes
  useEffect(() => {
    if (selectedDepartment) {
      setLoading(true);
      fetchUsersByDepartment(token, selectedDepartment)
        .then(setUsers)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedDepartment]);

  return (
    <div className="department-user-selector">
      <div className="department-dropdown">
        <label htmlFor="department-select">اختر القسم:</label>
        <select 
          id="department-select"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          <option value="">-- اختر القسم --</option>
          {departments.map((dept) => (
            <option key={dept.department} value={dept.department}>
              {dept.department} ({dept.user_count} موظف)
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="loading">جاري التحميل...</div>}

      {users.length > 0 && (
        <div className="users-list">
          <h3>موظفو {selectedDepartment}</h3>
          <div className="users-grid">
            {users.map((user) => (
              <div key={user.user_id} className="user-card">
                <h4>{user.full_name}</h4>
                <p>المنصب: {user.administrative_position || 'غير محدد'}</p>
                <p>الدرجة: {user.degree}</p>
                <p>الدور: {user.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## **⚠️ Important Notes**

1. **Authentication Required**: All endpoints require JWT token
2. **Case Insensitive**: Department names are matched case-insensitively
3. **URL Encoding**: Use `encodeURIComponent()` for Arabic department names
4. **Pagination**: Use `page` and `limit` parameters for large datasets
5. **Error Handling**: Always handle network errors and invalid responses

---

## **🧪 Testing the Endpoints**

```bash
# 1. First login to get token
TOKEN=$(curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}' \
  | jq -r '.data.token')

# 2. Get all departments
curl -X GET "http://localhost:3000/api/auth/departments" \
  -H "Authorization: Bearer $TOKEN"

# 3. Get users from specific department
curl -X GET "http://localhost:3000/api/auth/departments/قسم تقنية المعلومات/users" \
  -H "Authorization: Bearer $TOKEN"

# 4. Get filtered users
curl -X GET "http://localhost:3000/api/auth/users?department=قسم تقنية المعلومات&role=employee" \
  -H "Authorization: Bearer $TOKEN"
```

---

## **✅ Summary**

You now have **3 powerful endpoints** to retrieve users by department:

1. **`GET /departments`** - List all departments with counts
2. **`GET /departments/{name}/users`** - Get users from specific department  
3. **`GET /users`** - Advanced filtering with pagination

These endpoints provide flexible user retrieval based on departments and other criteria! 🚀
