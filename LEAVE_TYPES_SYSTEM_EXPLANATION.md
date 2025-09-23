# Leave Types System Explanation

## 🎯 **What is the "leavetypes" system for?**

The **Leave Types** system is the **foundation** of your leave management system. It defines the **rules, policies, and configurations** for each type of leave that employees can request.

## 🏗️ **System Architecture**

```
Leave Types (Configuration) → Leave Requests (Applications) → Leave Consumption (Tracking)
```

## 📋 **Core Purpose**

### **1. Define Leave Policies**
The Leave Types system stores the **business rules** for each leave type:

- **Sickness leave**: 35 days/year, requires medical proof
- **Day off**: 2 days/month, accumulates if unused
- **Educational leave**: 1-15 days paid, 16+ unpaid
- **Mirage leave**: 14 days, once per lifetime
- **Maternity leave**: 51 days, once per lifetime
- **Giving Birth**: 21 days, once per lifetime
- **Hajj & Umrah**: 20 days, once per lifetime

### **2. Validation Rules**
When employees submit leave requests, the system uses Leave Types to:

- ✅ **Validate** if the requested days are within allowed limits
- ✅ **Check** if the employee has sufficient balance
- ✅ **Verify** if proof is required
- ✅ **Calculate** payment status (paid/unpaid)
- ✅ **Enforce** frequency rules (monthly, once per lifetime, etc.)

### **3. Business Logic Engine**
The Leave Types system acts as a **configuration engine** that:

- **Controls** how many days an employee can take
- **Determines** when leave expires or accumulates
- **Sets** proof requirements
- **Defines** payment policies
- **Manages** frequency restrictions

## 🔄 **How It Works in Practice**

### **Step 1: Employee Requests Leave**
```javascript
// Employee submits a leave request
{
  "leave_type": "Sickness leave",
  "start_date": "2025-01-15",
  "end_date": "2025-01-20",
  "reason": "Flu symptoms"
}
```

### **Step 2: System Validates Against Leave Types**
```javascript
// System checks the Leave Type configuration
const leaveType = await LeaveType.findOne({ name: "Sickness leave" });

// Validates:
// - Is it within 35 days limit?
// - Does employee have balance?
// - Is proof required?
// - Is it paid or unpaid?
```

### **Step 3: System Applies Business Rules**
```javascript
// System applies the rules from Leave Type
if (requestedDays > leaveType.duration_rules[0].max_days) {
  return "Exceeds maximum allowed days";
}

if (leaveType.requires_proof && !hasProof) {
  return "Medical certificate required";
}

if (leaveType.frequency.type === "once_per_lifetime" && alreadyUsed) {
  return "Already used this leave type";
}
```

## 🎛️ **Key Components**

### **1. Duration Rules**
```javascript
duration_rules: [
  {
    "min_days": 1,
    "max_days": 35,
    "payment_status": "paid"
  }
]
```
- **Controls** minimum and maximum days allowed
- **Defines** payment status for different ranges

### **2. Frequency Rules**
```javascript
frequency: {
  "type": "limited_per_lifetime",
  "limit": 35,
  "days_per_period": 35
}
```
- **monthly**: 2 days per month, accumulates
- **once_per_lifetime**: Can only be used once
- **limited_per_lifetime**: Limited total days per year

### **3. Balance Rules**
```javascript
balance_rules: {
  "is_accumulative": true,
  "expires": false
}
```
- **is_accumulative**: Unused days carry over
- **expires**: Days expire at year end

### **4. Proof Requirements**
```javascript
requires_proof: true
```
- **true**: Requires medical certificate/documentation
- **false**: No proof needed

## 🔗 **Integration with Other Systems**

### **1. Leave Requests**
- **References** leave_type field
- **Validates** against Leave Type rules
- **Applies** business logic

### **2. User Leave Balances**
- **Calculates** available days based on Leave Type rules
- **Tracks** consumption against limits
- **Manages** accumulation and expiration

### **3. Leave Consumption Records**
- **Records** actual days consumed
- **Updates** remaining balances
- **Tracks** usage patterns

## 💼 **Business Benefits**

### **1. Policy Management**
- **Centralized** leave policy configuration
- **Easy** to update rules without code changes
- **Consistent** application across the system

### **2. Compliance**
- **Ensures** employees follow company policies
- **Prevents** abuse of leave system
- **Maintains** legal compliance

### **3. Flexibility**
- **Easy** to add new leave types
- **Simple** to modify existing rules
- **Scalable** for different departments

## 🎯 **Real-World Example**

### **Scenario: Employee requests 5 days of sick leave**

1. **System looks up "Sickness leave" in Leave Types**
2. **Checks**: Is 5 days within 1-35 day limit? ✅
3. **Checks**: Does employee have 5 days balance? ✅
4. **Checks**: Is proof required? ✅ (asks for medical certificate)
5. **Checks**: Is it paid? ✅
6. **Checks**: Has employee used this leave before? ✅ (within yearly limit)
7. **Approves** the request and deducts 5 days from balance

## 🚀 **Why This System is Essential**

Without Leave Types, your system would be **hardcoded** and **inflexible**. With Leave Types:

- ✅ **HR can modify** leave policies without developer help
- ✅ **Different departments** can have different rules
- ✅ **Compliance** is automatically enforced
- ✅ **Reporting** is accurate and consistent
- ✅ **System is scalable** and maintainable

## 📊 **Summary**

The Leave Types system is the **brain** of your leave management system. It:

- **Defines** what leave types exist
- **Sets** the rules for each type
- **Validates** employee requests
- **Enforces** company policies
- **Manages** balances and limits
- **Ensures** compliance and consistency

**Without it, you'd have no way to control or manage leave policies!**
